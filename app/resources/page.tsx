import Link from "next/link";
import { CtaBand, PageHero } from "@/components/Sections";
import { ARTICLE_CATEGORIES, ARTICLES } from "@/content/articles";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/resources",
  "Injury Law Guides & Resources",
  "Plain-English guides to California injury claims: collision reports, insurance adjusters, medical bills, pain and suffering, fees, and how long cases take."
);

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export default function Resources() {
  return (
    <main>
      <PageHero trail={[["Resources", "/resources"]]} title="Guides for Injured Californians and Their Families">
        Straight answers to the questions people ask us most - what to do, who pays, and what to expect. General information, not legal advice.
      </PageHero>
      <section className="section">
        <div className="container">
          {ARTICLE_CATEGORIES.map((cat) => {
            const items = ARTICLES.filter((a) => a.category === cat);
            if (!items.length) return null;
            return (
              <div className="pa-group" key={cat}>
                <h2>{cat}</h2>
                <div className="cards">
                  {items.map((a) => (
                    <article className="card reveal" key={a.slug}>
                      <h3><Link className="card__link" href={a.slug}>{a.h1}</Link></h3>
                      <p>{a.summary}</p>
                      <span className="more" aria-hidden="true">Read the guide <Arrow /></span>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <CtaBand eyebrow="No Fee Unless We Win" title="Rather talk it through?" text="A free consultation gives you answers about your specific situation - no cost and no obligation." cta="Get a Free Case Review" />
    </main>
  );
}
