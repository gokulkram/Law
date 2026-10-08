import Link from "next/link";
import { preload } from "react-dom";
import ContactForm from "@/components/ContactForm";
import Testimonials from "@/components/Testimonials";
import { HOME_STATS } from "@/content/credibility";
import { CtaBand, Locations } from "@/components/Sections";
import { PHONE, PHONE_HREF, SITE_NAME, pageMeta } from "@/lib/site";

const meta = pageMeta(
  "/",
  `Personal Injury & Wrongful Death Lawyers | ${SITE_NAME}`,
  "California personal injury law firm focused on wrongful death cases, with six offices statewide. Compassionate, aggressive advocacy. No fee unless we win."
);
export const metadata = { ...meta, title: { absolute: meta.title } };

const Arrow = () => (
  <svg className="pa-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const Check = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6L9 17l-5-5" /></svg>
);

const PI_AREAS = [
  { label: "Car & Truck Accidents", href: "/car-accident-lawyer", icon: <><path d="M3 13l2-5a3 3 0 0 1 2.8-2h8.4A3 3 0 0 1 19 8l2 5" /><path d="M5 17h14M6 13h12" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></> },
  { label: "Medical Malpractice", href: "/medical-malpractice-lawyer", icon: <path d="M12 3v18M5 8h14M7 8l-2 6a3 3 0 0 0 6 0L9 8M17 8l-2 6a3 3 0 0 0 6 0l-2-6" /> },
  { label: "Workplace Injuries", href: "/workplace-injury-lawyer", icon: <><path d="M10 2h4l1 4h-6zM9 6h6l1 14H8z" /><path d="M12 10v6" /></> },
  { label: "Slip & Fall", href: "/premises-liability-lawyer", icon: <path d="M4 20l6-6M9 11l4-4 4 4-4 4zM14 4l6 6" /> },
  { label: "Catastrophic Injury", href: "/catastrophic-injury-lawyer", icon: <><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></> },
];

const STEP_SVG = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
const STEPS = [
  { title: "Free consultation", text: "Tell us what happened. We listen, answer your questions, and explain your options - at no cost.", icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /> },
  { title: "Investigation", text: "We gather evidence, consult experts, and build the strongest possible case on your behalf.", icon: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></> },
  { title: "Negotiation", text: "We demand full and fair compensation - and we’re not afraid to reject a lowball offer.", icon: <><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" /><path d="m21 3 1 11h-2" /><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" /><path d="M3 4h8" /></> },
  { title: "Trial, if needed", text: "If insurers won’t be fair, our trial attorneys are ready to take your case to a jury.", icon: <><path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" /><path d="m16 16 6-6" /><path d="m8 8 6-6" /><path d="m9 7 8 8" /><path d="m21 11-8-8" /></> },
];

export default function Home() {
  // The hero banner is a CSS background, so the browser finds it late - fetch it up front.
  preload("/images/banner-collage.webp", { as: "image", fetchPriority: "high" });

  return (
    <main>
      {/* HERO + CONTACT FORM */}
      <section className="hero" id="contact">
        <div className="hero__bg" role="img" aria-label="Diverse group of people"></div>
        <div className="container hero__inner">
          <div className="hero__copy">
            <span className="hero__badge">&#9733; Trusted California personal injury &amp; wrongful death advocates</span>
            <h1>When the worst happens, <span className="accent">you deserve answers</span> - and justice.</h1>
            <p className="hero__sub">California Law stands with Californian families and the injured after life-changing harm. We pursue full accountability for wrongful death and serious injury - with compassion, and without compromise.</p>
            <div className="hero__actions">
              <a className="btn btn--gold" href="#lead-form">Get a Free Case Review</a>
              <a className="btn btn--ghost" href={PHONE_HREF}>&#9742; Call {PHONE}</a>
            </div>
          </div>

          <div className="lead-card" id="lead-form">
            <h2>Free, confidential case review</h2>
            <p className="muted">Tell us what happened. We respond within one hour, 24/7.</p>
            <ContactForm variant="lead" />
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trustbar">
        <div className="container">
          {HOME_STATS.map((s) => (
            <div className="item" key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>
          ))}
        </div>
      </div>

      {/* WHAT WE DO */}
      <section className="section">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow">What We Do</span>
            <h2>Personal injury is all we do - and we do it well</h2>
            <p className="lead" style={{ margin: "14px auto 0" }}>From catastrophic accidents to the loss of a loved one, we handle the legal fight so you can focus on healing. Every case is led by a senior attorney.</p>
          </div>
          <div className="pillars">
            <article className="pillar reveal">
              <div className="pillar__head">
                <div className="ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
                </div>
                <div>
                  <h3>Personal Injury</h3>
                  <p className="pillar__sub">Serious-injury cases of every kind. We take on insurers and corporations to recover everything you&rsquo;re owed.</p>
                </div>
              </div>
              <ul className="pillar__list">
                {PI_AREAS.map((a) => (
                  <li key={a.label}>
                    <Link href={a.href}>
                      <span className="pa-label">
                        <svg className="pa-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{a.icon}</svg>
                        {a.label}
                      </span>
                      <Arrow />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link className="btn btn--outline" href="/practice-areas">See all practice areas &rarr;</Link>
            </article>

            <article className="pillar pillar--focus reveal">
              <div className="pillar__head">
                <div className="ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /></svg>
                </div>
                <div>
                  <span className="eyebrow eyebrow--light" style={{ marginBottom: 6 }}>Our Focus</span>
                  <h3>Wrongful Death</h3>
                  <p className="pillar__sub">When negligence takes a loved one, we protect your family&rsquo;s rights from day one.</p>
                </div>
              </div>
              <ul className="checklist">
                <li><Check /><span><strong>We investigate fully</strong> - preserving evidence before it disappears.</span></li>
                <li><Check /><span><strong>We value the whole loss</strong> - income, support, guidance, and companionship.</span></li>
                <li><Check /><span><strong>We handle everything</strong> - so your family can focus on each other.</span></li>
              </ul>
              <div className="pillar__promise"><strong>You don&rsquo;t pay</strong> unless we win your case.</div>
              <Link className="btn btn--gold" href="/wrongful-death">Understand your rights &rarr;</Link>
            </article>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow">How It Works</span>
            <h2>A clear path forward, from day one</h2>
          </div>
          <div className="steps">
            {STEPS.map((s, idx) => (
              <div className="step reveal" key={s.title}>
                <div className="n">
                  <svg {...STEP_SVG}>{s.icon}</svg>
                  <span className="step-num">{idx + 1}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      <Locations />
      <CtaBand
        eyebrow="No Fee Unless We Win"
        title="Talk to a California personal injury attorney today"
        text="The consultation is free, the call is confidential, and there’s no obligation. The sooner you reach out, the sooner we can protect your rights."
        cta="Start My Free Case Review"
        ctaHref="#lead-form"
      />
    </main>
  );
}
