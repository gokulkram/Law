import type { Metadata } from "next";
import "./admin.css";

// Admin panel root. Sits outside the (site) route group: no site header, footer or structured data.
// The panel and login wrap themselves in .adm (admin styles); the draft preview uses the site's styles.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
