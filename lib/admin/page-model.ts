// The page model shared by the admin editor (browser) and its Server Actions: page types, URL rules,
// templates for new pages, a structural check, and pages the site's code depends on.
// Pure - no server-only imports - so the editor can run the same checks live.
import { OFFICE_IDS } from "@/lib/firm";
import { hasStaticModel, staticShapeErrors } from "@/lib/admin/static-model";

export type PageType = "service" | "local" | "location" | "article" | "attorney" | "static";
/** Per-page SEO. Everything but title/description is optional; absent = the site default. */
export type Seo = {
  title?: string;
  description?: string;
  /** Use the title as-is, without " | California Law" (home page). */
  titleAbsolute?: boolean;
  /** Canonical URL if not this page's own URL: a site path ("/other-page") or an https:// URL. */
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  /** Social sharing (Open Graph / X) overrides. */
  ogTitle?: string;
  ogDescription?: string;
  /** Path under /public or an https:// image URL; default is the site share image. */
  ogImage?: string;
  /** false = leave the FAQ out of the structured data. */
  faqSchema?: boolean;
  /** Extra JSON-LD for this page: one JSON object with "@type" (or "@graph"). */
  jsonLd?: string;
  sitemapExclude?: boolean;
  /** 0.0–1.0; default is set by page type. */
  sitemapPriority?: number;
};

const SEO_KEYS: Record<keyof Seo, "string" | "boolean" | "number"> = {
  title: "string", description: "string", titleAbsolute: "boolean", canonical: "string", noindex: "boolean", nofollow: "boolean",
  ogTitle: "string", ogDescription: "string", ogImage: "string", faqSchema: "boolean", jsonLd: "string", sitemapExclude: "boolean", sitemapPriority: "number",
};

/** A path on this site or an https:// URL. */
export const isUrlOrPath = (v: string) => /^\/(?!\/)\S*$/.test(v) || /^https:\/\/[^\s]+$/.test(v);

/** Parse custom JSON-LD; returns the object or an error message. */
export function parseJsonLd(text: string): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  try {
    const v = JSON.parse(text);
    if (!v || typeof v !== "object" || Array.isArray(v)) return { ok: false, error: "Custom JSON-LD must be one JSON object." };
    if (!("@type" in v) && !("@graph" in v)) return { ok: false, error: "Custom JSON-LD needs an \"@type\" (or \"@graph\")." };
    return { ok: true, value: v };
  } catch (e) {
    return { ok: false, error: `Custom JSON-LD isn't valid JSON: ${(e as Error).message}` };
  }
}

/** Drop empty/default values so stored SEO only holds what was actually set. */
export function tidySeo(seo: Seo): Seo {
  const out: Seo = {};
  for (const [k, v] of Object.entries(seo) as [keyof Seo, unknown][]) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && !v.trim() && k !== "title" && k !== "description") continue;
    if (v === false && k !== "faqSchema") continue;
    if (k === "faqSchema" && v === true) continue;
    (out as Record<string, unknown>)[k] = typeof v === "string" ? v.trim() : v;
  }
  return out;
}
export type Json = Record<string, unknown>;

export const TYPE_LABELS: Record<PageType, string> = {
  static: "Main page",
  service: "Practice area",
  location: "Office",
  local: "City + practice area",
  article: "Guide",
  attorney: "Attorney",
};

export const SERVICE_GROUPS = ["Wrongful Death", "Vehicle Accidents", "Serious Injuries", "Other Practice Areas"] as const;
export const ARTICLE_CATEGORIES = ["After an Accident", "Insurance & Money", "Your Case", "Wrongful Death"] as const;
export { OFFICE_IDS };

// Top-level URLs taken by hand-built routes. A practice area can't use them.
const RESERVED = ["about", "contact", "practice-areas", "resources", "attorneys", "privacy", "disclaimer", "site-map", "thank-you", "admin", "api", "wrongful-death", "sitemap.xml", "robots.txt", "opengraph-image", ...OFFICE_IDS];
const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";

