// Imports the seed content files (content/) into the Supabase `pages` table, published.
//
//   npm run content:import                 import pages that are not in the database yet
//   npm run content:import -- --dry-run    show what would happen, write nothing
//   npm run content:import -- --force /car-accident-lawyer /about
//                                          overwrite these paths with the file version (discards
//                                          edits made in the admin panel for them)
//   npm run content:import -- --settings
//                                          add firm details + statistics/testimonials (content/firm.ts)
//                                          to site_settings ("firm", "credibility") unless present;
//                                          --force firm / --force credibility overwrites
//   npm run content:import -- --static-text
//                                          add the main pages' editable text (content/static-text.ts)
//                                          to their database rows; pages that already have it are
//                                          skipped unless listed after --force
//
// Existing rows are never touched without --force, so re-running is safe. Every written row is read
// back and compared with its source file. The deployed site keeps serving cached content until it is
// rebuilt or refreshed from the admin panel.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const forceIdx = args.indexOf("--force");
const force = new Set(forceIdx >= 0 ? args.slice(forceIdx + 1).filter((a) => a.startsWith("/")) : []);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const load = async (rel) => import(pathToFileURL(join(root, rel)).href);

// Registries import their pages without file extensions, which Node can't resolve, so read the
// display order from the registry source and import each page file directly.
async function registry(dir, exportName) {
  const src = readFileSync(join(root, "content", dir, "index.ts"), "utf8");
  const files = Object.fromEntries([...src.matchAll(/^import (\w+) from "\.\/([\w-]+)";$/gm)].map((m) => [m[1], m[2]]));
  const list = src.match(new RegExp(`export const ${exportName}[^=]*=\\s*\\[([\\s\\S]*?)\\];`))?.[1];
  if (!list) throw new Error(`content/${dir}/index.ts: ${exportName} not found`);
  const ids = list.split(",").map((s) => s.trim()).filter(Boolean);
  return Promise.all(ids.map(async (id) => {
    if (!files[id]) throw new Error(`content/${dir}/index.ts: no import for ${id}`);
    return (await load(`content/${dir}/${files[id]}.ts`)).default;
  }));
}

// Content-file object -> pages row. title/description move to `seo`; reviewedBy/reviewed to columns.
function row(type, path, source, sortOrder) {
  const { title, description, titleAbsolute, reviewedBy, reviewed, ...content } = source;
  const seo = { title, description, ...(titleAbsolute && { titleAbsolute }) };
  return {
    path,
    type,
    status: "published",
    content,
    seo,
    published_content: content,
    published_seo: seo,
    published_at: new Date().toISOString(),
    review_status: reviewedBy ? "reviewed" : "not_reviewed",
    reviewed_by: reviewedBy ?? null,
    reviewed_at: reviewed ?? null,
    sort_order: sortOrder,
  };
}

/** Rebuild the content-file object from a stored row (what the site's loader does). */
function merge(r) {
  return {
    ...r.published_content,
    ...(r.published_seo.title !== undefined && { title: r.published_seo.title }),
    ...(r.published_seo.description !== undefined && { description: r.published_seo.description }),
    ...(r.published_seo.titleAbsolute && { titleAbsolute: true }),
    ...(r.reviewed_by && { reviewedBy: r.reviewed_by }),
    ...(r.reviewed_at && { reviewed: r.reviewed_at }),
  };
}

// --- firm details + credibility (Phase 6): site_settings rows.
if (args.includes("--settings")) {
  const { FIRM, CREDIBILITY } = await load("content/firm.ts");
  const forceKeys = new Set(forceIdx >= 0 ? args.slice(forceIdx + 1) : []);
  let failed = 0;
  for (const [key, value] of [["firm", FIRM], ["credibility", CREDIBILITY]]) {
    const { data: existing } = await db.from("site_settings").select("key").eq("key", key).maybeSingle();
    if (existing && !forceKeys.has(key)) { console.log(`skipped ${key} (already in the database)`); continue; }
    if (dryRun) { console.log(`would write ${key}`); continue; }
    const { data: saved, error } = await db.from("site_settings").upsert({ key, value }).select().single();
    if (error) { failed++; console.error(`FAILED ${key}: ${error.message}`); continue; }
    if (!isDeepStrictEqual(saved.value, value)) { failed++; console.error(`MISMATCH ${key}`); continue; }
    console.log(`wrote ${key}`);
  }
  process.exit(failed ? 1 : 0);
}

