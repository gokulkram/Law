-- Attorney review is tied to the exact text that was reviewed.
--
-- A sign-off stores a hash of the draft content at that moment (reviewed_hash). From then on:
--   * review_status is computed: reviewed while the draft still matches, needs_review once it changes;
--   * published_is_reviewed says whether the LIVE text is the reviewed text - the public byline
--     ("Legal review by ...") and its structured data appear only when it is true.
-- So publishing a reviewed draft keeps the byline, and editing after sign-off can't keep showing a
-- review of text the attorney never saw. The database computes the hash; nobody can supply one.
--
-- Reviewers sign off only as their own attorney (profiles.attorney_slug, set by an admin).

alter table public.profiles add column attorney_slug text;

-- Hash of page content, ignoring the "last updated" date. jsonb's text form is canonical
-- (keys are stored sorted), so equal content always hashes the same.
create function public.content_hash(c jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select md5((c - 'updated')::text)
$$;

alter table public.pages add column reviewed_hash text;
alter table public.pages add column published_is_reviewed boolean
  generated always as (reviewed_hash is not null and published_content is not null and public.content_hash(published_content) = reviewed_hash) stored;

-- Who may change what (replaces the Phase 1 version).
create or replace function public.guard_page_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  r public.staff_role := public.current_staff_role();
  me text;
  review_cols text[] := array['review_status', 'reviewed_by', 'reviewed_at', 'reviewed_hash', 'published_is_reviewed', 'updated_by', 'updated_at'];
begin
  -- Secret-key calls (no signed-in user) and admins are not restricted.
  if r is null or r = 'admin' then
    return new;
  end if;

  if r = 'reviewer' then
    if tg_op = 'INSERT' or (to_jsonb(new) - review_cols) is distinct from (to_jsonb(old) - review_cols) then
      raise exception 'Attorney reviewers can only sign off reviews, not edit pages.' using errcode = '42501';
    end if;
    select attorney_slug into me from public.profiles where id = (select auth.uid());
    if new.reviewed_by is distinct from old.reviewed_by and new.reviewed_by is not null and new.reviewed_by is distinct from me then
      raise exception 'You can only sign off as your own attorney profile.' using errcode = '42501';
    end if;
  elsif r = 'editor' then
    if (tg_op = 'INSERT' and (new.reviewed_by is not null or new.reviewed_at is not null or new.review_status = 'reviewed'))
       or (tg_op = 'UPDATE' and (new.reviewed_by is distinct from old.reviewed_by
                                 or new.reviewed_at is distinct from old.reviewed_at
                                 or (new.review_status = 'reviewed' and old.review_status is distinct from 'reviewed'))) then
      raise exception 'Only an attorney reviewer or admin can sign off a review.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

-- Keeps reviewed_hash and review_status consistent. Runs after pages_guard (triggers fire in name order).
-- A sign-off is an update that sets review_status = 'reviewed' (from another state) or changes the
-- reviewer/date; it snapshots the current draft. Clearing reviewed_by withdraws the sign-off.
create function public.pages_review_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.reviewed_hash := case when new.reviewed_by is not null then public.content_hash(new.content) end;
  elsif new.reviewed_by is null then
    new.reviewed_hash := null;
  elsif new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at
     or (new.review_status = 'reviewed' and old.review_status is distinct from 'reviewed') then
    new.reviewed_hash := public.content_hash(new.content);
  else
    new.reviewed_hash := old.reviewed_hash;
  end if;

  new.review_status := case
    when new.reviewed_hash is null then 'not_reviewed'
    when public.content_hash(new.content) = new.reviewed_hash then 'reviewed'
    else 'needs_review'
  end::public.review_status;
  return new;
end;
$$;

create trigger pages_review before insert or update on public.pages
  for each row execute function public.pages_review_state();

-- Bring existing rows in line (all imported pages are unreviewed, so this is a no-op today).
update public.pages set reviewed_by = reviewed_by;
