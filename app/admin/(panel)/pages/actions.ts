"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { staffFor } from "@/lib/admin/auth";
import { pathError, protectedReason, shapeErrors, stableJson, template, tidySeo, type Json, type PageType, type Seo } from "@/lib/admin/page-model";
import { allPagesLite, PAGE_COLUMNS, validationContext, type PageRow } from "@/lib/admin/pages";
import { upsertRedirect } from "@/lib/admin/redirects";
import { validatePage } from "@/lib/admin/validate";
import { CONTENT_TAG } from "@/lib/content-store";
import { createClient } from "@/lib/supabase/server";

// Page editor actions. Every write uses the signed-in user's Supabase client, so row-level security
// and the pages_guard / pages_review triggers apply (the secret key would bypass the role rules).
// Writes are conditional on the version (updated_at) the editor loaded: if someone else saved in
// between, nothing is written and the editor is told to reload.

export type EditorResult = {
  ok: boolean;
  error?: string;
  /** New version to send with the next write. */
  version?: string;
  page?: PageRow;
};

const CONFLICT = "Someone else saved this page since you opened it. Copy any changes you need, then reload the page.";
const today = () => new Date().toISOString().slice(0, 10);

async function load(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("pages").select(PAGE_COLUMNS).eq("id", id).single();
  if (error || !data) return { supabase, row: null };
  return { supabase, row: data as PageRow };
}

/** Fields fixed by the page's URL - always taken from the path, never from the editor. */
function pinIdentity(type: PageType, path: string, content: Json): Json {
  const parts = path.split("/");
  switch (type) {
    case "service":
    case "article":
      return { ...content, slug: path };
    case "local":
      return { ...content, slug: path, location: parts[1] };
    case "location":
      return { ...content, slug: path, officeId: parts[1] };
    case "attorney":
      return { ...content, slug: parts[2] };
    default:
      return content;
  }
}

/** Remove empty optional values the editor may leave behind (an empty steps block, blank photo, blank notes). */
function tidy(content: Json): Json {
  const c: Json = { ...content };
  const steps = c.steps as { heading: string; items: unknown[] } | undefined;
  if (steps && !steps.heading.trim() && steps.items.length === 0) delete c.steps;
  for (const k of ["photo", "memberships", "languages"]) {
    const v = c[k];
    if (v === "" || (Array.isArray(v) && v.length === 0)) delete c[k];
  }
  // Optional sub-fields left blank are dropped rather than stored as "".
  const dropBlank = (key: string, field: string) => {
    if (Array.isArray(c[key])) c[key] = (c[key] as Json[]).map((x) => (x[field] === "" ? { ...x, [field]: undefined } : x));
  };
  dropBlank("courts", "note");
  dropBlank("education", "year");
  return JSON.parse(JSON.stringify(c)); // drops undefined values
}

async function writeRevision(supabase: Awaited<ReturnType<typeof createClient>>, row: PageRow, userId: string, note: string) {
  await supabase.from("page_revisions").insert({ page_id: row.id, content: row.content, seo: row.seo, note, created_by: userId });
}

export async function saveDraft(id: string, version: string, content: Json, seo: Seo): Promise<EditorResult> {
  const me = await staffFor("admin", "editor");
  if (!me) return { ok: false, error: "Only admins and editors can edit pages." };
  const { supabase, row } = await load(id);
  if (!row) return { ok: false, error: "Page not found." };

  const next = tidy(pinIdentity(row.type, row.path, content));
  const nextSeo: Seo = tidySeo({ ...seo, title: seo.title?.trim() ?? "", description: seo.description?.trim() ?? "" });
  if (row.type === "attorney") { delete nextSeo.title; delete nextSeo.description; }
  if (row.type === "static") { delete nextSeo.jsonLd; delete nextSeo.faqSchema; } // their structured data is in code
  const bad = shapeErrors(row.type, next, nextSeo, row.path);
  if (bad.length) return { ok: false, error: `Not saved - the page data is malformed: ${bad.join(" ")}` };

  const { data, error } = await supabase
    .from("pages")
    .update({ content: next, seo: nextSeo, updated_by: me.id })
    .eq("id", id)
    .eq("updated_at", version)
    .select(PAGE_COLUMNS);
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: CONFLICT };
  const saved = data[0] as PageRow;
  await writeRevision(supabase, saved, me.id, "Saved draft");
  return { ok: true, version: saved.updated_at, page: saved };
}