// --- main pages' text (Phase 5): merged into the existing static rows, draft and published copies.
if (args.includes("--static-text")) {
  const { STATIC_TEXT } = await load("content/static-text.ts");
  const { data: rows, error } = await db.from("pages").select("id, path, content, seo, published_content").eq("type", "static");
  if (error) throw error;
  let done = 0, skipped = 0, failed = 0;
  for (const [path, text] of Object.entries(STATIC_TEXT)) {
    const row = rows.find((r) => r.path === path);
    if (!row) { failed++; console.error(`MISSING static page ${path} - run the normal import first`); continue; }
    const has = Object.keys(text).every((k) => k in row.content);
    if (has && !force.has(path)) { skipped++; continue; }
    const content = { name: row.content.name, group: row.content.group, ...text };
    const published = { name: (row.published_content ?? row.content).name, group: (row.published_content ?? row.content).group, ...text };
    if (dryRun) { console.log(`would add text to ${path}`); continue; }
    const { data: saved, error: upErr } = await db.from("pages").update({ content, published_content: published }).eq("id", row.id).select().single();
    if (upErr) { failed++; console.error(`FAILED ${path}: ${upErr.message}`); continue; }
    await db.from("page_revisions").insert({ page_id: row.id, content: saved.content, seo: saved.seo, note: "Imported page text from content/static-text.ts" });
    const { name: _n, group: _g, ...back } = saved.published_content;
    if (!isDeepStrictEqual(back, text)) { failed++; console.error(`MISMATCH ${path}: stored text differs from content/static-text.ts`); continue; }
    done++;
    console.log(`added text to ${path}`);
  }
  console.log(`
${Object.keys(STATIC_TEXT).length} main pages: ${done} updated, ${skipped} already had text (skipped), ${failed} failed.${dryRun ? " (dry run)" : ""}`);
  process.exit(failed ? 1 : 0);
}

const [services, local, locations, articles, { ATTORNEYS }, { STATIC_PAGES }] = await Promise.all([
  registry("services", "SERVICE_PAGES"),
  registry("local", "LOCAL_PAGES"),
  registry("locations", "LOCATION_PAGES"),
  registry("articles", "ARTICLES"),
  load("content/attorneys.ts"),
  load("content/static-pages.ts"),
]);

const plan = [
  ...services.map((p, i) => [row("service", p.slug, p, i), p]),
  ...local.map((p, i) => [row("local", p.slug, p, i), p]),
  ...locations.map((p, i) => [row("location", p.slug, p, i), p]),
  ...articles.map((p, i) => [row("article", p.slug, p, i), p]),
  ...ATTORNEYS.map((a, i) => [row("attorney", `/attorneys/${a.slug}`, a, i), a]),
  ...STATIC_PAGES.map((s, i) => {
    const { path, ...rest } = s;
    return [row("static", path, rest, i), rest];
  }),
];

const paths = plan.map(([r]) => r.path);
const dupes = paths.filter((p, i) => paths.indexOf(p) !== i);
if (dupes.length) throw new Error(`Duplicate paths: ${dupes.join(", ")}`);

const { data: existing, error: exErr } = await db.from("pages").select("path");
if (exErr) throw exErr;
const have = new Set(existing.map((r) => r.path));

let created = 0, overwritten = 0, skipped = 0, failed = 0;
for (const [r, source] of plan) {
  const exists = have.has(r.path);
  if (exists && !force.has(r.path)) { skipped++; continue; }
  const verb = exists ? "overwrite" : "create";
  if (dryRun) { console.log(`would ${verb} ${r.type.padEnd(8)} ${r.path}`); continue; }

  const { data: saved, error } = await db.from("pages").upsert(r, { onConflict: "path" }).select().single();
  if (error) { failed++; console.error(`FAILED ${r.path}: ${error.message}`); continue; }
  await db.from("page_revisions").insert({ page_id: saved.id, content: saved.content, seo: saved.seo, note: `Imported from content files (${verb})` });

  // Read back and compare with the source file.
  if (!isDeepStrictEqual(merge(saved), source)) {
    failed++;
    console.error(`MISMATCH ${r.path}: stored page differs from its source file`);
    continue;
  }
  exists ? overwritten++ : created++;
  console.log(`${verb}d ${r.type.padEnd(8)} ${r.path}`);
}

console.log(`\n${plan.length} pages in content files: ${created} created, ${overwritten} overwritten, ${skipped} already in the database (skipped), ${failed} failed.${dryRun ? " (dry run)" : ""}`);
if (failed) process.exit(1);
