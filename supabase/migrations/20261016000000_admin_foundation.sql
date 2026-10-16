-- Admin panel foundation: staff profiles + roles, pages (content + SEO), revisions,
-- site-wide settings, redirects and the media library.
--
-- Access model
--   * The public site reads published content on the server with the secret key, so anonymous
--     visitors get no table access at all (RLS on, no anon policies).
--   * Staff sign in with Supabase Auth. Their role lives in public.profiles and is set only by
--     an admin (server-side, secret key) - never by the user. A signed-in user with no role has
--     no access.
--   * Roles: admin (everything, incl. users and settings), editor (content, SEO, media,
--     redirects), reviewer (attorney who reads everything and signs off reviews).

-- ---------------------------------------------------------------- roles + profiles

create type public.staff_role as enum ('admin', 'editor', 'reviewer');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  -- null = signed-in account with no admin access
  role public.staff_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Role of the signed-in user, for RLS policies. security definer so it can read profiles
-- without recursing through the profiles policies.
create function public.current_staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

revoke execute on function public.current_staff_role() from public, anon;
grant execute on function public.current_staff_role() to authenticated;

-- Every new auth user gets a profile, with no role. The app sets the role right after creating
-- the user (server-side, secret key). Auth writes app_metadata after the insert, so it is usually
-- empty here; it is read only as a fallback.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    case
      when new.raw_app_meta_data ->> 'role' in ('admin', 'editor', 'reviewer')
        then (new.raw_app_meta_data ->> 'role')::public.staff_role
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- shared helpers

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- pages

-- Matches the content files: service = content/services, local = content/local (city + service),
-- location = content/locations (offices), article = content/articles (guides),
-- attorney = content/attorneys, static = hand-built pages (home, about, privacy, hubs ...).
create type public.page_type as enum ('service', 'local', 'location', 'article', 'attorney', 'static');
create type public.page_status as enum ('draft', 'published', 'archived');
create type public.review_status as enum ('not_reviewed', 'needs_review', 'reviewed');

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  -- URL path, e.g. "/car-accident-lawyer" or "/" for the home page
  path text not null unique check (path ~ '^/'),
  type public.page_type not null,
  status public.page_status not null default 'draft',
  -- Working copy edited in the admin. Shape = the TypeScript type for `type` (content/types.ts).
  content jsonb not null default '{}'::jsonb,
  -- Per-page SEO: title, description, canonical, robots, og, schema switches, sitemap ...
  seo jsonb not null default '{}'::jsonb,
  -- What the public site renders. Copied from content/seo on publish; null = never published.
  published_content jsonb,
  published_seo jsonb,
  published_at timestamptz,
  -- Attorney review. Editing legal text sets needs_review; a reviewer signs it off.
  review_status public.review_status not null default 'not_reviewed',
  reviewed_by text, -- attorney slug (content/attorneys.ts)
  reviewed_at date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create index pages_type_idx on public.pages (type, sort_order);
create index pages_status_idx on public.pages (status);

create trigger pages_updated_at before update on public.pages
  for each row execute function public.set_updated_at();

-- Column-level rules RLS can't express. Staff can call the API directly with their session, so
-- these are enforced here rather than only in Server Actions:
--   * reviewers may change only the review fields (sign-off), not content, SEO or publishing;
--   * editors may flag a page "needs_review" but never mark it reviewed or name the reviewer.
-- Calls with the secret key have no signed-in user (role null) and are not restricted.
create function public.guard_page_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  r public.staff_role := public.current_staff_role();
  review_cols text[] := array['review_status', 'reviewed_by', 'reviewed_at', 'updated_by', 'updated_at'];
