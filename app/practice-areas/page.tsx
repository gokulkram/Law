import Link from "next/link";
import { CtaBand, PageHero } from "@/components/Sections";
import { SERVICE_GROUPS, SERVICE_PAGES } from "@/content/services";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/practice-areas",
  "Personal Injury Practice Areas",
  "Wrongful death, car and truck accidents, medical malpractice, workplace injuries, catastrophic injury and more - California personal injury lawyers."
);

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

// The wrongful death overview page isn't in the service registry; show it first in its group.
const WD_OVERVIEW = {
  slug: "/wrongful-death",
  name: "Wrongful Death",
  summary: "The heart of our practice. When negligence takes a life, we help families seek accountability and the compensation they’re owed.",
};

export default function PracticeAreas() {
  return (
    <main>
      <PageHero trail={[["Practice Areas", "/practice-areas"]]} title="California Personal Injury Practice Areas">
        We represent people and families throughout California across the full range of serious injury and wrongful death matters. Whatever happened, we&rsquo;ll tell you honestly how we can help.
      </PageHero>

      <section className="section">
        <div className="container">
          {SERVICE_GROUPS.map(({ group, intro }) => {
            const pages = SERVICE_PAGES.filter((p) => p.group === group);
            const items = group === "Wrongful Death" ? [WD_OVERVIEW, ...pages] : pages;
            return (
              <div className="pa-group" key={group}>
                <h2>{group}</h2>
                <p>{intro}</p>
                <div className="cards">
                  {items.map((p) => (
                    <article className="card reveal" key={p.slug}>
                      <h3>
                        <Link className="card__link" href={p.slug}>{p.name}</Link>
                      </h3>
                      <p>{p.summary}</p>
                      <span className="more" aria-hidden="true">Learn more <Arrow /></span>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="pa-group">
            <h2>Don&rsquo;t see your situation?</h2>
            <p>
              Call us. If we can&rsquo;t help, we&rsquo;ll point you to someone who can - at no charge.{" "}
              <Link href="/contact" style={{ color: "var(--navy-600)", fontWeight: 600 }}>Contact us</Link>
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="No Fee Unless We Win"
        title="Not sure if you have a case?"
        text="That’s exactly what a free consultation is for. Tell us what happened - we’ll give you a straight answer."
        cta="Get a Free Case Review"
      />
    </main>
  );
}
