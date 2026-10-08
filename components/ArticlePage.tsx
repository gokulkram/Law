import Link from "next/link";
import Byline from "@/components/Byline";
import ContactForm from "@/components/ContactForm";
import JsonLd from "@/components/JsonLd";
import { Blocks, Inline } from "@/components/RichText";
import { CtaBand, PageHero } from "@/components/Sections";
import { getCard, type PageCard } from "@/content";
import type { ArticleContent } from "@/content/types";
import { articleSchema } from "@/lib/schema";
import { PHONE, PHONE_HREF } from "@/lib/site";

// Guide page (/resources/...): same reading layout as practice-area pages, with Article structured data
// and links to the practice areas the guide supports.
export default function ArticlePage({ a }: { a: ArticleContent }) {
  const services = a.services.map(getCard).filter((c): c is PageCard => !!c);
  const related = a.related.map(getCard).filter((c): c is PageCard => !!c && !a.services.includes(c.slug));

  return (
    <main>
      <JsonLd data={articleSchema(a)} />
      <PageHero trail={[["Resources", "/resources"], [a.name, a.slug]]} title={a.h1}>{a.heroText}</PageHero>

      <section className="section">
        <div className="container layout-2col">
          <article className="prose service">
            <Byline published={a.published} updated={a.updated} reviewedBy={a.reviewedBy} reviewed={a.reviewed} />
            <p className="lead" style={{ color: "var(--ink)" }}><Inline text={a.intro} /></p>

            {a.steps && (
              <>
                <h2>{a.steps.heading}</h2>
                <ol className="howto">
                  {a.steps.items.map((st) => (
                    <li key={st.title}>
                      <strong>{st.title}</strong>
                      <span><Inline text={st.text} /></span>
                    </li>
                  ))}
                </ol>
              </>
            )}

            {a.sections.map((sec) => (
              <section key={sec.heading}>
                <h2>{sec.heading}</h2>
                <Blocks blocks={sec.blocks} />
              </section>
            ))}

            <h2>Frequently asked questions</h2>
            <div className="faq">
              {a.faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p><Inline text={f.a} /></p>
                </details>
              ))}
            </div>

            <h2>Get help with your case</h2>
            <div className="related">
              {services.map((r) => (
                <Link key={r.slug} href={r.slug} className="related__item"><strong>{r.name}</strong><span>{r.summary}</span></Link>
              ))}
            </div>

            {related.length > 0 && (
              <>
                <h2>Keep reading</h2>
                <div className="related">
                  {related.map((r) => (
                    <Link key={r.slug} href={r.slug} className="related__item"><strong>{r.name}</strong><span>{r.summary}</span></Link>
                  ))}
                </div>
              </>
            )}

            <p className="service__note">
              This guide is general information about California law, not legal advice. Every case is different - <Link href="/contact">talk to an attorney</Link> about yours. See our <Link href="/disclaimer">disclaimer</Link>.
            </p>
          </article>

          <div className="aside-stack">
            <div className="lead-card lead-card--aside" id="lead-form">
              <h3>Free case review</h3>
              <p className="muted">Tell us what happened. We respond within one hour, 24/7.</p>
              <ContactForm variant="lead" />
            </div>
            <aside className="sidebar">
              <h3>Prefer to talk?</h3>
              <p>Speak with our team now - free, confidential, and available 24/7.</p>
              <p><a href={PHONE_HREF} style={{ color: "var(--gold-300)", fontWeight: 700, fontSize: "1.25rem" }}>{PHONE}</a></p>
            </aside>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="No Fee Unless We Win"
        title="Have questions about your situation?"
        text="A free consultation gives you straight answers about your case - no cost and no obligation."
        cta="Start My Free Case Review"
        ctaHref="#lead-form"
      />
    </main>
  );
}
