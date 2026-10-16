"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  deletePage, discardDraft, publishPage, restoreRevision, saveDraft, signOffReview, unpublishPage, withdrawReview, type EditorResult,
} from "@/app/admin/(panel)/pages/actions";
import { ARTICLE_CATEGORIES, SERVICE_GROUPS, stableJson, tidySeo, TYPE_LABELS, type Json, type PageType, type Seo } from "@/lib/admin/page-model";
import { validatePage, type ValidationContext } from "@/lib/admin/validate";
import { MediaPicker } from "@/components/admin/media/MediaLibrary";
import StaticForm, { cleanStatic } from "./StaticForm";
import {
  BlocksEditor, CheckList, cleanBlocks, cleanLines, CourtsEditor, EducationEditor, FaqsEditor, Field, INLINE_HINT, LinesField, PagePicker,
  SectionsEditor, Select, StepsEditor, type PageOption,
} from "./fields";

export type EditorPage = {
  id: string;
  path: string;
  type: PageType;
  status: "draft" | "published" | "archived";
  content: Json;
  seo: Seo;
  published_content: Json | null;
  published_seo: Seo | null;
  review_status: "not_reviewed" | "needs_review" | "reviewed";
  reviewed_by: string | null;
  reviewed_at: string | null;
  published_is_reviewed: boolean;
  updated_at: string;
};
export type Revision = { id: string; note: string | null; created_at: string; by: string | null };

type Props = {
  page: EditorPage;
  role: "admin" | "editor" | "reviewer";
  options: PageOption[];
  ctx: ValidationContext;
  revisions: Revision[];
  attorneys: { slug: string; name: string }[];
  myAttorney: string | null;
  references: { path: string; name: string }[];
  protectedReason: string | null;
  /** Office ids + names (firm details), for the attorney form. */
  offices: { id: string; label: string }[];
};

const SUFFIX = " | California Law";
const REVIEW_LABEL = { not_reviewed: "Not reviewed", needs_review: "Needs review", reviewed: "Reviewed" } as const;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type C = Record<string, any>;

/** Normalise what the form holds into what gets saved (drop blank lines and list items). */
function clean(c: C): C {
  const out: C = { ...c };
  if (Array.isArray(out.sections)) out.sections = out.sections.map((s: C) => ({ ...s, blocks: cleanBlocks(s.blocks) }));
  if (Array.isArray(out.bio)) out.bio = cleanBlocks(out.bio);
  for (const k of ["areasServed", "memberships", "languages"]) if (Array.isArray(out[k])) out[k] = cleanLines(out[k]);
  return out;
}

const withoutUpdated = (c: Json | null) => (c ? stableJson({ ...c, updated: undefined }) : "");

