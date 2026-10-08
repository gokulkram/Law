import { PageHero } from "@/components/Sections";
import { pageMeta } from "@/lib/site";

// Have the firm's counsel review. California Rule of Professional Conduct 7.2(c) also requires
// advertising to include the name and office address of at least one responsible lawyer or the
// firm - add it here (and in the footer) once the firm provides it.

export const metadata = pageMeta(
  "/disclaimer",
  "Legal Disclaimer",
  "Attorney advertising disclaimer for California Law: no legal advice, no attorney-client relationship, and prior results do not guarantee outcomes."
);

export default function Disclaimer() {
  return (
    <main>
      <PageHero trail={[["Disclaimer", "/disclaimer"]]} title="Legal Disclaimer">
        Please read this before relying on anything on this website.
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="prose" style={{ maxWidth: "75ch" }}>
            <h2>Attorney advertising</h2>
            <p>This website is an advertisement for legal services under the California Rules of Professional Conduct.</p>

            <h2>No legal advice</h2>
            <p>The information on this website is for general information only. It is not legal advice and is not a substitute for advice from a lawyer about your specific situation. Laws change, and how they apply depends on the facts of each case.</p>

            <h2>No attorney-client relationship</h2>
            <p>Viewing this website, submitting a form, or contacting us by phone or email does not create an attorney-client relationship. An attorney-client relationship is formed only when the firm agrees in writing to represent you. Until then, please don&rsquo;t send confidential information you would not want shared.</p>

            <h2>Results and testimonials</h2>
            <p>Prior results do not guarantee or predict a similar outcome in any future matter. Every case is different and is decided on its own facts. Testimonials reflect individual clients&rsquo; experiences and are not a guarantee of the outcome in your case. Figures shown on this website are illustrative.</p>

            <h2>Deadlines</h2>
            <p>Legal claims are subject to strict time limits. Some - such as claims against government entities - can be as short as six months. Don&rsquo;t delay seeking advice because of anything you read here.</p>

            <h2>Where we practice</h2>
            <p>Our attorneys are licensed to practice law in California. We do not seek to represent anyone based on this website in a state where it does not comply with that state&rsquo;s laws and rules.</p>

            <h2>Fees</h2>
            <p>&ldquo;No fee unless we win&rdquo; refers to attorney&rsquo;s fees under a contingency-fee agreement. Case costs and how they are handled are explained in the written fee agreement before representation begins.</p>

            <h2>Links to other websites</h2>
            <p>Links to outside websites are provided for convenience. We don&rsquo;t control and aren&rsquo;t responsible for their content.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
