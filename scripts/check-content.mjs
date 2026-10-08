// Checks every content page before building: content/services/ (practice areas),
// content/locations/ (office pages) and content/local/ (city + service pages).
//   npm run check:content            (all pages)
//   npm run check:content -- truck   (only files whose path contains "truck", e.g. "local/" or "san-diego")
// Errors fail the run; warnings are things to review by hand.
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["services", "locations", "local", "articles"];
const filter = process.argv[2] || "";

// Every page that exists or is planned (links to planned pages are allowed).
const STATIC = ["/", "/about", "/contact", "/practice-areas", "/wrongful-death", "/privacy", "/disclaimer", "/site-map"];
const SERVICES = [
  "/wrongful-death/car-accident", "/wrongful-death/truck-accident", "/wrongful-death/medical-malpractice",
  "/wrongful-death/workplace", "/wrongful-death/who-can-file", "/wrongful-death/survival-action", "/wrongful-death/statute-of-limitations",
  "/car-accident-lawyer", "/truck-accident-lawyer", "/motorcycle-accident-lawyer", "/rideshare-accident-lawyer",
  "/pedestrian-accident-lawyer", "/bicycle-accident-lawyer",
  "/catastrophic-injury-lawyer", "/brain-injury-lawyer", "/spinal-cord-injury-lawyer", "/burn-injury-lawyer",
  "/medical-malpractice-lawyer", "/nursing-home-abuse-lawyer", "/premises-liability-lawyer", "/dog-bite-lawyer",
  "/product-liability-lawyer", "/workplace-injury-lawyer", "/government-claims-lawyer",
];
const OFFICES = ["los-angeles", "orange-county", "san-diego", "bay-area", "sacramento", "inland-empire"];
const LOCATIONS = OFFICES.map((o) => `/${o}`);
const LOCAL = ["los-angeles", "orange-county", "san-diego"].flatMap((o) =>
  ["car-accident-lawyer", "truck-accident-lawyer", "wrongful-death-lawyer"].map((s) => `/${o}/${s}`));
const ARTICLES = [
  "how-to-get-a-california-collision-report", "talking-to-insurance-adjuster", "contingency-fees-california",
  "uninsured-motorist-claims-california", "how-long-personal-injury-case-takes", "pain-and-suffering-california",
  "who-pays-medical-bills-after-accident", "wrongful-death-settlement-distribution",
].map((a) => `/resources/${a}`);
const PLANNED = { services: SERVICES, locations: LOCATIONS, local: LOCAL, articles: ARTICLES };
const KNOWN = new Set([...STATIC, "/resources", ...SERVICES, ...LOCATIONS, ...LOCAL, ...ARTICLES]);

// Section numbers allowed: whatever is bolded as "**Code §x**" in content/FACTS.md.
const facts = readFileSync(join(root, "content", "FACTS.md"), "utf8");
const ALLOWED = new Set([...facts.matchAll(/§\s?(\d+(?:\.\d+)?)/g)].map((m) => m[1]));

