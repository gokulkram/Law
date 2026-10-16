// Content checks for the page editor - the rules from scripts/check-content.mjs, applied to one page
// against everything else in the database. Pure: the editor runs it live, the server runs it again
// before publishing. Errors block publishing; warnings are things to review by hand.
import { isUrlOrPath, parseJsonLd, type Json, type PageType, type Seo } from "@/lib/admin/page-model";
import { hasStaticModel, staticTexts } from "@/lib/admin/static-model";
import { imageAllowed } from "@/lib/admin/settings-model";
import { MEDIA_PREFIX } from "@/lib/supabase/env";

export type Issue = { level: "error" | "warning"; message: string };

export type ValidationContext = {
  /** Every page path in the database (drafts included) - links to these are not broken. */
  knownPaths: string[];
  /** Paths that are published - links to anything else are flagged. */
  publishedPaths: string[];
  /** Practice-area paths (statewide), valid for a guide's `services`. */
  servicePaths: string[];
  /** Section numbers on the fact sheet (content/FACTS.md); null if it couldn't be read. */
  allowedSections: string[] | null;
  /** Other pages' title/h1/description, to catch duplicates. */
  others: { path: string; title?: string; h1?: string; description?: string }[];
};

const SITE_SUFFIX = " | California Law";

const BANNED: [RegExp, string][] = [
  [/\bspeciali(st|sts|ze|zes|zed|zing|se)\b/i, "“specialist/specialize” - only certified specialists may use it (Rule 7.4)"],
  [/\bexpert (lawyer|attorney|trial|team|legal|representation)|\bexperts in\b|\bour experts?\b/i, "calls the firm “expert”"],
  [/\b(the )?best\b/i, "“best” is an unverifiable comparison"],
  [/\bguarantee/i, "“guarantee” - fine only in a disclaimer (“no guarantee”)"],
  [/\b(number one|#1|top[- ]rated|leading|premier|award[- ]winning)\b/i, "unverifiable superlative"],
  [/\$\s?\d[\d,.]*\s?(million|billion|M)\b|\brecovered\b|\bverdicts? of\b|\bsettlements? of\b/i, "possible case-result claim"],
  [/\b\d{1,3}(\.\d)?%\s+of\s+(all\s+)?(crashes|accidents|deaths|cases|claims)/i, "statistic not on the fact sheet"],
];

type Block = { p?: string; callout?: string; ul?: string[]; ol?: string[] };
const blockText = (b: Block) => [b.p ?? b.callout ?? "", ...(b.ul ?? b.ol ?? [])];

/** All human-readable text on a page, for word counts and wording checks. */
export function pageTexts(type: PageType, c: Json, path = ""): string[] {
  const a = c as {
    heroText?: string; intro?: string; summary?: string; areasServed?: string[]; courts?: { name: string; note?: string }[];
    steps?: { heading: string; items: { title: string; text: string }[] }; sections?: { heading: string; blocks: Block[] }[];
    faqs?: { q: string; a: string }[]; bio?: Block[];
  };
  if (type === "attorney") return (a.bio ?? []).flatMap(blockText);
  if (type === "static") return hasStaticModel(path) ? staticTexts(path, c).texts : [];
  return [
    a.heroText ?? "", a.intro ?? "", a.summary ?? "", ...(a.areasServed ?? []), ...(a.courts ?? []).flatMap((x) => [x.name, x.note ?? ""]),
    ...(a.steps ? [a.steps.heading, ...a.steps.items.flatMap((i) => [i.title, i.text])] : []),
    ...(a.sections ?? []).flatMap((s) => [s.heading, ...s.blocks.flatMap(blockText)]),
    ...(a.faqs ?? []).flatMap((f) => [f.q, f.a]),
  ];
}

const isDate = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export function validatePage(type: PageType, path: string, content: Json, seo: Seo, ctx: ValidationContext): Issue[] {
  const out: Issue[] = [];
  const error = (message: string) => out.push({ level: "error", message });
  const warn = (message: string) => out.push({ level: "warning", message });
  const c = content as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const known = new Set(ctx.knownPaths);
  const published = new Set(ctx.publishedPaths);

  // --- SEO title + description (not used for attorney pages, whose title comes from name + role)
  if (type !== "attorney") {
    const title = seo.title?.trim() ?? "";
    const full = seo.titleAbsolute ? title : title + SITE_SUFFIX;
    if (!title) error("SEO title is empty.");
    else if (full.length > 60) error(`SEO title is ${full.length} characters including “${SITE_SUFFIX.trim()}” (max 60).`);
    const d = seo.description?.trim() ?? "";
    if (!d) error("Meta description is empty.");
    else if (d.length > 155) error(`Meta description is ${d.length} characters (max 155).`);
    else if (d.length < 110) warn(`Meta description is only ${d.length} characters - aim for 110–155.`);
    for (const o of ctx.others) {
      if (o.path === path) continue;
      if (title && o.title === title) error(`Same SEO title as ${o.path}.`);
      if (d && o.description === d) error(`Same meta description as ${o.path}.`);
      if (c.h1 && o.h1 === c.h1) error(`Same H1 as ${o.path}.`);
    }
  }

  // --- advanced SEO settings
  if (seo.canonical) {
    if (!isUrlOrPath(seo.canonical)) error("Canonical URL must be a site path (/page) or an https:// address.");
    else if (seo.canonical === path) warn("Canonical URL is this page's own address - leave it empty, that's the default.");
    else if (seo.canonical.startsWith("/")) {
      if (!known.has(seo.canonical)) error(`Canonical URL ${seo.canonical} isn't a page on this site.`);
      else if (!published.has(seo.canonical)) error(`Canonical URL ${seo.canonical} isn't published.`);
      else warn(`Canonical points to ${seo.canonical}: search engines will index that page instead of this one.`);
    } else warn("Canonical points to another website: search engines will credit that address instead of this page.");
  }
  if (seo.noindex) {
    warn("“Hide from search engines” is on: this page won't appear in Google and is left out of the sitemap.");
    if (seo.canonical) warn("Noindex together with a canonical URL sends mixed signals - use one or the other.");
  }
  if (seo.nofollow) warn("“Don't follow links” is on: search engines won't follow the links on this page.");
  if (seo.ogImage && !isUrlOrPath(seo.ogImage)) error("Share image must be a site path (/images/…) or an https:// URL.");
  if (seo.ogTitle && seo.ogTitle.length > 70) warn(`Share title is ${seo.ogTitle.length} characters - social sites cut off around 70.`);
  if (seo.ogDescription && seo.ogDescription.length > 200) warn(`Share description is ${seo.ogDescription.length} characters - keep it under 200.`);
  if (seo.jsonLd) {
    const r = parseJsonLd(seo.jsonLd);
    if (!r.ok) error(r.error);
  }
  if (seo.sitemapPriority !== undefined && !(seo.sitemapPriority >= 0 && seo.sitemapPriority <= 1)) error("Sitemap priority must be between 0.0 and 1.0.");

  if (type === "static") {
    if (!c.name?.trim()) error("Site-map label is empty.");
    if (hasStaticModel(path)) for (const label of staticTexts(path, c).empty) error(`${label || "A field"} is empty.`);
  } else {

  if (!c.name?.trim()) error("Name is empty.");

  if (type === "attorney") {
    if (!c.title?.trim()) error("Job title is empty.");
    if (!/^\d{4,7}$/.test(c.barNumber ?? "")) error("State Bar number must be the license number (digits only).");
    if (!/^\d{4}$/.test(c.admitted ?? "")) error("Year admitted must be a 4-digit year.");
    if (!c.offices?.length) warn("No office selected.");
  } else {
    for (const k of ["h1", "heroText", "intro"] as const) if (!c[k]?.trim()) error(`${k === "h1" ? "H1" : k === "heroText" ? "Hero text" : "Intro"} is empty.`);
    if (!c.summary?.trim()) error("Card summary is empty.");
    else if (c.summary.length > 160) error(`Card summary is ${c.summary.length} characters (max 160).`);
    if (!isDate(c.updated)) error("“Last updated” must be a date (YYYY-MM-DD).");
    if (!c.sections?.length) error("Add at least one section.");
    c.sections?.forEach((s: { heading: string; blocks: Block[] }, i: number) => {
      if (!s.heading.trim()) error(`Section ${i + 1} has no heading.`);
      if (!s.blocks.length || s.blocks.every((b) => blockText(b).every((t) => !t.trim()))) error(`Section ${i + 1} (“${s.heading || "untitled"}”) is empty.`);
    });
    c.faqs?.forEach((f: { q: string; a: string }, i: number) => { if (!f.q.trim() || !f.a.trim()) error(`FAQ ${i + 1} needs both a question and an answer.`); });
    if ((c.faqs?.length ?? 0) < 4 || c.faqs.length > 8) warn(`${c.faqs?.length ?? 0} FAQs - aim for 5–8.`);
    if (c.steps) {
      c.steps.items.forEach((s: { title: string; text: string }, i: number) => { if (!s.title.trim() || !s.text.trim()) error(`Step ${i + 1} needs a title and text.`); });
      if (c.steps.items.length < 3 || c.steps.items.length > 7) warn(`${c.steps.items.length} steps - aim for 3–6.`);
    }
  }

  if (type === "location") {
    if (!c.courts?.length) error("List at least one courthouse.");
    for (const ct of c.courts ?? []) if (!/^https:\/\//.test(ct.url)) error(`Court link must start with https:// - ${ct.name || "unnamed court"}.`);
    if ((c.areasServed?.length ?? 0) < 5) warn(`Only ${c.areasServed?.length ?? 0} communities served listed.`);
  }
  if (type === "article") {
    if (!c.services?.length) error("Pick at least one practice area this guide supports.");
    for (const s of c.services ?? []) if (!ctx.servicePaths.includes(s) && s !== "/wrongful-death") error(`“Supports” must be practice-area pages: ${s}.`);
    if (!isDate(c.published)) error("Published date must be YYYY-MM-DD.");
  }

  // --- links between pages
  const linkLists: [string, string[] | undefined][] = [["Related pages", c.related], ["Practice areas", c.practiceAreas]];
  for (const [label, list] of linkLists) {
    if (!list) continue;
    for (const r of list) {
      if (r === path) error(`${label} include this page itself.`);
      else if (!known.has(r)) error(`${label}: ${r} doesn't exist.`);
      else if (!published.has(r)) warn(`${label}: ${r} isn't published yet - it won't show until it is.`);
    }
  }
  if (c.related && type !== "attorney" && (c.related.length < 3 || c.related.length > 4)) warn(`${c.related.length} related pages - aim for 3–4.`);
  }

  const texts = pageTexts(type, c, path);
  const all = texts.join("\n");
  for (const m of all.matchAll(/\]\(([^)]+)\)/g)) {
    if (!/^(\/(?!\/)|https:\/\/|mailto:|tel:)/i.test(m[1])) { error(`Link “${m[1]}” isn't allowed - use a site path (/page), https://, mailto: or tel:.`); continue; }
    const href = m[1].split("#")[0];
    if (!href.startsWith("/")) continue;
    if (!known.has(href)) error(`Broken link in text: ${m[1]}`);
    else if (!published.has(href)) warn(`Text links to ${href}, which isn't published yet.`);
    if (href === path) warn(`Text links to this page itself: ${m[1]}`);
  }

  // --- legal-content rules
  if (type !== "attorney" && type !== "static") {
    const words = all.split(/\s+/).filter(Boolean).length;
    if (words < 1100) warn(`Only ${words} words - pages that answer the question fully are usually 1,100+.`);
  }
  if (ctx.allowedSections === null) {
    if (/§/.test(all)) error("Couldn't load the fact sheet (content/FACTS.md) to check § citations - can't publish until it loads.");
  } else {
    const allowed = new Set(ctx.allowedSections);
    for (const m of all.matchAll(/§\s?(\d+(?:\.\d+)?)/g)) if (!allowed.has(m[1])) error(`§${m[1]} is not on the verified fact sheet (content/FACTS.md).`);
  }
  if (/\bsection \d/i.test(all)) warn("Cites a “Section N” without § - check it is on the fact sheet.");
  for (const w of wordingWarnings(texts)) warn(w);
  if (type === "attorney" && c.photo && !imageAllowed(c.photo, MEDIA_PREFIX)) error("Photo must come from the media library (or a /images/ file).");
  return out;
}

/** Advertising-rule warnings for free text (also used for statistics and testimonials). */
export function wordingWarnings(texts: string[]): string[] {
  const out: string[] = [];
  for (const t of texts) {
    for (const [re, why] of BANNED) {
      const m = t.match(re);
      if (m && !(why.startsWith("“guarantee”") && /\b(no|not|doesn.t|don.t|cannot|can.t)\b[^.]{0,30}guarantee/i.test(t))) {
        out.push(`${why}: “…${t.slice(Math.max(0, (m.index ?? 0) - 40), (m.index ?? 0) + 40)}…”`);
      }
    }
  }
  return out;
}
