// Crawls a running build and checks on-page SEO for every page in the sitemap.
//   1. NEXT_PUBLIC_SITE_URL=https://www.example.com npm run build && npx next start -p 3100
//   2. node scripts/seo-audit.mjs http://localhost:3100 https://www.example.com
// Prints one line per problem; exits 1 if any errors.
const [base = "http://localhost:3100", site = ""] = process.argv.slice(2);
const get = async (path) => {
  const r = await fetch(base + path, { redirect: "manual" });
  return { status: r.status, html: r.status === 200 ? await r.text() : "", location: r.headers.get("location") };
};
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const attr = (tag, name) => decode((tag.match(new RegExp(`${name}="([^"]*)"`)) || [])[1] ?? "");
const metas = (html) => [...html.matchAll(/<meta\s[^>]*>/g)].map((m) => m[0]);
const meta = (html, key) => {
  const t = metas(html).find((m) => attr(m, "name") === key || attr(m, "property") === key);
  return t ? attr(t, "content") : "";
};

const problems = [];
const add = (level, path, msg) => problems.push({ level, path, msg });

// ---- sitemap + robots
const sm = await get("/sitemap.xml");
const paths = [...sm.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(site, "") || "/");
if (!paths.length) add("error", "/sitemap.xml", "sitemap is empty (build with NEXT_PUBLIC_SITE_URL set)");
const robots = await get("/robots.txt");
if (!/Sitemap: /.test(robots.html)) add("error", "/robots.txt", "no Sitemap line");
if (/Disallow: \/\s*$/m.test(robots.html)) add("error", "/robots.txt", "blocks the whole site");

// ---- pages
const seen = { title: new Map(), description: new Map(), h1: new Map() };
const inbound = new Map(paths.map((p) => [p, new Set()]));
const allLinks = new Map(); // target -> first source
const rows = [];
for (const path of paths) {
  const { status, html } = await get(path);
  if (status !== 200) { add("error", path, `status ${status}`); continue; }
  const E = (m) => add("error", path, m);
  const W = (m) => add("warn", path, m);

  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] ?? "");
  const desc = meta(html, "description");
  if (!title) E("missing <title>");
  else if (title.length > 60) W(`title ${title.length} chars (>60): ${title}`);
  else if (title.length < 25) W(`title only ${title.length} chars: ${title}`);
  if (!desc) E("missing meta description");
  else if (desc.length > 160) W(`description ${desc.length} chars (>160)`);
  else if (desc.length < 70) W(`description only ${desc.length} chars`);

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => decode(m[1].replace(/<[^>]+>/g, "")).trim());
  if (h1s.length !== 1) E(`${h1s.length} <h1> tags`);
  for (const [k, v] of [["title", title], ["description", desc], ["h1", h1s[0]]]) {
    if (!v) continue;
    if (seen[k].has(v)) E(`duplicate ${k} (same as ${seen[k].get(v)})`);
    else seen[k].set(v, path);
  }

  // heading order inside <main>: no skipped levels
  const main = (html.match(/<main[\s\S]*<\/main>/) || [html])[0];
  let prev = 0;
  for (const m of main.matchAll(/<h([1-6])[\s>]/g)) {
    const lvl = +m[1];
    if (prev && lvl > prev + 1) { W(`heading jumps from h${prev} to h${lvl}`); break; }
    prev = lvl;
  }

  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const want = site + (path === "/" ? "" : path);
  if (!canonical) E("missing canonical");
  else if (canonical !== want) E(`canonical ${canonical} ≠ ${want}`);
  if (/noindex/.test(meta(html, "robots"))) E("in sitemap but noindex");

  for (const k of ["og:title", "og:description", "og:image", "og:url", "og:type", "twitter:card", "twitter:image"]) if (!meta(html, k)) E(`missing ${k}`);
  if (meta(html, "og:url") && meta(html, "og:url") !== want) E(`og:url ${meta(html, "og:url")} ≠ ${want}`);
  if (!/<html[^>]*lang="en"/.test(html)) E("missing html lang");
  if (!meta(html, "viewport")) E("missing viewport");

  // structured data
  const types = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const j = JSON.parse(m[1]); for (const n of j["@graph"] || [j]) types.push(n["@type"]); }
    catch { E("invalid JSON-LD"); }
  }
  if (!types.includes("LegalService")) E("no LegalService JSON-LD");
  if (path !== "/" && !types.includes("BreadcrumbList")) E("no BreadcrumbList JSON-LD");
  const depth = path.split("/").length - 1;
  const isContent = /-lawyer$|^\/wrongful-death\/|^\/resources\/|^\/(los-angeles|orange-county|san-diego|bay-area|sacramento|inland-empire)/.test(path);
  if (isContent && !types.includes("FAQPage")) E("content page without FAQPage JSON-LD");
  if (/^\/resources\/./.test(path) && !types.includes("Article")) E("guide without Article JSON-LD");

  // images
  for (const m of main.matchAll(/<img\s[^>]*>/g)) {
    if (!/\salt="/.test(m[0])) E(`image without alt: ${attr(m[0], "src").slice(0, 60)}`);
    if (!/\swidth="/.test(m[0]) || !/\sheight="/.test(m[0])) W(`image without width/height: ${attr(m[0], "src").slice(0, 60)}`);
  }

  // links
  const words = main.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  let internal = 0;
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>/g)) {
    const href = decode(m[1]);
    if (href.startsWith("/")) {
      const target = href.split("#")[0] || "/";
      internal++;
      if (inMain(main, m[0]) && inbound.has(target) && target !== path) inbound.get(target).add(path);
      if (!allLinks.has(target)) allLinks.set(target, path);
      if (/\.html$/.test(target)) W(`links to old .html URL: ${target}`);
    } else if (href.startsWith("http") && !/rel="[^"]*noopener/.test(m[0])) W(`external link without rel=noopener: ${href.slice(0, 60)}`);
    else if (href === "#") W("placeholder link href=\"#\"");
  }
  if (words < 250 && isContent) W(`thin content: ${words} words`);
  rows.push({ path, title: title.length, desc: desc.length, words, depth, types: [...new Set(types)].join("+") });
}
function inMain(main, tag) { return main.includes(tag); }

