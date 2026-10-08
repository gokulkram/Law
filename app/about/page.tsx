import Image from "next/image";
import Link from "next/link";
import { ATTORNEYS } from "@/content/attorneys";
import { CtaBand, PageHero } from "@/components/Sections";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/about",
  "About Our Personal Injury Firm",
  "Meet California Law: a personal injury and wrongful death firm built on one belief - injured people and grieving families deserve a relentless advocate."
);

export default function About() {
  return (
    <main>
      <PageHero trail={[["About", "/about"]]} title="About California Law">
        We built this firm around a single belief: injured people and grieving families deserve an advocate who treats their case like it&rsquo;s the only one that matters.
      </PageHero>

      <section className="section">
        <div className="container split">
          <div className="split__media reveal">
            <Image src="/images/about-attorney.webp" alt="California Law attorney" width={1000} height={667} sizes="(max-width: 900px) 100vw, 540px" loading="eager" fetchPriority="high" />
            <div className="tag"><strong>Client-first</strong><span>since day one</span></div>
          </div>
          <div className="split__copy reveal">
            <span className="eyebrow">Our Story</span>
            <h2>Big-firm results, with the care of people who know you</h2>
            <p>California Law was founded by trial attorneys who grew tired of watching insurance companies take advantage of people at their lowest moments. We set out to build something different: a firm with the resources to take on any opponent, and the heart to treat every client like family.</p>
            <p>Today, from six offices across California, we focus our practice on personal injury and wrongful death - because that focus is what produces results. We don&rsquo;t dabble. We do this every day, and we do it well.</p>
            {ATTORNEYS.length > 0 && <p><Link href="/attorneys" style={{ color: "var(--navy-600)", fontWeight: 600 }}>Meet our attorneys &rarr;</Link></p>}
          </div>
        </div>
      </section>

      <section className="section bg-paper2">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow">What Drives Us</span>
            <h2>Our values</h2>
          </div>
          <div className="cards">
            <article className="card reveal">
              <div className="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /></svg></div>
              <h3>Compassion</h3>
              <p>We meet every client with patience and respect. You&rsquo;ll never feel like a case number here.</p>
            </article>
            <article className="card reveal">
              <div className="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" /></svg></div>
              <h3>Relentlessness</h3>
              <p>We prepare every case as if it will go to trial - because that&rsquo;s what gets results.</p>
            </article>
            <article className="card reveal">
              <div className="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M5 7l1 13h12l1-13" /></svg></div>
              <h3>Transparency</h3>
              <p>Plain language, honest answers, and no surprises. You&rsquo;ll always know where your case stands.</p>
            </article>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="No Fee Unless We Win"
        title="Let’s talk about your case"
        text="Meet the team that will fight for you. The first conversation is always free."
        cta="Get a Free Case Review"
      />
    </main>
  );
}
