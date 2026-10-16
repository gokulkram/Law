import { requireStaff } from "@/lib/admin/auth";
import { allPagesLite, pageName } from "@/lib/admin/pages";
import { listRedirects } from "@/lib/admin/redirects";
import { createClient } from "@/lib/supabase/server";
import { RedirectForm, RedirectRow } from "./RedirectForms";

export const metadata = { title: "Redirects" };

export default async function RedirectsPage() {
  const me = await requireStaff();
  const canEdit = me.role === "admin" || me.role === "editor";
  const supabase = await createClient();
  const [redirects, pages] = await Promise.all([listRedirects(supabase), allPagesLite()]);
  const options = pages
    .filter((p) => p.status === "published" && p.published_content)
    .map((p) => ({ path: p.path, name: pageName(p) }));

  return (
    <>
      <h1 className="adm-h1">Redirects</h1>
      <p className="adm-muted">
        Send visitors (and search engines) from an old URL to a new one - for example after a page is renamed, merged or
        removed. A redirect only applies when there is no live page at the old URL.
      </p>

      {canEdit && (
        <section className="adm-card">
          <h2 className="adm-h2">Add a redirect</h2>
          <RedirectForm pages={options} />
        </section>
      )}

      <section className="adm-card">
        <h2 className="adm-h2">All redirects <span className="adm-muted">({redirects.length})</span></h2>
        {redirects.length === 0 ? <p className="adm-muted">No redirects yet.</p> : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Old URL</th><th>Goes to</th><th>Type</th><th></th></tr></thead>
              <tbody>{redirects.map((r) => <RedirectRow key={r.id} r={r} pages={options} canEdit={canEdit} />)}</tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
