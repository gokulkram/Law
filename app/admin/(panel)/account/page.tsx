import { requireStaff, ROLE_LABELS } from "@/lib/admin/auth";
import { NameForm, PasswordForm } from "./AccountForms";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const me = await requireStaff();
  return (
    <>
      <h1 className="adm-h1">My account</h1>
      <p className="adm-muted">
        {me.email} · {ROLE_LABELS[me.role]}
      </p>
      <div className="adm-grid-2">
        <section className="adm-card">
          <h2 className="adm-h2">Your name</h2>
          <NameForm fullName={me.fullName ?? ""} />
        </section>
        <section className="adm-card">
          <h2 className="adm-h2">Change password</h2>
          <PasswordForm />
        </section>
      </div>
    </>
  );
}
