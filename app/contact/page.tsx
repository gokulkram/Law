import ContactForm from "@/components/ContactForm";
import { Locations, PageHero } from "@/components/Sections";
import { EMAIL, PHONE, PHONE_HREF, pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/contact",
  "Contact & Locations",
  "Contact California Law for a free consultation. Six offices across California, available 24/7. Call (800) 555-0100 or request a free case review online."
);

export default function Contact() {
  return (
    <main>
      <PageHero trail={[["Contact", "/contact"]]} title="Contact California Law">
        We&rsquo;re here 24/7. Call us, or send a message below and an attorney will reach out within one business hour.
      </PageHero>

      <section className="section">
        <div className="container layout-2col">
          <div className="reveal">
            <span className="eyebrow">Send a Message</span>
            <h2 style={{ marginBottom: 8 }}>Request your free case review</h2>
            <p style={{ marginBottom: 24 }}>There&rsquo;s no cost and no obligation. Everything you tell us is confidential.</p>
            <div className="lead-card" id="contact-form" style={{ boxShadow: "var(--shadow-md)" }}>
              <ContactForm variant="page" />
            </div>
          </div>

          <aside className="sidebar reveal">
            <h3>Call us anytime</h3>
            <p>Available 24 hours a day, 7 days a week for new matters.</p>
            <p><a href={PHONE_HREF} style={{ color: "var(--gold-300)", fontWeight: 700, fontSize: "1.5rem" }}>{PHONE}</a></p>
            <p style={{ marginTop: 16 }}>Prefer email?</p>
            <p><a href={`mailto:${EMAIL}`} style={{ color: "#fff", fontWeight: 600 }}>{EMAIL}</a></p>
            <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,.15)", margin: "22px 0" }} />
            <p style={{ color: "#c3cfde" }}>Can&rsquo;t travel? We make <strong style={{ color: "#fff" }}>home and hospital visits</strong>. Just ask when you call.</p>
          </aside>
        </div>
      </section>

      <Locations tight />
    </main>
  );
}
