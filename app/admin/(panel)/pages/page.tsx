import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { stableJson } from "@/lib/admin/page-model";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Pages" };

const TYPES = [
  { type: "static", label: "Main pages" },
  { type: "service", label: "Practice areas" },
  { type: "location", label: "Offices" },
  { type: "local", label: "City + practice area" },
  { type: "article", label: "Guides" },
  { type: "attorney", label: "Attorneys" },
] as const;

const REVIEW: Record<string, string> = { not_reviewed: "Not reviewed", needs_review: "Needs review", reviewed: "Reviewed" };

type Row = {
  id: string;
  path: string;
  type: string;
  status: string;
  review_status: string;
  updated_at: string;
  content: { name?: string; updated?: string };
  seo: { title?: string };
  published_content: { updated?: string } | null;
  published_seo: unknown;
};

const strip = (c: object | null) => (c ? stableJson({ ...c, updated: undefined }) : "");

type Props = { searchParams: Promise<{ deleted?: string; to?: string }> };

export default async function PagesList({ searchParams }: Props) {
  const me = await requireStaff();
  const { deleted, to } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("id, path, type, status, review_status, updated_at, content, seo, published_content, published_seo")
    .order("sort_order");
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];
  const needsReview = rows.filter((r) => r.review_status === "needs_review").length;

  return (
    <>
      <div className="ed-titlebar">
        <h1 className="adm-h1">Pages</h1>
        {me.role !== "reviewer" && <Link href="/admin/pages/new" className="adm-btn adm-btn--primary">New page</Link>}
      </div>
      {deleted && <p className="adm-alert adm-alert--ok">Deleted {deleted}.{to && <> Visitors are now sent to {to}.</>}</p>}
      <p className="adm-muted">
        {rows.length} pages.{needsReview > 0 && <> <strong>{needsReview}</strong> changed since their attorney review.</>}
      </p>
      {TYPES.map(({ type, label }) => {
        const list = rows.filter((r) => r.type === type);
        if (!list.length) return null;
        return (
          <section className="adm-card" key={type}>
            <h2 className="adm-h2">{label} <span className="adm-muted">({list.length})</span></h2>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr><th>Page</th><th>Status</th><th>Attorney review</th><th>Updated</th></tr>
                </thead>
                <tbody>
                  {list.map((r) => {
                    const live = r.status === "published" && r.published_content;
                    const changes = !!r.published_content && (strip(r.content) !== strip(r.published_content) || stableJson(r.seo) !== stableJson(r.published_seo));
                    return (
                      <tr key={r.id}>
                        <td>
                          <Link href={`/admin/pages/${r.id}`} className="ed-rowlink"><strong>{r.content.name || r.seo.title || r.path}</strong></Link>
                          <div>{live ? <a className="adm-path" href={r.path} target="_blank" rel="noopener">{r.path} ↗</a> : <span className="adm-muted">{r.path}</span>}</div>
                        </td>
                        <td>
                          <span className={`adm-pill adm-pill--${live ? "published" : "draft"}`}>{live ? "Published" : "Draft"}</span>
                          {live && changes && <> <span className="adm-pill adm-pill--draft">Unpublished changes</span></>}
                        </td>
                        <td>{type === "static" ? <span className="adm-muted">-</span> : <span className={`adm-pill adm-pill--${r.review_status}`}>{REVIEW[r.review_status] ?? r.review_status}</span>}</td>
                        <td className="adm-muted">{new Date(r.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </>
  );
}
