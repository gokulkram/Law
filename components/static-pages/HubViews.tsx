import Link from "next/link";
import { Inline } from "@/components/RichText";
import { CtaBand, PageHero } from "@/components/Sections";
import { ARTICLE_CATEGORIES, SERVICE_GROUPS } from "@/content/groups";
import type { AttorneysText, HeroOnlyText, PracticeAreasText, ResourcesText } from "@/content/static-text";
import { getContent } from "@/lib/content-store";

// Hub pages: practice areas, guides, site map and the attorney team. The editable text comes from
// the database; the cards and lists are built from the pages themselves.

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export async function PracticeAreasView({ t }: { t: PracticeAreasText }) {
  const c = await getContent();
  // The wrongful death overview page isn't a practice-area page; show it first in its group.
  const overview = { slug: "/wrongful-death", name: "Wrongful Death", summary: t.overviewSummary };
  return (
    <main>
      <PageHero trail={[["Practice Areas", "/practice-areas"]]} title={t.hero.title}>
        {t.hero.text}
      </PageHero>

      <section className="section">
        <div className="container">
          {SERVICE_GROUPS.map(({ group }, gi) => {
            const pages = c.servicesIn(group);
            const items = group === "Wrongful Death" ? [overview, ...pages] : pages;
            return (
              <div className="pa-group" key={group}>
                <h2>{group}</h2>
                <p>{t.groupIntros[gi]?.intro}</p>
                <div className="cards">
                  {items.map((p) => (
                    <article className="card reveal" key={p.slug}>
                      <h3>
                        <Link className="card__link" href={p.slug}>{p.name}</Link>
                      </h3>
                      <p>{p.summary}</p>
                      <span className="more" aria-hidden="true">{t.moreLabel} <Arrow /></span>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="pa-group">
            <h2>{t.notListed.title}</h2>
            <p><Inline text={t.notListed.text} /></p>
          </div>
        </div>
      </section>

      <CtaBand eyebrow={t.cta.eyebrow} title={t.cta.title} text={t.cta.text} cta={t.cta.button} />
    </main>
  );
}

export async function ResourcesView({ t }: { t: ResourcesText }) {
  const { articles } = await getContent();
  return (
    <main>
      <PageHero trail={[["Resources", "/resources"]]} title={t.hero.title}>
        {t.hero.text}
      </PageHero>
      <section className="section">
        <div className="container">
          {ARTICLE_CATEGORIES.map((cat) => {
            const items = articles.filter((a) => a.category === cat);
            if (!items.length) return null;
            return (
              <div className="pa-group" key={cat}>
                <h2>{cat}</h2>
                <div className="cards">
                  {items.map((a) => (
                    <article className="card reveal" key={a.slug}>
                      <h3><Link className="card__link" href={a.slug}>{a.h1}</Link></h3>
                      <p>{a.summary}</p>
                      <span className="more" aria-hidden="true">{t.moreLabel} <Arrow /></span>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <CtaBand eyebrow={t.cta.eyebrow} title={t.cta.title} text={t.cta.text} cta={t.cta.button} />
    </main>
  );
}

const SITE_MAP_GROUPS = ["Wrongful Death", "Vehicle Accidents", "Serious Injuries", "Other Practice Areas", "Locations", "Resources", "Firm", "Legal"] as const;

export async function SiteMapView({ t }: { t: HeroOnlyText }) {
  const pages = (await getContent()).sitePages;
  return (
    <main>
      <PageHero trail={[["Site Map", "/site-map"]]} title={t.hero.title}>
        {t.hero.text}
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="cards">
            {SITE_MAP_GROUPS.map((g) => (
              <article className="card" key={g}>
                <h2 style={{ fontSize: "1.25rem", marginBottom: 14 }}>{g}</h2>
                <div className="prose">
                  <ul className="bul">
                    {pages.filter((p) => p.group === g).map((p) => (
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

export async function AttorneysView({ t }: { t: AttorneysText }) {
  const { attorneys, firm } = await getContent();
  return (
    <main>
      <PageHero trail={[["Our Attorneys", "/attorneys"]]} title={t.hero.title}>
        {t.hero.text}
      </PageHero>
      <section className="section">
        <div className="container">
          <div className="cards">
            {attorneys.map((a) => (
              <article className="card attorney-card" key={a.slug}>
                {a.photo && <img src={a.photo} alt={a.name} width={320} height={320} loading="lazy" />}
                <h2 style={{ fontSize: "1.3rem" }}><Link className="card__link" href={`/attorneys/${a.slug}`}>{a.name}</Link></h2>
                <p>{a.title}</p>
                <p className="muted">{a.offices.map((id) => firm.offices.find((o) => o.id === id)?.label).filter(Boolean).join(" · ")}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CtaBand eyebrow={t.cta.eyebrow} title={t.cta.title} text={t.cta.text} cta={t.cta.button} />
    </main>
  );
}
