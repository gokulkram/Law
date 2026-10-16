import Image from "next/image";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { requireStaff, ROLE_LABELS } from "@/lib/admin/auth";
import { signOut } from "../actions";

// Everything behind the login: checks the session and role, then renders the sidebar shell.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  return (
    <div className="adm adm-shell">
      <aside className="adm-side">
        <Link href="/admin" className="adm-side__brand">
          <Image src="/assets/logo-footer.png" alt="California Law" width={141} height={59} />
          <span>Admin</span>
        </Link>
        <AdminNav role={staff.role} />
        <div className="adm-side__foot">
          <a href="/" target="_blank" rel="noopener" className="adm-side__link">View site ↗</a>
        </div>
      </aside>
      <div className="adm-main">
        <header className="adm-top">
          <div className="adm-top__user">
            <strong>{staff.fullName || staff.email}</strong>
            <span className="adm-badge">{ROLE_LABELS[staff.role]}</span>
          </div>
          <form action={signOut}>
            <button className="adm-btn adm-btn--ghost adm-btn--sm">Sign out</button>
          </form>
        </header>
        <main className="adm-content">{children}</main>
      </div>
    </div>
  );
}