begin
  if r is null or r = 'admin' then
    return new;
  end if;

  if r = 'reviewer' then
    if tg_op = 'INSERT' or (to_jsonb(new) - review_cols) is distinct from (to_jsonb(old) - review_cols) then
      raise exception 'Attorney reviewers can only sign off reviews, not edit pages.' using errcode = '42501';
    end if;
  elsif r = 'editor' then
    if new.review_status = 'reviewed' and (tg_op = 'INSERT' or old.review_status is distinct from 'reviewed')
       or (tg_op = 'INSERT' and (new.reviewed_by is not null or new.reviewed_at is not null))
       or (tg_op = 'UPDATE' and (new.reviewed_by is distinct from old.reviewed_by or new.reviewed_at is distinct from old.reviewed_at)) then
      raise exception 'Only an attorney reviewer or admin can sign off a review.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger pages_guard before insert or update on public.pages
  for each row execute function public.guard_page_write();

create table public.page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  content jsonb not null,
  seo jsonb not null,
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create index page_revisions_page_idx on public.page_revisions (page_id, created_at desc);

-- ---------------------------------------------------------------- settings, redirects, media

-- Site-wide values by key: "firm" (name, phone, email), "offices", "social", "nav",
-- "seo" (defaults, verification codes, analytics IDs), "robots".
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  source text not null unique check (source ~ '^/'),
  destination text not null,
  permanent boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create trigger redirects_updated_at before update on public.redirects
  for each row execute function public.set_updated_at();

create table public.media (
  id uuid primary key default gen_random_uuid(),
  -- object path inside the "media" storage bucket
  path text not null unique,
  alt text not null default '',
  width integer,
  height integer,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

-- ---------------------------------------------------------------- row level security

alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.page_revisions enable row level security;
alter table public.site_settings enable row level security;
alter table public.redirects enable row level security;
alter table public.media enable row level security;

-- profiles: staff can see each other (for "updated by"); everyone sees their own row.
-- Role changes and user creation happen server-side with the secret key, so no write policies.
create policy "profiles: read own or as staff" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.current_staff_role()) is not null);

-- pages
create policy "pages: staff read" on public.pages
  for select to authenticated
  using ((select public.current_staff_role()) is not null);
create policy "pages: admin/editor insert" on public.pages
  for insert to authenticated
  with check ((select public.current_staff_role()) in ('admin', 'editor'));
-- reviewers update only to sign off; which columns each role may change is enforced by guard_page_write()
create policy "pages: staff update" on public.pages
  for update to authenticated
  using ((select public.current_staff_role()) is not null)
  with check ((select public.current_staff_role()) is not null);
create policy "pages: admin delete" on public.pages
  for delete to authenticated
  using ((select public.current_staff_role()) = 'admin');

-- page_revisions: append-only history
create policy "revisions: staff read" on public.page_revisions
  for select to authenticated
  using ((select public.current_staff_role()) is not null);
create policy "revisions: staff insert" on public.page_revisions
  for insert to authenticated
  with check ((select public.current_staff_role()) is not null);

-- site_settings: admins only write
create policy "settings: staff read" on public.site_settings
  for select to authenticated
  using ((select public.current_staff_role()) is not null);
create policy "settings: admin write" on public.site_settings
  for all to authenticated
  using ((select public.current_staff_role()) = 'admin')
  with check ((select public.current_staff_role()) = 'admin');

-- redirects + media: admins and editors write
create policy "redirects: staff read" on public.redirects
  for select to authenticated
  using ((select public.current_staff_role()) is not null);
create policy "redirects: admin/editor write" on public.redirects
  for all to authenticated
  using ((select public.current_staff_role()) in ('admin', 'editor'))
  with check ((select public.current_staff_role()) in ('admin', 'editor'));

create policy "media: staff read" on public.media
  for select to authenticated
  using ((select public.current_staff_role()) is not null);
create policy "media: admin/editor write" on public.media
  for all to authenticated
  using ((select public.current_staff_role()) in ('admin', 'editor'))
  with check ((select public.current_staff_role()) in ('admin', 'editor'));

-- ---------------------------------------------------------------- storage: media bucket

-- Public bucket: images on the site are served by URL. Only admins/editors upload or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'image/gif'])
on conflict (id) do nothing;

create policy "media bucket: admin/editor insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.current_staff_role()) in ('admin', 'editor'));
create policy "media bucket: admin/editor update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.current_staff_role()) in ('admin', 'editor'));
create policy "media bucket: admin/editor delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.current_staff_role()) in ('admin', 'editor'));