const BANNED = [
  [/\bspeciali(st|sts|ze|zes|zed|zing|se)\b/i, "“specialist/specialize” (Rule 7.4 — only certified specialists may use it)"],
  [/\bexpert (lawyer|attorney|trial|team|legal|representation)|\bexperts in\b|\bour experts?\b/i, "calls the firm “expert”"],
  [/\b(the )?best\b/i, "“best” (unverifiable comparison)"],
  [/\bguarantee/i, "“guarantee” — fine only in a disclaimer (“no guarantee”)"],
  [/\b(number one|#1|top[- ]rated|leading|premier|award[- ]winning)\b/i, "unverifiable superlative"],
  [/\$\s?\d[\d,.]*\s?(million|billion|M)\b|\brecovered\b|\bverdicts? of\b|\bsettlements? of\b/i, "possible case-result claim"],
  [/\b\d{1,3}(\.\d)?%\s+of\s+(all\s+)?(crashes|accidents|deaths|cases|claims)/i, "statistic not on the fact sheet"],
];

const files = DIRS.flatMap((d) => {
  try {
    return readdirSync(join(root, "content", d)).filter((f) => f.endsWith(".ts") && f !== "index.ts").map((f) => `${d}/${f}`);
  } catch {
    return [];
  }
}).filter((f) => f.includes(filter));
const seen = { title: new Map(), h1: new Map(), description: new Map() };
let errors = 0, warnings = 0;
const err = (f, m) => { errors++; console.log(`  ✗ ${m}`); };
const warn = (f, m) => { warnings++; console.log(`  ! ${m}`); };

const textOf = (s) => [
  s.heroText, s.intro, s.summary, ...(s.areasServed ?? []), ...(s.courts ?? []).flatMap((c) => [c.name, c.note ?? ""]),
  ...(s.steps ? [s.steps.heading, ...s.steps.items.flatMap((i) => [i.title, i.text])] : []),
  ...s.sections.flatMap((sec) => [sec.heading, ...sec.blocks.flatMap((b) => b.p ?? b.callout ?? b.ul ?? b.ol)]),
  ...s.faqs.flatMap((f) => [f.q, f.a]),
];

for (const path of files) {
  const [kind, f] = path.split("/");
  console.log(`\n${path}`);
  let s;
  try {
    s = (await import(pathToFileURL(join(root, "content", kind, f)).href)).default;
  } catch (e) {
    err(f, `failed to load: ${e.message}`);
    continue;
  }
  const expected = `${s.slug.slice(1).replace("/", "--")}.ts`; // /wrongful-death/x -> wrongful-death--x.ts
  if (f !== expected) err(f, `file should be named ${expected} for slug ${s.slug}`);
  if (!PLANNED[kind].includes(s.slug)) err(f, `slug ${s.slug} is not in the planned ${kind} page list`);
  if (kind === "locations" && s.officeId !== s.slug.slice(1)) err(f, `officeId must be "${s.slug.slice(1)}"`);
  if (kind === "local" && s.location !== s.slug.split("/")[1]) err(f, `location must be "${s.slug.split("/")[1]}"`);
  if (kind === "locations") {
    if (s.courts.length === 0) err(f, "no courts listed");
    for (const c of s.courts) if (!/^https:\/\//.test(c.url)) err(f, `court URL must be https: ${c.name}`);
    if (s.areasServed.length < 5) warn(f, `only ${s.areasServed.length} areas served`);
  }

  const full = `${s.title} | California Law`;
  if (full.length > 60) err(f, `title too long: ${full.length} chars incl. suffix (max 60) — "${s.title}"`);
  if (s.description.length > 155) err(f, `description ${s.description.length} chars (max 155)`);
  if (s.description.length < 110) warn(f, `description only ${s.description.length} chars`);
  if (s.summary.length > 160) err(f, `summary ${s.summary.length} chars (max 160)`);
  for (const k of ["title", "h1", "description"]) {
    if (seen[k].has(s[k])) err(f, `duplicate ${k} — same as ${seen[k].get(s[k])}`);
    seen[k].set(s[k], f);
  }

  if (s.steps && (s.steps.items.length < 3 || s.steps.items.length > 7)) warn(f, `${s.steps.items.length} steps (aim for 3–6)`);
  if (s.faqs.length < 4 || s.faqs.length > 8) warn(f, `${s.faqs.length} FAQs (aim for 5–8)`);
  if (kind === "articles") {
    if (!s.services?.length) err(f, "articles need at least one practice-area slug in `services`");
    for (const r of s.services ?? []) if (!SERVICES.includes(r) && r !== "/wrongful-death") err(f, `services: not a practice-area page: ${r}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.published ?? "")) err(f, "published must be YYYY-MM-DD");
  }
  if (s.related) {
    if (s.related.length < 3 || s.related.length > 4) warn(f, `${s.related.length} related pages (aim for 3–4)`);
    for (const r of s.related) {
      if (!KNOWN.has(r)) err(f, `related page not found: ${r}`);
      if (r === s.slug) err(f, "related list includes the page itself");
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.updated)) err(f, `updated must be YYYY-MM-DD`);

  const texts = textOf(s);
  const all = texts.join("\n");
  const words = all.split(/\s+/).filter(Boolean).length;
  console.log(`  ${words} words, ${s.sections.length} sections, ${s.faqs.length} FAQs`);
  if (words < 1100) warn(f, `only ${words} words`);

  for (const m of all.matchAll(/\]\(([^)]+)\)/g)) {
    const href = m[1];
    if (href.startsWith("/") && !KNOWN.has(href.split("#")[0])) err(f, `broken link: ${href}`);
    if (href === s.slug) warn(f, `links to itself: ${href}`);
  }
  for (const m of all.matchAll(/§\s?(\d+(?:\.\d+)?)/g)) {
    if (!ALLOWED.has(m[1])) err(f, `§${m[1]} is not on the fact sheet (content/FACTS.md)`);
  }
  if (/\bsection \d/i.test(all)) warn(f, `cites a "Section N" without § — check it is on the fact sheet`);
  for (const t of texts) {
    for (const [re, why] of BANNED) {
      const m = t.match(re);
      if (m && !(why.startsWith("“guarantee”") && /\b(no|not|doesn.t|don.t|cannot|can.t)\b[^.]{0,30}guarantee/i.test(t)))
        warn(f, `${why}: “…${t.slice(Math.max(0, m.index - 40), m.index + 40)}…”`);
    }
  }
}

console.log(`\n${files.length} file(s): ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
