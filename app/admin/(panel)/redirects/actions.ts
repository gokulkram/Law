"use server";

import { revalidatePath, updateTag } from "next/cache";
import { staffFor } from "@/lib/admin/auth";
import { upsertRedirect } from "@/lib/admin/redirects";
import { CONTENT_TAG } from "@/lib/content-store";
import { createClient } from "@/lib/supabase/server";

// `values` = what was submitted, sent back on an error so the form can show it again.
export type RedirectState = { error?: string; message?: string; values?: { source: string; destination: string; permanent: boolean } } | undefined;

export async function saveRedirect(_prev: RedirectState, form: FormData): Promise<RedirectState> {
  const me = await staffFor("admin", "editor");
  if (!me) return { error: "Only admins and editors can manage redirects." };
  const supabase = await createClient();
  const values = { source: String(form.get("source") || ""), destination: String(form.get("destination") || ""), permanent: form.get("permanent") !== "temporary" };
  const errors = await upsertRedirect(supabase, { id: String(form.get("id") || "") || undefined, ...values }, me.id);
  if (errors.length) return { error: errors.join(" "), values };
  updateTag(CONTENT_TAG);
  revalidatePath("/admin/redirects");
  return { message: "Saved - the redirect works right away." };
}

export async function deleteRedirect(id: string): Promise<RedirectState> {
  const me = await staffFor("admin", "editor");
  if (!me) return { error: "Only admins and editors can manage redirects." };
  const supabase = await createClient();
  const { error } = await supabase.from("redirects").delete().eq("id", id);
  if (error) return { error: error.message };
  updateTag(CONTENT_TAG);
  revalidatePath("/admin/redirects");
  return { message: "Redirect removed." };
}