/** Why a URL can't be used for a new page of this type, or null if it can. */
export function pathError(type: PageType, path: string, existing: Iterable<string>): string | null {
  if ([...existing].includes(path)) return "A page with this URL already exists.";
  const top = path.split("/")[1] ?? "";
  switch (type) {
    case "service":
      if (new RegExp(`^/wrongful-death/${SLUG}$`).test(path)) return null;
      if (!new RegExp(`^/${SLUG}$`).test(path)) return "Use /your-page-name (lowercase words joined by hyphens), or /wrongful-death/your-page-name.";
      return RESERVED.includes(top) ? `/${top} is already used by the site.` : null;
    case "local":
      if (!new RegExp(`^/(${OFFICE_IDS.join("|")})/${SLUG}$`).test(path)) return `Use /<office>/<page-name>, where <office> is one of: ${OFFICE_IDS.join(", ")}.`;
      return null;
    case "location":
      return OFFICE_IDS.includes(path.slice(1)) ? null : `Office pages must be one of: ${OFFICE_IDS.map((o) => `/${o}`).join(", ")}.`;
    case "article":
      return new RegExp(`^/resources/${SLUG}$`).test(path) ? null : "Use /resources/your-guide-name.";
    case "attorney":
      return new RegExp(`^/attorneys/${SLUG}$`).test(path) ? null : "Use /attorneys/first-last.";
    case "static":
      return "Main pages are part of the site's code and can't be created here.";
  }
}

const today = () => new Date().toISOString().slice(0, 10);

/** Content for a brand-new draft. */
export function template(type: PageType, path: string, name: string): { content: Json; seo: Seo } {
  const seo: Seo = { title: name, description: "" };
  const page = { slug: path, name, h1: name, heroText: "", summary: "", intro: "", sections: [{ heading: "", blocks: [{ p: "" }] }], faqs: [{ q: "", a: "" }], updated: today() };
  switch (type) {
    case "service":
      return { content: { ...page, group: path.startsWith("/wrongful-death/") ? "Wrongful Death" : "Other Practice Areas", related: [] }, seo };
    case "local":
      return { content: { ...page, group: "Vehicle Accidents", related: [], location: path.split("/")[1] }, seo };
    case "location":
      return { content: { ...page, officeId: path.slice(1), areasServed: [], courts: [] }, seo };
    case "article":
      return { content: { ...page, category: ARTICLE_CATEGORIES[0], services: [], related: [], published: today() }, seo };
    case "attorney":
      return { content: { slug: path.split("/")[2], name, title: "", barNumber: "", admitted: "", offices: [], practiceAreas: [], education: [], bio: [{ p: "" }] }, seo: {} };
    case "static":
      return { content: { name, group: "Firm" }, seo };
  }
}

// ---------------------------------------------------------------- structural check

type Check = (v: unknown) => boolean;
const str: Check = (v) => typeof v === "string";
const strArr: Check = (v) => Array.isArray(v) && v.every(str);
const isObj = (v: unknown): v is Json => !!v && typeof v === "object" && !Array.isArray(v);
const block: Check = (b) => isObj(b) && Object.keys(b).length === 1 && (str(b.p) || str(b.callout) || strArr(b.ul) || strArr(b.ol));
const blocks: Check = (v) => Array.isArray(v) && v.every(block);
const sections: Check = (v) => Array.isArray(v) && v.every((s) => isObj(s) && str(s.heading) && blocks(s.blocks));
const faqs: Check = (v) => Array.isArray(v) && v.every((f) => isObj(f) && str(f.q) && str(f.a));
const steps: Check = (v) => v === undefined || (isObj(v) && str(v.heading) && Array.isArray(v.items) && v.items.every((i) => isObj(i) && str(i.title) && str(i.text)));
const courts: Check = (v) => Array.isArray(v) && v.every((c) => isObj(c) && str(c.name) && str(c.address) && str(c.url) && (c.note === undefined || str(c.note)));
const education: Check = (v) => Array.isArray(v) && v.every((e) => isObj(e) && str(e.school) && str(e.degree) && (e.year === undefined || str(e.year)));
const optStrArr: Check = (v) => v === undefined || strArr(v);
const oneOf = (list: readonly string[]): Check => (v) => str(v) && list.includes(v as string);

const PAGE_FIELDS: Record<string, Check> = { slug: str, name: str, h1: str, heroText: str, summary: str, intro: str, sections, faqs, steps, updated: str };
const SHAPES: Record<PageType, Record<string, Check>> = {
  service: { ...PAGE_FIELDS, group: oneOf(SERVICE_GROUPS), related: strArr },
  local: { ...PAGE_FIELDS, group: oneOf(SERVICE_GROUPS), related: strArr, location: oneOf(OFFICE_IDS) },
  location: { ...PAGE_FIELDS, officeId: oneOf(OFFICE_IDS), areasServed: strArr, courts },
  article: { ...PAGE_FIELDS, category: oneOf(ARTICLE_CATEGORIES), services: strArr, related: strArr, published: str },
  attorney: { slug: str, name: str, title: str, barNumber: str, admitted: str, photo: (v) => v === undefined || str(v), offices: strArr, practiceAreas: strArr, education, bio: blocks, memberships: optStrArr, languages: optStrArr },
  static: { name: str, group: oneOf(["Firm", "Legal", "Locations", "Resources", ...SERVICE_GROUPS]) },
};