export async function publishPage(id: string, version: string): Promise<EditorResult> {
  const me = await staffFor("admin", "editor");
  if (!me) return { ok: false, error: "Only admins and editors can publish." };
  const { supabase, row } = await load(id);
  if (!row) return { ok: false, error: "Page not found." };
  if (row.updated_at !== version) return { ok: false, error: CONFLICT };

  const bad = shapeErrors(row.type, row.content, row.seo, row.path);
  if (bad.length) return { ok: false, error: `Can't publish - the page data is malformed: ${bad.join(" ")}` };
  const pages = await allPagesLite();
  const issues = validatePage(row.type, row.path, row.content, row.seo, await validationContext(pages)).filter((i) => i.level === "error");
  if (issues.length) return { ok: false, error: `Can't publish until these are fixed: ${issues.map((i) => i.message).join(" · ")}` };

  // "Last updated" moves to today when the text actually changed since the last publish.
  const strip = (c: Json | null) => (c ? stableJson({ ...c, updated: undefined }) : "");
  const changed = strip(row.content) !== strip(row.published_content);
  const content = changed && "updated" in row.content ? { ...row.content, updated: today() } : row.content;

  const { data, error } = await supabase
    .from("pages")
    .update({ content, published_content: content, published_seo: row.seo, status: "published", published_at: new Date().toISOString(), updated_by: me.id })
    .eq("id", id)
    .eq("updated_at", version)
    .select(PAGE_COLUMNS);
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: CONFLICT };
  const saved = data[0] as PageRow;
  await writeRevision(supabase, saved, me.id, "Published");
  updateTag(CONTENT_TAG);
  return { ok: true, version: saved.updated_at, page: saved };
}

export async function discardDraft(id: string, version: string): Promise<EditorResult> {
  const me = await staffFor("admin", "editor");
  if (!me) return { ok: false, error: "Only admins and editors can edit pages." };
  const { supabase, row } = await load(id);
  if (!row?.published_content || !row.published_seo) return { ok: false, error: "This page has never been published - there is nothing to go back to." };
  const { data, error } = await supabase
    .from("pages")
    .update({ content: row.published_content, seo: row.published_seo, updated_by: me.id })
    .eq("id", id)
    .eq("updated_at", version)
    .select(PAGE_COLUMNS);
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: CONFLICT };
  const saved = data[0] as PageRow;
  await writeRevision(supabase, saved, me.id, "Discarded unpublished changes");
  return { ok: true, version: saved.updated_at, page: saved };
}

/** After a page leaves the site: optionally send its URL somewhere else. Returns a note if that failed. */
async function redirectAway(supabase: Awaited<ReturnType<typeof createClient>>, from: string, to: string | undefined, userId: string) {
  if (!to) return "";
  const errors = await upsertRedirect(supabase, { source: from, destination: to, permanent: true }, userId);
  return errors.length ? ` The redirect wasn't created: ${errors.join(" ")}` : "";
}

export async function unpublishPage(id: string, version: string, redirectTo?: string): Promise<EditorResult> {
  const me = await staffFor("admin", "editor");
  if (!me) return { ok: false, error: "Only admins and editors can unpublish." };
  const { supabase, row } = await load(id);
  if (!row) return { ok: false, error: "Page not found." };
  const why = protectedReason(row.type, row.path);
  if (why) return { ok: false, error: why };
  const { data, error } = await supabase.from("pages").update({ status: "draft", updated_by: me.id }).eq("id", id).eq("updated_at", version).select(PAGE_COLUMNS);
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: CONFLICT };
  const note = await redirectAway(supabase, row.path, redirectTo, me.id);
  updateTag(CONTENT_TAG);
  return { ok: true, version: (data[0] as PageRow).updated_at, page: data[0] as PageRow, ...(note && { error: note.trim() }) };
}

export async function deletePage(id: string, redirectTo?: string): Promise<EditorResult> {
  const me = await staffFor("admin");
  if (!me) return { ok: false, error: "Only admins can delete pages." };
  const { supabase, row } = await load(id);
  if (!row) return { ok: false, error: "Page not found." };
  const why = protectedReason(row.type, row.path);
  if (why) return { ok: false, error: why };
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  const note = await redirectAway(supabase, row.path, redirectTo, me.id);
  updateTag(CONTENT_TAG);
  redirect("/admin/pages?deleted=" + encodeURIComponent(row.path) + (redirectTo && !note ? "&to=" + encodeURIComponent(redirectTo) : ""));
}

