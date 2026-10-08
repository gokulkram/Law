import Link from "next/link";
import { PHONE, PHONE_HREF } from "@/lib/site";

export const metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <main>
      <section className="page-hero" style={{ padding: "96px 0" }}>
        <div className="container center">
          <h1 style={{ margin: "0 auto" }}>We couldn&rsquo;t find that page</h1>
          <p style={{ margin: "16px auto 0" }}>
            It may have moved. If you need help with a case, call us anytime at{" "}
            <a href={PHONE_HREF} style={{ color: "var(--gold-300)", fontWeight: 700 }}>{PHONE}</a>.
          </p>
          <div style={{ marginTop: 30, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn btn--gold" href="/">Return Home</Link>
            <Link className="btn btn--ghost" href="/practice-areas">Practice Areas</Link>
            <Link className="btn btn--ghost" href="/site-map">Site Map</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