export default function PageEditor(props: Props) {
  const { role, options, ctx, attorneys, myAttorney, references } = props;
  const [row, setRow] = useState(props.page);
  const [content, setContent] = useState<C>(props.page.content);
  const [seo, setSeo] = useState<Seo>(props.page.seo);
  const [revisions, setRevisions] = useState(props.revisions);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState<"delete" | "unpublish" | "discard" | null>(null);
  const [signAs, setSignAs] = useState(attorneys[0]?.slug ?? "");
  const [redirectTo, setRedirectTo] = useState("");

  const { type, path } = row;
  const canEdit = role === "admin" || role === "editor";
  const set = (k: string, v: unknown) => setContent((c) => ({ ...c, [k]: v }));
  // Raw while typing; tidied (trimmed, defaults dropped) only when comparing, checking and saving.
  const setSeoField = <K extends keyof Seo>(k: K, v: Seo[K] | undefined) => setSeo((s) => ({ ...s, [k]: v }));
  const seoClean = useMemo(() => tidySeo(seo), [seo]);
  const [advancedOpen, setAdvancedOpen] = useState(() => ["canonical", "noindex", "nofollow", "ogTitle", "ogDescription", "ogImage", "faqSchema", "jsonLd", "sitemapExclude", "sitemapPriority"].some((k) => props.page.seo[k as keyof Seo] !== undefined));
  const advancedSet = ["canonical", "noindex", "nofollow", "ogTitle", "ogDescription", "ogImage", "faqSchema", "jsonLd", "sitemapExclude", "sitemapPriority"].some((k) => seoClean[k as keyof Seo] !== undefined);

  const cleanFor = (c: C) => (type === "static" ? cleanStatic(path, c) : clean(c));
  const cleaned = useMemo(() => (type === "static" ? cleanStatic(path, content) : clean(content)), [type, path, content]);
  const dirty = stableJson(cleaned) !== stableJson(cleanFor(row.content)) || stableJson(tidySeo(seo)) !== stableJson(tidySeo(row.seo));
  const live = row.status === "published" && !!row.published_content;
  const unpublishedChanges = !!row.published_content && (withoutUpdated(row.content) !== withoutUpdated(row.published_content) || stableJson(row.seo) !== stableJson(row.published_seo));
  const issues = useMemo(() => validatePage(type, path, cleaned, tidySeo(seo), ctx), [type, path, cleaned, seo, ctx]);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  function apply(r: EditorResult, okText: string, note = okText.split(" - ")[0].replace(/\.$/, "")) {
    if (!r.ok || !r.page) {
      setMessage({ kind: "error", text: r.error ?? "Something went wrong." });
      return false;
    }
    setRow(r.page as EditorPage);
    setContent(r.page.content);
    setSeo(r.page.seo);
    setRevisions((rv) => [{ id: `local-${Date.now()}`, note, created_at: new Date().toISOString(), by: "You" }, ...rv]);
    setMessage({ kind: "ok", text: okText });
    return true;
  }

  const save = () => saveDraft(row.id, row.updated_at, cleaned, seoClean);
  const run = (fn: () => Promise<void>) => start(async () => { setMessage(null); await fn(); });

  const onSave = () => run(async () => { apply(await save(), "Draft saved."); });
  const onPublish = () => run(async () => {
    let version = row.updated_at;
    if (dirty) {
      const r = await save();
      if (!apply(r, "Draft saved.")) return;
      version = r.version!;
    }
    apply(await publishPage(row.id, version), "Published - the live page updates on its next visit.");
  });
  const onPreview = () => run(async () => {
    if (dirty && !apply(await save(), "Draft saved.")) return;
    window.open(`/admin/preview/${row.id}`, "_blank", "noopener");
  });
  const onDiscard = () => run(async () => { apply(await discardDraft(row.id, row.updated_at), "Unpublished changes discarded - the draft matches the live page again.", "Discarded unpublished changes"); setConfirm(null); });
  const onUnpublish = () => run(async () => {
    const r = await unpublishPage(row.id, row.updated_at, redirectTo || undefined);
    if (!r.ok) { setMessage({ kind: "error", text: r.error ?? "Couldn't unpublish." }); return; }
    // r.error on success = the page was unpublished but its redirect couldn't be created.
    apply({ ...r, error: undefined }, `Unpublished - the page is no longer on the website.${redirectTo && !r.error ? ` Visitors are sent to ${redirectTo}.` : ""}`);
    if (r.error) setMessage({ kind: "error", text: `Unpublished.${r.error}` });
    setConfirm(null);
  });
  const onDelete = () => run(async () => { const r = await deletePage(row.id, redirectTo || undefined); if (r && !r.ok) setMessage({ kind: "error", text: r.error ?? "Couldn't delete." }); });
  const redirectTargets = options.filter((o) => o.path !== path && o.type !== "attorney" && ctx.publishedPaths.includes(o.path));
  const redirectPicker = (
    <label className="adm-field ed-field ed-redirect">
      <span>Send visitors of {path} to (recommended)</span>
      <select value={redirectTo} onChange={(e) => setRedirectTo(e.target.value)}>
        <option value="">No redirect - show “page not found”</option>
        {redirectTargets.map((o) => <option key={o.path} value={o.path}>{o.name} - {o.path}</option>)}
      </select>
    </label>
  );
  const onRestore = (id: string) => run(async () => { apply(await restoreRevision(row.id, row.updated_at, id), "Older version restored as the draft. Publish it to make it live.", "Restored an older version"); });
  const onSignOff = () => run(async () => { apply(await signOffReview(row.id, role === "admin" ? signAs : myAttorney ?? ""), "Review signed off."); });
  const onWithdraw = () => run(async () => { apply(await withdrawReview(row.id), "Review withdrawn."); });

  const titleLen = (seo.title ?? "").length + (seo.titleAbsolute ? 0 : SUFFIX.length);
  const serviceOptions = options.filter((o) => o.type === "service" || o.path === "/wrongful-death");
  const linkOptions = options.filter((o) => o.path !== path && o.type !== "static" && o.type !== "attorney").concat(options.filter((o) => o.path === "/wrongful-death"));

  return (
    <div className="ed">
      <header className="ed-head">
        <div>
          <p className="ed-crumbs"><Link href="/admin/pages">Pages</Link> / {TYPE_LABELS[type]}</p>
          <h1 className="adm-h1">{String(content.name || seo.title || path)}</h1>
          <p className="ed-meta">
            {live ? <a href={path} target="_blank" rel="noopener">{path} ↗</a> : <span>{path}</span>}
            <span className={`adm-pill adm-pill--${live ? "published" : "draft"}`}>{live ? "Published" : "Not published"}</span>
            {unpublishedChanges && live && <span className="adm-pill adm-pill--draft">Unpublished changes</span>}
            {dirty && <span className="adm-pill adm-pill--draft">Unsaved edits</span>}
            {type !== "static" && <span className={`adm-pill adm-pill--${row.review_status}`}>{REVIEW_LABEL[row.review_status]}</span>}
          </p>
        </div>
        {canEdit && (
          <div className="ed-actions">
            <button type="button" className="adm-btn" onClick={onPreview} disabled={pending}>Preview</button>
            <button type="button" className="adm-btn" onClick={onSave} disabled={pending || !dirty}>Save draft</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={onPublish} disabled={pending || errors.length > 0 || (!dirty && live && !unpublishedChanges)}>
              {live ? "Publish changes" : "Publish"}
            </button>
          </div>
        )}
      </header>

      {message && <p className={`adm-alert adm-alert--${message.kind === "ok" ? "ok" : "error"} ed-message`} role={message.kind === "ok" ? "status" : "alert"}>{message.text}</p>}
      {!canEdit && <p className="adm-alert ed-message">You can read this page and sign off its legal review. Editing is for admins and editors.</p>}

      <div className="ed-layout">
        <fieldset className="ed-main" disabled={!canEdit || pending}>
          {type === "static" ? (
            <>
              <section className="adm-card">
                <h2 className="adm-h2">Page</h2>
                <p className="adm-muted">The layout, images and icons are part of the site&rsquo;s design; the text below is yours to edit.</p>
                <Field label="Label on the site map" value={content.name ?? ""} onChange={(v) => set("name", v)} />
              </section>
              <StaticForm path={path} content={content} onChange={(v) => setContent(v)} />
            </>
          ) : type === "attorney" ? (
            <AttorneyForm c={content} set={set} options={options} offices={props.offices} />
          ) : (
            <>
              <section className="adm-card">
                <h2 className="adm-h2">Basics</h2>
                <Field label="Short name (links, cards, breadcrumbs)" value={content.name ?? ""} onChange={(v) => set("name", v)} />
                {(type === "service" || type === "local") && <Select label="Group on the practice-areas page" value={content.group} options={SERVICE_GROUPS} onChange={(v) => set("group", v)} />}
                {type === "article" && <Select label="Category" value={content.category} options={ARTICLE_CATEGORIES} onChange={(v) => set("category", v)} />}
                <Field label="Card summary" max={160} rows={2} value={content.summary ?? ""} onChange={(v) => set("summary", v)} hint="Shown on cards that link to this page." />
              </section>

              <section className="adm-card">
                <h2 className="adm-h2">Top of the page</h2>
                <Field label="Main heading (H1)" value={content.h1 ?? ""} onChange={(v) => set("h1", v)} />
                <Field label="Text under the heading" rows={2} value={content.heroText ?? ""} onChange={(v) => set("heroText", v)} />
                <Field label="Opening paragraph (answer the question first)" rows={5} value={content.intro ?? ""} onChange={(v) => set("intro", v)} hint={INLINE_HINT} />
              </section>

              {type !== "location" && (
                <section className="adm-card">
                  <h2 className="adm-h2">“What to do” list</h2>
                  <StepsEditor value={content.steps} onChange={(v) => set("steps", v)} />
                </section>
              )}

              {type === "location" && (
                <section className="adm-card">
                  <h2 className="adm-h2">Local details</h2>
                  <LinesField label="Communities served" value={content.areasServed ?? []} onChange={(v) => set("areasServed", v)} rows={6} />
                  <h3 className="ed-h3">Courthouses</h3>
                  <CourtsEditor value={content.courts ?? []} onChange={(v) => set("courts", v)} />
                </section>
              )}

              <section className="adm-card">
                <h2 className="adm-h2">Sections</h2>
                <p className="adm-muted">{INLINE_HINT}</p>
                <SectionsEditor value={content.sections ?? []} onChange={(v) => set("sections", v)} />
              </section>

              <section className="adm-card">
                <h2 className="adm-h2">FAQ</h2>
                <FaqsEditor value={content.faqs ?? []} onChange={(v) => set("faqs", v)} />
              </section>

              {(type === "service" || type === "local" || type === "article") && (
                <section className="adm-card">
                  <h2 className="adm-h2">Links to other pages</h2>
                  {type === "article" && (
                    <>
                      <PagePicker label="Practice areas this guide supports" value={content.services ?? []} options={serviceOptions} onChange={(v) => set("services", v)} hint="Those pages list this guide under “Helpful guides”." />
                      <Field label="Published date" type="date" value={content.published ?? ""} onChange={(v) => set("published", v)} />
                    </>
                  )}
                  <PagePicker label="Related pages (shown at the end)" value={content.related ?? []} options={linkOptions} onChange={(v) => set("related", v)} hint="Aim for 3–4." />
                </section>
              )}
            </>
          )}
        </fieldset>

        <aside className="ed-side">
          <section className="adm-card">
            <h2 className="adm-h2">Checks</h2>
            {errors.length === 0 && warnings.length === 0 && <p className="adm-alert adm-alert--ok">No problems found.</p>}
            {errors.length > 0 && (
              <>
                <p className="ed-issues-h ed-issues-h--error">{errors.length} to fix before publishing</p>
                <ul className="ed-issues">{errors.map((e, i) => <li key={i} className="is-error">{e.message}</li>)}</ul>
              </>
            )}
            {warnings.length > 0 && (
              <>
                <p className="ed-issues-h">{warnings.length} to review</p>
                <ul className="ed-issues">{warnings.map((e, i) => <li key={i}>{e.message}</li>)}</ul>
              </>
            )}
          </section>

          <section className="adm-card">
            <h2 className="adm-h2">Search engines</h2>
            <fieldset disabled={!canEdit || pending} className="ed-plain">
              {type !== "attorney" && (
                <>
                  <Field label="SEO title" value={seo.title ?? ""} onChange={(v) => setSeoField("title", v)} hint={<span className={titleLen > 60 ? "ed-count is-over" : undefined}>{titleLen}/60 characters{seo.titleAbsolute ? "" : <> including &ldquo;{SUFFIX.trim()}&rdquo;</>}</span>} />
                  <Field label="Meta description" rows={4} max={155} value={seo.description ?? ""} onChange={(v) => setSeoField("description", v)} />
                </>
              )}
            </fieldset>
            {type !== "attorney" && (
              <div className="ed-serp" aria-label="Search result preview">
                <span className="ed-serp__url">californialaw.com{path === "/" ? "" : path.replace(/\//g, " › ").replace(/^ › /, " › ")}</span>
                <span className="ed-serp__title">{(seo.title ?? "") + (seo.titleAbsolute ? "" : SUFFIX)}</span>
                <span className="ed-serp__desc">{seo.description}</span>
              </div>
            )}
            <details className="ed-advanced" open={advancedOpen} onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}>
              <summary>Advanced{advancedSet ? " (in use)" : ""}</summary>
              <fieldset disabled={!canEdit || pending} className="ed-plain">
                <label className="ed-check"><input type="checkbox" checked={!!seo.noindex} onChange={(e) => setSeoField("noindex", e.target.checked)} /> Hide from search engines (noindex)</label>
                <label className="ed-check"><input type="checkbox" checked={!!seo.nofollow} onChange={(e) => setSeoField("nofollow", e.target.checked)} /> Don&rsquo;t follow links on this page (nofollow)</label>
                <label className="ed-check"><input type="checkbox" checked={!!seo.sitemapExclude} onChange={(e) => setSeoField("sitemapExclude", e.target.checked)} /> Leave out of sitemap.xml</label>
                <Field label="Sitemap priority (0.0–1.0, empty = default)" type="number" value={seo.sitemapPriority === undefined ? "" : String(seo.sitemapPriority)} onChange={(v) => setSeoField("sitemapPriority", v === "" ? undefined : Number(v))} />
                <Field label="Canonical URL (empty = this page)" value={seo.canonical ?? ""} onChange={(v) => setSeoField("canonical", v)} placeholder={path} hint="Only if another page should rank instead of this one." />
                <h3 className="ed-h3">Social sharing</h3>
                <Field label="Share title (empty = SEO title)" value={seo.ogTitle ?? ""} onChange={(v) => setSeoField("ogTitle", v)} max={70} />
                <Field label="Share description (empty = meta description)" rows={2} value={seo.ogDescription ?? ""} onChange={(v) => setSeoField("ogDescription", v)} max={200} />
                <MediaPicker label="Share image (empty = site default)" value={seo.ogImage ?? ""} onChange={(v) => setSeoField("ogImage", v)} hint="1200×630 works best." disabled={!canEdit || pending} />
                {type !== "static" && (
                  <>
                    <h3 className="ed-h3">Structured data</h3>
                    {type !== "attorney" && (
                      <label className="ed-check"><input type="checkbox" checked={seo.faqSchema !== false} onChange={(e) => setSeoField("faqSchema", e.target.checked ? undefined : false)} /> Include the FAQ in structured data (FAQPage)</label>
                    )}
                    <Field label="Custom JSON-LD (one JSON object with &quot;@type&quot;)" rows={5} value={seo.jsonLd ?? ""} onChange={(v) => setSeoField("jsonLd", v)} placeholder='{"@type": "HowTo", "name": "…"}' hint="Added to the page alongside the automatic structured data." />
                  </>
                )}
              </fieldset>
            </details>
          </section>

          {type !== "static" && (
            <section className="adm-card">
              <h2 className="adm-h2">Attorney review</h2>
              <ReviewStatus row={row} attorneys={attorneys} />
              {(role === "reviewer" || role === "admin") && (
                <div className="ed-stack">
                  {role === "admin" && attorneys.length > 0 && (
                    <Select label="Sign off as" value={signAs} options={attorneys.map((a) => ({ value: a.slug, label: a.name }))} onChange={setSignAs} />
                  )}
                  {attorneys.length === 0 ? (
                    <p className="adm-muted">Reviews can be signed off once there is a published attorney profile.</p>
                  ) : role === "reviewer" && !myAttorney ? (
                    <p className="adm-muted">Your account isn&rsquo;t linked to an attorney profile yet - ask an admin to link it under Users.</p>
                  ) : (
                    <button type="button" className="adm-btn adm-btn--primary" onClick={onSignOff} disabled={pending || dirty || row.review_status === "reviewed"}>
                      {row.review_status === "reviewed" ? "Signed off" : "Sign off the current draft"}
                    </button>
                  )}
                  {dirty && <small className="ed-hint">Save the draft first - the sign-off covers the saved text.</small>}
                  {row.reviewed_by && (role === "admin" || row.reviewed_by === myAttorney) && (
                    <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={onWithdraw} disabled={pending}>Withdraw sign-off</button>
                  )}
                </div>
              )}
            </section>
          )}

          <section className="adm-card">
            <h2 className="adm-h2">History</h2>
            {revisions.length === 0 ? <p className="adm-muted">No saved versions yet.</p> : (
              <ul className="ed-history">
                {revisions.map((r) => (
                  <li key={r.id}>
                    <span>
                      <strong>{r.note ?? "Saved"}</strong>
                      <small>{new Date(r.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}{r.by ? ` · ${r.by}` : ""}</small>
                    </span>
                    {canEdit && !r.id.startsWith("local-") && <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => onRestore(r.id)} disabled={pending}>Restore</button>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {canEdit && (
            <section className="adm-card ed-danger">
              <h2 className="adm-h2">More actions</h2>
              {row.published_content && unpublishedChanges && (
                confirm === "discard" ? (
                  <div className="ed-confirm">
                    <p>Throw away the unpublished changes and go back to the live version?</p>
                    <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={onDiscard} disabled={pending}>Discard changes</button>
                    <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setConfirm(null)}>Cancel</button>
                  </div>
                ) : <button type="button" className="adm-btn adm-btn--sm" onClick={() => setConfirm("discard")}>Discard unpublished changes</button>
              )}
              {props.protectedReason ? <p className="adm-muted">{props.protectedReason}</p> : (
                <>
                  {references.length > 0 && (
                    <div className="ed-refs">
                      <p className="adm-muted">These pages link here - update them before removing this page:</p>
                      <ul>{references.map((r) => <li key={r.path}>{r.name} <small>{r.path}</small></li>)}</ul>
                    </div>
                  )}
                  {live && (confirm === "unpublish" ? (
                    <div className="ed-confirm">
                      <p>Take this page off the website? You can publish it again later.</p>
                      {redirectPicker}
                      <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={onUnpublish} disabled={pending}>Unpublish</button>
                      <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setConfirm(null)}>Cancel</button>
                    </div>
                  ) : <button type="button" className="adm-btn adm-btn--sm" onClick={() => setConfirm("unpublish")}>Unpublish</button>)}
                  {role === "admin" && (confirm === "delete" ? (
                    <div className="ed-confirm">
                      <p>Delete this page and its history permanently? This can&rsquo;t be undone.</p>
                      {row.published_content && redirectPicker}
                      <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={onDelete} disabled={pending}>Delete permanently</button>
                      <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setConfirm(null)}>Cancel</button>
                    </div>
                  ) : <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => setConfirm("delete")}>Delete page</button>)}
                </>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function ReviewStatus({ row, attorneys }: { row: EditorPage; attorneys: { slug: string; name: string }[] }) {
  const who = attorneys.find((a) => a.slug === row.reviewed_by)?.name ?? row.reviewed_by;
  if (row.review_status === "not_reviewed") return <p className="adm-muted">Not reviewed by an attorney. The page shows no review byline.</p>;
  if (row.review_status === "needs_review")
    return <p className="adm-alert">The text changed after {who} signed it off{row.reviewed_at ? ` on ${row.reviewed_at}` : ""}. {row.published_is_reviewed ? "The live page still shows the reviewed version and byline until you publish." : "The review byline is hidden until it is signed off again."}</p>;
  return (
    <p className="adm-alert adm-alert--ok">
      Reviewed by {who}{row.reviewed_at ? ` on ${row.reviewed_at}` : ""}.{" "}
      {row.published_is_reviewed ? "The live page shows the review byline." : "Publish to show the review byline on the live page."}
    </p>
  );
}

function AttorneyForm({ c, set, options, offices }: { c: C; set: (k: string, v: unknown) => void; options: PageOption[]; offices: { id: string; label: string }[] }) {
  return (
    <>
      <section className="adm-card">
        <h2 className="adm-h2">Attorney</h2>
        <p className="adm-muted">Only real attorneys with a real State Bar of California license number.</p>
        <Field label="Full name" value={c.name ?? ""} onChange={(v) => set("name", v)} />
        <Field label="Job title" value={c.title ?? ""} onChange={(v) => set("title", v)} placeholder="Founding Partner" />
        <Field label="State Bar of California license number" value={c.barNumber ?? ""} onChange={(v) => set("barNumber", v)} />
        <Field label="Year admitted to the State Bar" value={c.admitted ?? ""} onChange={(v) => set("admitted", v)} />
        <MediaPicker label="Photo" value={c.photo ?? ""} onChange={(v) => set("photo", v)} hint="Square, at least 320×320." />
        <CheckList label="Offices" value={c.offices ?? []} options={offices.map((o) => ({ value: o.id, label: o.label }))} onChange={(v) => set("offices", v)} />
      </section>
      <section className="adm-card">
        <h2 className="adm-h2">Biography</h2>
        <BlocksEditor value={c.bio ?? []} onChange={(v) => set("bio", v)} />
      </section>
      <section className="adm-card">
        <h2 className="adm-h2">Background</h2>
        <PagePicker label="Practice areas" value={c.practiceAreas ?? []} options={options.filter((o) => o.type === "service" || o.path === "/wrongful-death")} onChange={(v) => set("practiceAreas", v)} />
        <h3 className="ed-h3">Education</h3>
        <EducationEditor value={c.education ?? []} onChange={(v) => set("education", v)} />
        <LinesField label="Memberships" value={c.memberships ?? []} onChange={(v) => set("memberships", v)} rows={3} />
        <LinesField label="Languages" value={c.languages ?? []} onChange={(v) => set("languages", v)} rows={2} />
      </section>
    </>
  );
}
