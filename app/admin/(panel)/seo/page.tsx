import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { TYPE_LABELS } from "@/lib/admin/page-model";
import { allPagesLite, pageName, validationContext } from "@/lib/admin/pages";
import type { SiteSeo } from "@/lib/admin/settings-model";
import { validatePage } from "@/lib/admin/validate";
import { createClient } from "@/lib/supabase/server";
import { IndexingSwitch, SeoSettingsForm } from "./SeoSettingsForm";

export const metadata = { title: "SEO" };

const SUFFIX = " | California Law";

export default async function SeoPage() {
  const me = await requireStaff();
  const supabase = await createClient();
  const [pages, { data: settingsRow }] = await Promise.all([
    allPagesLite(),
    supabase.from("site_settings").select("value, updated_at").eq("key", "seo").maybeSingle(),
  ]);
  const settings = (settingsRow?.value ?? {}) as SiteSeo;
  const ctx = await validationContext(pages);

  // Page health, drafts included (what would be published next).
  const rows = pages.map((p) => {
    const issues = validatePage(p.type, p.path, p.content, p.seo, ctx);
    const title = p.seo.title ?? "";
    return {
      ...p,
      name: pageName(p),
      titleLen: p.type === "attorney" ? null : (p.seo.titleAbsolute ? title : title + SUFFIX).length,
      descLen: p.type === "attorney" ? null : (p.seo.description ?? "").length,
      errors: issues.filter((i) => i.level === "error").length,
      warnings: issues.filter((i) => i.level === "warning").length,
      live: p.status === "published" && !!p.published_content,
    };
  });
  rows.sort((a, b) => b.errors - a.errors || b.warnings - a.warnings);
  const totals = { errors: rows.reduce((n, r) => n + r.errors, 0), noindex: rows.filter((r) => r.seo.noindex).length };

  return (
    <>
      <h1 className="adm-h1">SEO</h1>

      <div className="adm-grid-2">
        <section className="adm-card">
          <h2 className="adm-h2">Search engine access</h2>
          {me.role === "admin" ? <IndexingSwitch on={!!settings.discourageIndexing} /> : (
            <p className={settings.discourageIndexing ? "adm-alert adm-alert--error" : "adm-muted"}>
              {settings.discourageIndexing ? "Search engines are currently blocked for the whole site." : "Search engines may index the site."}
            </p>
          )}
        </section>
        <section className="adm-card">
          <h2 className="adm-h2">Site-wide settings</h2>
          {me.role === "admin" ? <SeoSettingsForm value={settings} /> : (
            <ul className="adm-links">
              <li>Google verification: {settings.googleVerification ? "set" : "not set"}</li>
              <li>Bing verification: {settings.bingVerification ? "set" : "not set"}</li>
              <li>Analytics: {settings.gtmId ?? settings.ga4Id ?? "not set"}</li>
              <li className="adm-muted">Only admins can change these.</li>
            </ul>
          )}
        </section>
      </div>

      <section className="adm-card">
        <h2 className="adm-h2">Page health</h2>
        <p className="adm-muted">
          Checks on the current version of every page (unpublished drafts included).{" "}
          {totals.errors > 0 ? <strong>{totals.errors} problem{totals.errors === 1 ? "" : "s"} block publishing.</strong> : "Nothing blocks publishing."}
          {totals.noindex > 0 && <> {totals.noindex} page{totals.noindex === 1 ? " is" : "s are"} hidden from search engines.</>}
        </p>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Page</th><th>Title</th><th>Description</th><th>Settings</th><th>Checks</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/admin/pages/${r.id}`} className="ed-rowlink"><strong>{r.name}</strong></Link>
                    <div className="adm-muted">{TYPE_LABELS[r.type]} · {r.path}{r.live ? "" : " · not published"}</div>
                  </td>
                  <td>{r.titleLen === null ? <span className="adm-muted">auto</span> : <span className={r.titleLen > 60 ? "ed-count is-over" : undefined}>{r.titleLen}/60</span>}</td>
                  <td>{r.descLen === null ? <span className="adm-muted">auto</span> : <span className={r.descLen > 155 || r.descLen < 110 ? "ed-count is-over" : undefined}>{r.descLen}/155</span>}</td>
                  <td className="adm-muted">
                    {[r.seo.noindex && "noindex", r.seo.nofollow && "nofollow", r.seo.canonical && "canonical", r.seo.sitemapExclude && "not in sitemap", r.seo.jsonLd && "custom JSON-LD", r.seo.faqSchema === false && "no FAQ schema"].filter(Boolean).join(", ") || "-"}
                  </td>
                  <td>
                    {r.errors > 0 && <span className="adm-pill adm-pill--needs_review">{r.errors} to fix</span>}{" "}
                    {r.warnings > 0 && <span className="adm-pill">{r.warnings} to review</span>}
                    {r.errors === 0 && r.warnings === 0 && <span className="adm-pill adm-pill--reviewed">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
