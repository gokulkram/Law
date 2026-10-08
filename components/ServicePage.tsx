import Link from "next/link";
import Byline from "@/components/Byline";
import ContactForm from "@/components/ContactForm";
import JsonLd from "@/components/JsonLd";
import { Blocks, Inline } from "@/components/RichText";
import { CtaBand, PageHero } from "@/components/Sections";
import { getCard, type PageCard } from "@/content";
import { articlesFor } from "@/content/articles";
import type { ServiceContent } from "@/content/types";
import { servicePageSchema } from "@/lib/schema";
import { OFFICES, PHONE, PHONE_HREF } from "@/lib/site";

// Breadcrumb trail: city + service pages sit under their office page, wrongful-death sub-pages
// under the wrongful death hub, everything else under Practice Areas.
function trailFor(s: ServiceContent): [string, string][] {
  const office = s.location && OFFICES.find((o) => o.id === s.location);
  if (office) return [[office.label, `/${office.id}`], [s.name, s.slug]];
  return s.slug.startsWith("/wrongful-death/")
    ? [["Wrongful Death", "/wrongful-death"], [s.name, s.slug]]
    : [["Practice Areas", "/practice-areas"], [s.name, s.slug]];
}

export default function ServicePage({ s }: { s: ServiceContent }) {
  const related = s.related.map(getCard).filter((r): r is PageCard => !!r);
  // City pages show the guides for their statewide equivalent.
  const guideKey = s.location ? (s.slug.endsWith("/wrongful-death-lawyer") ? "/wrongful-death" : `/${s.slug.split("/")[2]}`) : s.slug;
  const guides = articlesFor(guideKey).slice(0, 4);
  const office = s.location ? OFFICES.find((o) => o.id === s.location) : undefined;
  const phone = office ? { text: office.phone, href: `tel:${office.tel}` } : { text: PHONE, href: PHONE_HREF };

  return (
    <main>
      <JsonLd data={servicePageSchema(s)} />
      <PageHero trail={trailFor(s)} title={s.h1}>{s.heroText}</PageHero>

      <section className="section">
        <div className="container layout-2col">
          <article className="prose service">
            <Byline updated={s.updated} reviewedBy={s.reviewedBy} reviewed={s.reviewed} />
            <p className="lead" style={{ color: "var(--ink)" }}><Inline text={s.intro} /></p>

            {s.steps && (
              <>
                <h2>{s.steps.heading}</h2>
                <ol className="howto">
                  {s.steps.items.map((st) => (
                    <li key={st.title}>
                      <strong>{st.title}</strong>
                      <span><Inline text={st.text} /></span>
                    </li>
                  ))}
                </ol>
              </>
            )}

            {s.sections.map((sec) => (
              <section key={sec.heading}>
                <h2>{sec.heading}</h2>
                <Blocks blocks={sec.blocks} />
              </section>
            ))}

            <h2>Frequently asked questions</h2>
            <div className="faq">
              {s.faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p><Inline text={f.a} /></p>
                </details>
              ))}
            </div>

            {related.length > 0 && (
              <>
                <h2>{office ? "Related pages" : "Related practice areas"}</h2>
                <div className="related">
                  {related.map((r) => (
                    <Link key={r.slug} href={r.slug} className="related__item">
                      <strong>{r.name}</strong>
                      <span>{r.summary}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {guides.length > 0 && (
              <>
                <h2>Helpful guides</h2>
                <div className="related">
                  {guides.map((g) => (
                    <Link key={g.slug} href={g.slug} className="related__item"><strong>{g.h1}</strong><span>{g.summary}</span></Link>
                  ))}
                </div>
              </>
            )}

            <p className="service__note">
              This page is general information about California law, not legal advice. Every case is different - <Link href="/contact">talk to an attorney</Link> about yours. See our <Link href="/disclaimer">disclaimer</Link>.
            </p>
          </article>

          <div className="aside-stack">
            <div className="lead-card lead-card--aside" id="lead-form">
              <h3>Free case review</h3>
              <p className="muted">Tell us what happened. We respond within one hour, 24/7.</p>
              <ContactForm variant="lead" />
            </div>
            <aside className="sidebar">
              <h3>{office ? `Our ${office.label} office` : "Prefer to talk?"}</h3>
              <p>Speak with our team now - free, confidential, and available 24/7.</p>
              <p><a href={phone.href} style={{ color: "var(--gold-300)", fontWeight: 700, fontSize: "1.25rem" }}>{phone.text}</a></p>
              {office && <p><Link href={`/${office.id}`} style={{ color: "#fff", fontWeight: 600 }}>{office.label} office details &rarr;</Link></p>}
            </aside>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="No Fee Unless We Win"
        title="Talk to a California attorney today"
        text="The consultation is free, the call is confidential, and there’s no obligation. The sooner you reach out, the sooner we can protect your rights."
        cta="Start My Free Case Review"
        ctaHref="#lead-form"
      />
    </main>
  );
}
