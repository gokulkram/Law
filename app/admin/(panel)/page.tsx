import Link from "next/link";
import RefreshContentButton from "@/components/admin/RefreshContentButton";
import { requireStaff } from "@/lib/admin/auth";
import { unverifiedCount, type Credibility } from "@/lib/admin/settings-model";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };

type Props = { searchParams: Promise<{ error?: string }> };

export default async function Dashboard({ searchParams }: Props) {
  const { error } = await searchParams;
  const staff = await requireStaff();
  const supabase = await createClient();
  const count = async (table: string, filter?: [string, string]) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(...filter);
    return (await q).count ?? 0;
  };
  const [pages, published, needsReview, redirects, media] = await Promise.all([
    count("pages"),
    count("pages", ["status", "published"]),
    count("pages", ["review_status", "needs_review"]),
    count("redirects"),
    count("media"),
  ]);

  const { data: settingRows } = await supabase.from("site_settings").select("key, value").in("key", ["seo", "credibility"]);
  const setting = (k: string) => settingRows?.find((r) => r.key === k)?.value;
  const blocked = (setting("seo") as { discourageIndexing?: boolean } | undefined)?.discourageIndexing === true;
  const cred = setting("credibility") as Credibility | undefined;
  const placeholders = cred ? unverifiedCount(cred) : 0;

  return (
    <>
      {blocked && (
        <p className="adm-alert adm-alert--error">
          <strong>Search engines are blocked for the whole website.</strong> Fine for a staging site - on the live site it removes the firm from Google.{" "}
          <Link href="/admin/seo">Change this under SEO</Link>.
        </p>
      )}
      {placeholders > 0 && (
        <p className="adm-alert">
          <strong>{placeholders} placeholder figure{placeholders === 1 ? "" : "s"}/testimonial{placeholders === 1 ? "" : "s"}</strong> from the original design are still on the website.
          Replace them with verified figures and approved reviews, or delete them, before launch.{" "}
          {staff.role === "admin" ? <Link href="/admin/settings">Open Site settings</Link> : "An admin can change them under Site settings."}
        </p>
      )}
      <h1 className="adm-h1">Welcome, {staff.fullName?.split(" ")[0] || staff.email}</h1>
      {error === "forbidden" && <p className="adm-alert adm-alert--error">Your role doesn’t have access to that section.</p>}

      <div className="adm-stats">
        <Stat label="Pages" value={pages} />
        <Stat label="Published" value={published} />
        <Stat label="Needs attorney review" value={needsReview} />
        <Stat label="Redirects" value={redirects} />
        <Stat label="Media files" value={media} />
      </div>

      {pages === 0 ? (
        <div className="adm-card">
          <h2 className="adm-h2">Content not imported yet</h2>
          <p className="adm-muted">Run <code>npm run content:import</code> to load every page from the content files into the database.</p>
        </div>
      ) : (
        (staff.role === "admin" || staff.role === "editor") && (
          <div className="adm-card">
            <h2 className="adm-h2">Website content</h2>
            <p className="adm-muted">
              The website reads every page from the database. Saving a page in the editor updates the site automatically; if
              content was changed some other way (for example a re-import), refresh it here.
            </p>
            <RefreshContentButton />
          </div>
        )
      )}

      <div className="adm-card">
        <h2 className="adm-h2">Quick links</h2>
        <ul className="adm-links">
          {staff.role === "admin" && <li><Link href="/admin/users">Manage admin users</Link></li>}
          <li><Link href="/admin/pages">See all pages</Link></li>
          <li><Link href="/admin/account">Change your password</Link></li>
          <li><a href="/" target="_blank" rel="noopener">View the website ↗</a></li>
        </ul>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="adm-stat">
      <span className="adm-stat__value">{value}</span>
      <span className="adm-stat__label">{label}</span>
    </div>
  );
}
