import "server-only";
import { allPagesLite } from "@/lib/admin/pages";
import { normalisePath, redirectErrors, type Redirect } from "@/lib/admin/settings-model";
import { createClient } from "@/lib/supabase/server";

// Writes redirects with the signed-in user's client (RLS: admins and editors). Callers refresh the
// site (updateTag) afterwards.

type Db = Awaited<ReturnType<typeof createClient>>;

export async function listRedirects(supabase: Db): Promise<Redirect[]> {
  const { data, error } = await supabase.from("redirects").select("id, source, destination, permanent").order("source");
  if (error) throw new Error(error.message);
  return (data ?? []) as Redirect[];
}

/** Validates and saves (inserts, or updates when r.id is set). Returns error messages, or [] on success. */
export async function upsertRedirect(supabase: Db, r: Redirect, userId: string): Promise<string[]> {
  const clean: Redirect = { ...r, source: normalisePath(r.source), destination: normalisePath(r.destination) };
  const [others, pages] = await Promise.all([listRedirects(supabase), allPagesLite()]);
  const published = pages.filter((p) => p.status === "published" && p.published_content).map((p) => p.path);
  const errors = redirectErrors(clean, others, published, pages.map((p) => p.path));
  if (errors.length) return errors;
  const row = { source: clean.source, destination: clean.destination, permanent: clean.permanent, updated_by: userId };
  const { error } = clean.id
    ? await supabase.from("redirects").update(row).eq("id", clean.id)
    : await supabase.from("redirects").insert(row);
  return error ? [error.message] : [];
}