/**
 * Fields that are missing or the wrong type. The site builds hubs, cards and the sitemap from every
 * published page, so a malformed page could break other pages - the server refuses to save one.
 */
export function shapeErrors(type: PageType, content: unknown, seo: unknown, path = ""): string[] {
  const out: string[] = [];
  if (!isObj(content)) return ["Content is not an object."];
  if (type === "static" && hasStaticModel(path)) {
    // Main pages: their editable text fields (lib/admin/static-model.ts).
    out.push(...staticShapeErrors(path, content));
  } else {
    const shape = SHAPES[type];
    for (const [k, ok] of Object.entries(shape)) if (!ok(content[k])) out.push(`Field "${k}" is missing or has the wrong format.`);
    for (const k of Object.keys(content)) if (!(k in shape)) out.push(`Unknown field "${k}".`);
  }
  if (!isObj(seo)) out.push("SEO settings are not an object.");
  else {
    for (const [k, v] of Object.entries(seo)) {
      const want = SEO_KEYS[k as keyof Seo];
      if (!want) out.push(`Unknown SEO setting "${k}".`);
      else if (typeof v !== want) out.push(`SEO setting "${k}" must be a ${want}.`);
    }
    if (typeof seo.sitemapPriority === "number" && !(seo.sitemapPriority >= 0 && seo.sitemapPriority <= 1)) out.push("Sitemap priority must be between 0 and 1.");
    for (const k of ["canonical", "ogImage"] as const) if (typeof seo[k] === "string" && !isUrlOrPath(seo[k] as string)) out.push(`SEO "${k}" must be a site path (/…) or an https:// URL.`);
    if (typeof seo.jsonLd === "string") { const r = parseJsonLd(seo.jsonLd); if (!r.ok) out.push(r.error); }
  }
  return out;
}

// ---------------------------------------------------------------- dependencies

// Pages the site's code relies on. Unpublishing or deleting them would crash or break other pages
// until the code is changed (header/footer/home links become editable in later phases).
const CODE_LINKED: Record<string, string> = {
  "/wrongful-death/car-accident": "listed on the Wrongful Death page",
  "/wrongful-death/truck-accident": "listed on the Wrongful Death page",
  "/wrongful-death/medical-malpractice": "listed on the Wrongful Death page",
  "/wrongful-death/workplace": "listed on the Wrongful Death page",
  "/wrongful-death/who-can-file": "listed on the Wrongful Death page",
  "/wrongful-death/survival-action": "listed on the Wrongful Death page",
  "/wrongful-death/statute-of-limitations": "listed on the Wrongful Death page",
  "/car-accident-lawyer": "linked from the home page and footer",
  "/truck-accident-lawyer": "linked from the footer",
  "/medical-malpractice-lawyer": "linked from the home page and footer",
  "/catastrophic-injury-lawyer": "linked from the home page and footer",
  "/workplace-injury-lawyer": "linked from the home page and footer",
  "/premises-liability-lawyer": "linked from the home page",
};

/** Why this page can't be unpublished or deleted, or null. */
export function protectedReason(type: PageType, path: string): string | null {
  if (type === "static") return "Main pages are part of the site's structure and can't be unpublished or deleted.";
  if (type === "location") return "Office pages are tied to the office list in the site settings and can't be unpublished or deleted yet.";
  const why = CODE_LINKED[path];
  return why ? `This page is ${why}, so it can't be unpublished or deleted.` : null;
}

/** Pages whose content links to `path` (related cards, guide/attorney practice areas, text links). */
export function referencesTo(path: string, pages: { path: string; name: string; content: Json }[]): { path: string; name: string }[] {
  return pages
    .filter((p) => p.path !== path)
    .filter((p) => {
      const c = p.content;
      const lists = [c.related, c.services, c.practiceAreas].filter(Array.isArray) as string[][];
      if (lists.some((l) => l.includes(path))) return true;
      return JSON.stringify(c).includes(`](${path})`) || JSON.stringify(c).includes(`](${path}#`);
    })
    .map((p) => ({ path: p.path, name: p.name }));
}

/** Stable JSON (sorted keys) for comparing a draft with its published copy. */
export function stableJson(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stableJson).join(",")}]`;
  if (isObj(v)) return `{${Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${stableJson(v[k])}`).join(",")}}`;
  return JSON.stringify(v);
}