export async function restoreRevision(id: string, version: string, revisionId: string): Promise<EditorResult> {
  const me = await staffFor("admin", "editor");
  if (!me) return { ok: false, error: "Only admins and editors can edit pages." };
  const { supabase, row } = await load(id);
  if (!row) return { ok: false, error: "Page not found." };
  const { data: rev } = await supabase.from("page_revisions").select("content, seo, created_at").eq("id", revisionId).eq("page_id", id).single();
  if (!rev) return { ok: false, error: "That version no longer exists." };
  const result = await saveDraft(id, version, rev.content as Json, rev.seo as Seo);
  if (result.ok && result.page) {
    await supabase.from("page_revisions").insert({
      page_id: id, content: result.page.content, seo: result.page.seo, created_by: me.id,
      note: `Restored the version from ${new Date(rev.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`,
    });
  }
  return result;
}

export type CreateState = { error?: string } | undefined;

export async function createPage(_prev: CreateState, form: FormData): Promise<CreateState> {
  const me = await staffFor("admin", "editor");
  if (!me) return { error: "Only admins and editors can create pages." };
  const type = String(form.get("type") || "") as PageType;
  const path = String(form.get("path") || "").trim().toLowerCase().replace(/\/+$/, "");
  const name = String(form.get("name") || "").trim();
  if (!["service", "local", "location", "article", "attorney"].includes(type)) return { error: "Choose a page type." };
  if (!name) return { error: "Enter a name for the page." };
  const pages = await allPagesLite();
  const bad = pathError(type, path, pages.map((p) => p.path));
  if (bad) return { error: bad };

  const { content, seo } = template(type, path, name);
  const sort = pages.filter((p) => p.type === type).length; // new pages go last in their group
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .insert({ path, type, status: "draft", content, seo, sort_order: sort, updated_by: me.id })
    .select(PAGE_COLUMNS)
    .single();
  if (error) return { error: error.message };
  await writeRevision(supabase, data as PageRow, me.id, "Created");
  redirect(`/admin/pages/${(data as PageRow).id}`);
}

// ---------------------------------------------------------------- attorney review

export async function signOffReview(id: string, attorneySlug: string): Promise<EditorResult> {
  const me = await staffFor("admin", "reviewer");
  if (!me) return { ok: false, error: "Only attorney reviewers and admins can sign off reviews." };
  const supabase = await createClient();
  let slug = attorneySlug;
  if (me.role === "reviewer") {
    const { data: prof } = await supabase.from("profiles").select("attorney_slug").eq("id", me.id).single();
    if (!prof?.attorney_slug) return { ok: false, error: "Your account isn't linked to an attorney profile yet. Ask an admin to link it under Users." };
    slug = prof.attorney_slug;
  }
  const { data: att } = await supabase.from("pages").select("path").eq("path", `/attorneys/${slug}`).eq("status", "published").maybeSingle();
  if (!att) return { ok: false, error: "That attorney has no published profile page, so the review can't be credited to them." };

  const { data, error } = await supabase
    .from("pages")
    .update({ reviewed_by: slug, reviewed_at: today(), review_status: "reviewed", updated_by: me.id })
    .eq("id", id)
    .select(PAGE_COLUMNS);
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "Page not found." };
  const saved = data[0] as PageRow;
  await writeRevision(supabase, saved, me.id, `Legal review signed off by ${slug}`);
  updateTag(CONTENT_TAG);
  return { ok: true, version: saved.updated_at, page: saved };
}

export async function withdrawReview(id: string): Promise<EditorResult> {
  const me = await staffFor("admin", "reviewer");
  if (!me) return { ok: false, error: "Only attorney reviewers and admins can withdraw a review." };
  const supabase = await createClient();
  if (me.role === "reviewer") {
    const [{ data: prof }, { data: page }] = await Promise.all([
      supabase.from("profiles").select("attorney_slug").eq("id", me.id).single(),
      supabase.from("pages").select("reviewed_by").eq("id", id).single(),
    ]);
    if (!prof?.attorney_slug || page?.reviewed_by !== prof.attorney_slug) return { ok: false, error: "You can only withdraw your own sign-off." };
  }
  const { data, error } = await supabase.from("pages").update({ reviewed_by: null, reviewed_at: null, updated_by: me.id }).eq("id", id).select(PAGE_COLUMNS);
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "Page not found." };
  updateTag(CONTENT_TAG);
  return { ok: true, version: (data[0] as PageRow).updated_at, page: data[0] as PageRow };
}