// ---- every internal link resolves (no redirects, no 404s)
for (const [target, source] of allLinks) {
  const r = await get(target);
  if (r.status !== 200) add("error", source, `links to ${target} → ${r.status}${r.location ? " " + r.location : ""}`);
  else if (!paths.includes(target) && !/^\/(thank-you|opengraph-image|assets|images|_next)/.test(target)) add("warn", source, `links to ${target}, which is not in the sitemap`);
}
// ---- orphans: sitemap pages with no in-content link from another page (nav/footer don't count)
for (const [p, from] of inbound) if (p !== "/" && from.size === 0) add("warn", p, "no in-content links from other pages (only nav/footer, or none)");
// ---- pages that must stay out of the index
const ty = await get("/thank-you");
if (!/noindex/.test(meta(ty.html, "robots"))) add("error", "/thank-you", "should be noindex");
if (paths.includes("/thank-you")) add("error", "/thank-you", "should not be in the sitemap");
const nf = await get("/this-page-does-not-exist");
if (nf.status !== 404) add("error", "/this-page-does-not-exist", `expected 404, got ${nf.status}`);

// ---- report
const errors = problems.filter((p) => p.level === "error"), warns = problems.filter((p) => p.level === "warn");
for (const p of [...errors, ...warns]) console.log(`${p.level === "error" ? "✗" : "!"} ${p.path} — ${p.msg}`);
const avg = (k) => Math.round(rows.reduce((s, r) => s + r[k], 0) / rows.length);
console.log(`\n${rows.length} pages audited · ${errors.length} error(s) · ${warns.length} warning(s)`);
console.log(`titles ${Math.min(...rows.map((r) => r.title))}–${Math.max(...rows.map((r) => r.title))} chars (avg ${avg("title")}) · descriptions ${Math.min(...rows.map((r) => r.desc))}–${Math.max(...rows.map((r) => r.desc))} (avg ${avg("desc")}) · words/page avg ${avg("words")}`);
console.log(`least-linked pages: ${[...inbound].filter(([p]) => p !== "/").sort((a, b) => a[1].size - b[1].size).slice(0, 6).map(([p, s]) => `${p} (${s.size})`).join(", ")}`);
process.exit(errors.length ? 1 : 0);
