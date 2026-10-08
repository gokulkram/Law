import Link from "next/link";
import { CtaBand, PageHero } from "@/components/Sections";
import { articlesFor } from "@/content/articles";
import { WRONGFUL_DEATH_STATS } from "@/content/credibility";
import { getService } from "@/content/services";
import { PHONE, PHONE_HREF, pageMeta } from "@/lib/site";

const CASES = ["/wrongful-death/car-accident", "/wrongful-death/truck-accident", "/wrongful-death/medical-malpractice", "/wrongful-death/workplace"].map((s) => getService(s)!);
const GUIDES = ["/wrongful-death/who-can-file", "/wrongful-death/survival-action", "/wrongful-death/statute-of-limitations"].map((s) => getService(s)!);

export const metadata = pageMeta(
  "/wrongful-death",
  "California Wrongful Death Attorneys",
  "California wrongful death attorneys for families who lost a loved one to negligence. Who can file, deadlines and compensation. Free consultation."
);

export default function WrongfulDeath() {
  return (
    <main>
      <PageHero trail={[["Wrongful Death", "/wrongful-death"]]} title="California Wrongful Death Attorneys">
        When negligence takes a life, California law gives surviving families the right to seek accountability and compensation. We are here to help you carry that fight.
      </PageHero>

      <section className="section">
        <div className="container layout-2col">
          <div className="prose reveal">
            <p className="lead" style={{ color: "var(--ink)" }}>Nothing can undo the loss of someone you love. But holding the responsible party accountable can bring a measure of justice - and the financial stability your family needs to move forward.</p>

            <h2>What is a wrongful death claim in California?</h2>
            <p>A wrongful death claim is a civil action brought when a person dies because of the negligent, reckless, or intentional act of another. Unlike a criminal case - which punishes wrongdoing - a wrongful death claim is brought by the surviving family to recover for their losses.</p>
            <p>These claims commonly arise from:</p>
            <ul className="bul">
              <li>Car, truck, and motorcycle collisions</li>
              <li>Medical malpractice and hospital negligence</li>
              <li>Workplace and construction accidents</li>
              <li>Defective products and dangerous premises</li>
              <li>Nursing home neglect and abuse</li>
            </ul>

            <h2>Who can file a claim?</h2>
            <p>Under California Code of Civil Procedure &sect;377.60, a wrongful death claim may be brought by the deceased person&rsquo;s surviving spouse or domestic partner, children, and the children of a deceased child. If there are none, the claim belongs to those who would inherit under California&rsquo;s intestate succession laws - often parents or siblings.</p>
            <p>Certain dependents may also qualify, including a putative spouse, stepchildren, or parents who relied on the deceased for support, and some minors who lived in the household. Separately, the estate&rsquo;s personal representative may bring a <strong>survival action</strong> for losses the deceased person suffered before death. We&rsquo;ll help you understand exactly who has standing in your situation. <Link href="/wrongful-death/who-can-file">Read the full guide to who can file</Link>, or learn how a <Link href="/wrongful-death/survival-action">survival action</Link> differs from a wrongful death claim.</p>

            <h2>What compensation may be available?</h2>
            <p>While every case is different, California wrongful death and survival claims can recover:</p>
            <ul className="bul">
              <li><strong>Economic losses</strong> - the financial support, household services, and benefits the deceased would have provided, plus funeral and burial expenses</li>
              <li><strong>Loss of love and companionship</strong> - the comfort, care, guidance, and moral support the family has lost</li>
              <li><strong>Survival damages</strong> - through the estate&rsquo;s survival action: losses the deceased suffered before death, such as medical bills and lost earnings, and in cases of especially egregious conduct, punitive damages</li>
            </ul>

            <h2>Act before time runs out</h2>
            <p>In California, most wrongful death lawsuits must be filed within <strong>two years of the date of death</strong> (Code of Civil Procedure &sect;335.1). Some deadlines are far shorter: if a city, county, state agency, or other public entity may be responsible, a written government claim generally must be filed within <strong>six months</strong> (Government Code &sect;911.2). Cases involving medical negligence follow their own rules. See our guide to <Link href="/wrongful-death/statute-of-limitations">wrongful death deadlines in California</Link>.</p>
            <p>Evidence also fades quickly: vehicles are repaired, records are lost, and memories blur. The sooner we begin, the stronger your case. There is no cost to speak with us, and we never charge a fee unless we win.</p>

            <h2>How California Law helps</h2>
            <p>We handle wrongful death claims with the sensitivity they demand and the rigor they require. From the first call, a senior attorney leads your case - investigating thoroughly, retaining the right experts, and pressing for the full value of your family&rsquo;s loss, at the negotiating table or before a jury.</p>

            <h2>Wrongful death cases we handle</h2>
            <div className="related">
              {CASES.map((c) => (
                <Link key={c.slug} href={c.slug} className="related__item"><strong>{c.name}</strong><span>{c.summary}</span></Link>
              ))}
            </div>

            <h2>Understand your family&rsquo;s rights</h2>
            <div className="related">
              {[...GUIDES, ...articlesFor("/wrongful-death")].map((c) => (
                <Link key={c.slug} href={c.slug} className="related__item"><strong>{c.name}</strong><span>{c.summary}</span></Link>
              ))}
            </div>
          </div>

          <div className="aside-stack reveal">
            <aside className="sidebar">
              <h3>Talk to us, free</h3>
              <p>A confidential, no-obligation conversation with a wrongful death attorney - available 24/7.</p>
              <Link className="btn btn--gold btn--block" href="/contact">Request a Free Review</Link>
              <p style={{ marginTop: 18 }}>Or call us anytime:</p>
              <p><a href={PHONE_HREF} style={{ color: "var(--gold-300)", fontWeight: 700, fontSize: "1.25rem" }}>{PHONE}</a></p>
            </aside>
            <aside className="sidebar-stats">
              <h4>A track record families trust</h4>
              <ul>
                {WRONGFUL_DEATH_STATS.map((s) => (
                  <li key={s.label}><strong>{s.value}</strong><span>{s.label}</span></li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="We’re Ready to Listen"
        title="You don’t have to face this alone"
        text="Reach out whenever you’re ready. We’ll handle the legal burden so your family can focus on healing."
        cta="Start My Free Case Review"
      />
    </main>
  );
}
