import { requireStaff, ROLE_LABELS, type StaffRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AttorneyLink, CreateUserForm, UserActions } from "./UserForms";

export const metadata = { title: "Users" };

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never");

export default async function UsersPage() {
  const me = await requireStaff("admin");
  const admin = createAdminClient();
  const [{ data: profiles }, { data: auth }, { data: attorneyPages }] = await Promise.all([
    admin.from("profiles").select("id, email, full_name, role, attorney_slug, created_at").order("created_at"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("pages").select("path, content").eq("type", "attorney").order("sort_order"),
  ]);
  const attorneys = (attorneyPages ?? []).map((p) => ({ slug: p.path.split("/")[2], name: String((p.content as { name?: string }).name ?? p.path) }));
  const lastSignIn = new Map(auth?.users.map((u) => [u.id, u.last_sign_in_at]) ?? []);

  return (
    <>
      <h1 className="adm-h1">Users</h1>

      <section className="adm-card">
        <h2 className="adm-h2">Add a user</h2>
        <p className="adm-muted">The account is created with a temporary password you send to the person yourself.</p>
        <CreateUserForm />
      </section>

      <section className="adm-card">
        <h2 className="adm-h2">Everyone with an account</h2>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Name</th><th>Role</th><th>Last sign-in</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.full_name || "-"}</strong>
                    <div className="adm-muted">{p.email}</div>
                  </td>
                  <td>
                    {p.role ? ROLE_LABELS[p.role as StaffRole] : <span className="adm-muted">No access</span>}
                    {(p.role === "reviewer" || p.attorney_slug) && (
                      attorneys.length ? <AttorneyLink id={p.id} value={p.attorney_slug} attorneys={attorneys} /> : <div className="adm-muted">Add an attorney page to link this reviewer.</div>
                    )}
                  </td>
                  <td>{fmt(lastSignIn.get(p.id))}</td>
                  <td><UserActions id={p.id} role={p.role} isSelf={p.id === me.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
