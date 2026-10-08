import Link from "next/link";
import { PageHero } from "@/components/Sections";
import { PAGES, pageMeta } from "@/lib/site";

export const metadata = pageMeta("/site-map", "Site Map", "Every page on the California Law website: practice areas, firm information, contact details, and legal notices.");

const GROUPS = ["Wrongful Death", "Vehicle Accidents", "Serious Injuries", "Other Practice Areas", "Locations", "Resources", "Firm", "Legal"] as const;

export default function SiteMap() {
  return (
    <main>
      <PageHero trail={[["Site Map", "/site-map"]]} title="Site Map">
        Every page on this website, in one place.
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="cards">
            {GROUPS.map((g) => (
              <article className="card" key={g}>
                <h2 style={{ fontSize: "1.25rem", marginBottom: 14 }}>{g}</h2>
                <div className="prose">
                  <ul className="bul">
                    {PAGES.filter((p) => p.group === g).map((p) => (
                      <li key={p.path}><Link href={p.path}>{p.label}</Link></li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
