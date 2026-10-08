import Link from "next/link";
import Byline from "@/components/Byline";
import ContactForm from "@/components/ContactForm";
import JsonLd from "@/components/JsonLd";
import { Blocks, Inline } from "@/components/RichText";
import { CtaBand, PageHero } from "@/components/Sections";
import { getCard, type PageCard } from "@/content";
import { localPagesFor } from "@/content/local";
import type { LocationContent } from "@/content/types";
import { locationPageSchema } from "@/lib/schema";
import { OFFICES } from "@/lib/site";

// Statewide practice areas linked from every office page (after any local pages for this office).
const KEY_SERVICES = ["/wrongful-death", "/car-accident-lawyer", "/truck-accident-lawyer", "/motorcycle-accident-lawyer", "/pedestrian-accident-lawyer", "/catastrophic-injury-lawyer", "/medical-malpractice-lawyer", "/premises-liability-lawyer", "/government-claims-lawyer"];

export default function LocationPage({ l }: { l: LocationContent }) {
  const office = OFFICES.find((o) => o.id === l.officeId)!;
  const local: PageCard[] = localPagesFor(l.officeId).map((p) => ({ slug: p.slug, name: p.name, summary: p.summary }));
  const statewide = KEY_SERVICES.map(getCard).filter((c): c is PageCard => !!c);
  const addressLine = `${office.street ? `${office.street}, ` : ""}${office.locality}, CA${office.postalCode ? ` ${office.postalCode}` : ""}`;
  const mapQuery = encodeURIComponent(`California Law, ${addressLine}`);

  return (
    <main>
      <JsonLd data={locationPageSchema(l)} />
      <PageHero trail={[[l.name, l.slug]]} title={l.h1}>{l.heroText}</PageHero>

      <section className="section">
        <div className="container layout-2col">
          <article className="prose service">
            <Byline updated={l.updated} reviewedBy={l.reviewedBy} reviewed={l.reviewed} />
            <p className="lead" style={{ color: "var(--ink)" }}><Inline text={l.intro} /></p>

            {local.length > 0 && (
              <>
                <h2>{l.name} practice areas</h2>
                <div className="related">
                  {local.map((r) => (
                    <Link key={r.slug} href={r.slug} className="related__item"><strong>{r.name}</strong><span>{r.summary}</span></Link>
                  ))}
                </div>
              </>
            )}

            {l.sections.map((sec) => (
              <section key={sec.heading}>
                <h2>{sec.heading}</h2>
                <Blocks blocks={sec.blocks} />
              </section>
            ))}

            <h2>Courts serving the {l.name} area</h2>
            <div className="courts">
              {l.courts.map((c) => (
                <div className="court" key={c.name}>
                  <strong>{c.name}</strong>
                  <span>{c.address}</span>
                  {c.note && <span className="court__note"><Inline text={c.note} /></span>}
                  <a href={c.url} target="_blank" rel="noopener">Court website</a>
                </div>
              ))}
            </div>

            <h2>Communities we serve</h2>
            <ul className="chips">
              {l.areasServed.map((a) => <li key={a}>{a}</li>)}
            </ul>
            <p>Can&rsquo;t come to us? We make home and hospital visits anywhere in California.</p>

            <h2>{local.length ? "More practice areas" : "Practice areas"}</h2>
            <div className="related">
              {statewide.map((r) => (
                <Link key={r.slug} href={r.slug} className="related__item"><strong>{r.name}</strong><span>{r.summary}</span></Link>
              ))}
            </div>
            <p><Link href="/practice-areas">See all practice areas</Link></p>

            <h2>Frequently asked questions</h2>
            <div className="faq">
              {l.faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p><Inline text={f.a} /></p>
                </details>
              ))}
            </div>

            <p className="service__note">
              This page is general information, not legal advice. Every case is different - <Link href="/contact">talk to an attorney</Link> about yours. See our <Link href="/disclaimer">disclaimer</Link>.
            </p>
          </article>

          <div className="aside-stack">
            <aside className="sidebar office-card">
              <span className="office-card__kind">{office.kind}</span>
              <h3>California Law - {office.label}</h3>
              <p>{addressLine}</p>
              <p><a href={`tel:${office.tel}`} style={{ color: "var(--gold-300)", fontWeight: 700, fontSize: "1.25rem" }}>{office.phone}</a></p>
              <p>Free consultations, 24/7. Home and hospital visits anywhere in California.</p>
              {office.street && (
                <iframe
                  className="office-card__map"
                  title={`Map of the ${office.label} office`}
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </aside>
            <div className="lead-card lead-card--aside" id="lead-form">
              <h3>Free case review</h3>
              <p className="muted">Tell us what happened. We respond within one hour, 24/7.</p>
              <ContactForm variant="lead" />
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="No Fee Unless We Win"
        title={`Talk to our ${l.name} team today`}
        text="The consultation is free, the call is confidential, and there’s no obligation. The sooner you reach out, the sooner we can protect your rights."
        cta="Start My Free Case Review"
        ctaHref="#lead-form"
      />
    </main>
  );
}
