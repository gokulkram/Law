"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { staffFor } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEDIA_PREFIX } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// Media library. Files go straight from the browser to Supabase Storage with a one-time signed
// upload URL (no size limit from the app's own request handling); the storage path is chosen here,
// never from the uploaded file's name. Writes use the signed-in user's client, so the storage and
// table policies (admins + editors) apply.

export type MediaItem = { id: string; path: string; url: string; alt: string; width: number | null; height: number | null; size_bytes: number | null; created_at: string };

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" };
const MAX_BYTES = 10 * 1024 * 1024;
const PATH_RE = /^\d{4}\/\d{2}\/[0-9a-f-]{36}\.(jpg|png|webp|avif|gif)$/;
const DENIED = { error: "Only admins and editors can manage media." };


export async function prepareUpload(mime: string, size: number): Promise<{ error?: string; path?: string; token?: string }> {
  if (!(await staffFor("admin", "editor"))) return DENIED;
  const ext = TYPES[mime];
  if (!ext) return { error: "Use a JPEG, PNG, WebP, AVIF or GIF image. (SVG isn't allowed - it can contain scripts.)" };
  if (!(size > 0 && size <= MAX_BYTES)) return { error: "Images must be under 10 MB." };
  const now = new Date();
  const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${ext}`;
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("media").createSignedUploadUrl(path, { upsert: false });
  if (error || !data) return { error: error?.message ?? "Couldn't start the upload." };
  return { path, token: data.token };
}

export async function finishUpload(input: { path: string; alt: string; width: number; height: number; mime: string; size: number }): Promise<{ error?: string; item?: MediaItem }> {
  const me = await staffFor("admin", "editor");
  if (!me) return DENIED;
  if (!PATH_RE.test(input.path)) return { error: "Unexpected file path." };
  // Confirm the file really arrived (listing needs the secret key; the role was checked above).
  const dir = input.path.slice(0, input.path.lastIndexOf("/"));
  const file = input.path.slice(dir.length + 1);
  const { data: found } = await createAdminClient().storage.from("media").list(dir, { search: file, limit: 1 });
  if (!found?.some((f) => f.name === file)) return { error: "The upload didn't finish - please try again." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .insert({
      path: input.path,
      alt: input.alt.trim().slice(0, 300),
      width: Math.round(input.width) || null,
      height: Math.round(input.height) || null,
      mime_type: input.mime,
      size_bytes: Math.round(input.size) || null,
      created_by: me.id,
    })
    .select("id, path, alt, width, height, size_bytes, created_at")
    .single();
  if (error || !data) return { error: error?.message ?? "Couldn't save the image." };
  revalidatePath("/admin/media");
  return { item: { ...data, url: MEDIA_PREFIX + data.path } };
}

export async function listMedia(): Promise<MediaItem[]> {
  if (!(await staffFor())) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("media").select("id, path, alt, width, height, size_bytes, created_at").order("created_at", { ascending: false }).limit(500);
  return (data ?? []).map((m) => ({ ...m, url: MEDIA_PREFIX + m.path }));
}

export async function updateAlt(id: string, alt: string): Promise<{ error?: string; message?: string }> {
  if (!(await staffFor("admin", "editor"))) return DENIED;
  const supabase = await createClient();
  const { error } = await supabase.from("media").update({ alt: alt.trim().slice(0, 300) }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/media");
  return { message: "Saved." };
}

/** Where an image is used: pages (draft + live text and SEO), site settings, and old versions. */
export async function mediaUsage(url: string): Promise<{ live: string[]; history: number }> {
  const supabase = await createClient();
  const [pages, settings, revisions] = await Promise.all([
    supabase.from("pages").select("path, content, seo, published_content, published_seo"),
    supabase.from("site_settings").select("key, value"),
    supabase.from("page_revisions").select("id, content, seo"),
  ]);
  const has = (v: unknown) => JSON.stringify(v ?? null).includes(url);
  const live = [
    ...(pages.data ?? []).filter((p) => has([p.content, p.seo, p.published_content, p.published_seo])).map((p) => p.path),
    ...(settings.data ?? []).filter((s) => has(s.value)).map((s) => `Site settings (${s.key})`),
  ];
  return { live, history: (revisions.data ?? []).filter((r) => has([r.content, r.seo])).length };
}

export async function deleteMedia(id: string): Promise<{ error?: string; message?: string }> {
  if (!(await staffFor("admin", "editor"))) return DENIED;
  const supabase = await createClient();
  const { data: item } = await supabase.from("media").select("path").eq("id", id).single();
  if (!item) return { error: "Image not found." };
  const usage = await mediaUsage(MEDIA_PREFIX + item.path);
  if (usage.live.length) return { error: `Still used on: ${usage.live.join(", ")}. Replace it there first.` };
  // Removing a storage object needs read access to find it, which signed-in staff don't have on the
  // bucket - so the file is removed with the secret key (the role was checked above), and checked.
  const { data: removed, error: storageError } = await createAdminClient().storage.from("media").remove([item.path]);
  if (storageError) return { error: storageError.message };
  if (!removed?.length) return { error: "The file couldn't be removed from storage - please try again." };
  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/media");
  return { message: usage.history ? `Deleted. ${usage.history} older page version(s) still refer to it - restoring one would show a missing image.` : "Deleted." };
}
