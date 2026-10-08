import { PageHero } from "@/components/Sections";
import { EMAIL, PHONE, PHONE_HREF, pageMeta } from "@/lib/site";

// Template privacy policy describing what this site actually does today (contact form → email,
// accessibility settings in localStorage, no analytics or ad cookies). Have the firm's counsel
// review it, and update it whenever analytics, chat, call tracking or ad pixels are added.

export const metadata = pageMeta(
  "/privacy",
  "Privacy Policy",
  "How California Law collects, uses, and protects the information you share through this website, including your rights under California law."
);

const UPDATED = "October 2, 2026";

export default function Privacy() {
  return (
    <main>
      <PageHero trail={[["Privacy Policy", "/privacy"]]} title="Privacy Policy">
        How we handle the information you share with us through this website.
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="prose" style={{ maxWidth: "75ch" }}>
            <p><em>Last updated: {UPDATED}</em></p>

            <h2>Information we collect</h2>
            <p>We collect only what you choose to send us and what is technically needed to run the site:</p>
            <ul className="bul">
              <li><strong>Case review requests.</strong> When you submit a form, we receive your name, phone number, email address, the type of case, your preferred office, and anything you write about what happened.</li>
              <li><strong>Phone calls and emails.</strong> If you call or email us, we receive the information you provide.</li>
              <li><strong>Technical data.</strong> Like most websites, our hosting provider automatically records basic request data such as IP address, browser type, and the pages requested, for security and to keep the site running.</li>
              <li><strong>Accessibility settings.</strong> If you use the accessibility menu, your choices (such as text size) are saved in your own browser&rsquo;s local storage. They are not sent to us.</li>
            </ul>
            <p>This website does not use advertising cookies or third-party analytics.</p>

            <h2>How we use your information</h2>
            <ul className="bul">
              <li>To review your inquiry and contact you about a potential case</li>
              <li>To run conflict checks before we can represent anyone</li>
              <li>To operate, secure, and improve this website</li>
              <li>To meet our legal and professional obligations</li>
            </ul>
            <p>We do not sell or share your personal information for advertising, and we do not use it to build marketing profiles.</p>

            <h2>Who we share it with</h2>
            <p>We share information only with service providers that help us run this website and receive your messages - our website host and our email delivery provider - and only as needed for that purpose. We may also disclose information when required by law or court order, or to protect our rights.</p>

            <h2>Submitting a form does not make you a client</h2>
            <p>Contacting us does not create an attorney-client relationship. Please don&rsquo;t send confidential or time-sensitive details through this website until an attorney has agreed to represent you. We nonetheless treat every inquiry as confidential.</p>

            <h2>How long we keep it</h2>
            <p>We keep inquiry information as long as needed to evaluate your matter, maintain conflict-check records, and meet our legal and professional record-keeping obligations.</p>

            <h2>Your California privacy rights</h2>
            <p>Depending on the circumstances, California residents may have the right to know what personal information we hold about them, to request that it be corrected or deleted, and to not be discriminated against for exercising these rights. Some information may be kept where the law or our professional duties require it. To make a request, contact us using the details below. We will need to verify your identity before responding.</p>

            <h2>Security</h2>
            <p>We use reasonable safeguards, including encrypted (HTTPS) connections, to protect the information you send us. No method of transmission over the internet is completely secure.</p>

            <h2>Children</h2>
            <p>This website is not directed to children under 13. If a parent or guardian is contacting us about a child&rsquo;s injury, please have the adult submit the inquiry.</p>

            <h2>Changes to this policy</h2>
            <p>We may update this policy from time to time. The date at the top shows when it was last changed.</p>

            <h2>Contact us</h2>
            <p>Questions about this policy or your information: email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or call <a href={PHONE_HREF}>{PHONE}</a>.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
