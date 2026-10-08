import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, PageHero } from "@/components/Sections";
import { ATTORNEYS } from "@/content/attorneys";
import { OFFICES, pageMeta } from "@/lib/site";

// Team page. 404 until content/attorneys.ts has real attorneys.
export const metadata = pageMeta("/attorneys", "Our Attorneys", "Meet the California Law attorneys who handle personal injury and wrongful death cases across California - licensed by the State Bar of California.");

export default function Attorneys() {
  if (ATTORNEYS.length === 0) notFound();
  return (
    <main>
      <PageHero trail={[["Our Attorneys", "/attorneys"]]} title="Our Attorneys">
        The people who will handle your case. Every attorney is licensed by the State Bar of California - follow the license number to the official record.
      </PageHero>
      <section className="section">
        <div className="container">
          <div className="cards">
            {ATTORNEYS.map((a) => (
              <article className="card attorney-card" key={a.slug}>
                {a.photo && <img src={a.photo} alt={a.name} width={320} height={320} loading="lazy" />}
                <h2 style={{ fontSize: "1.3rem" }}><Link className="card__link" href={`/attorneys/${a.slug}`}>{a.name}</Link></h2>
                <p>{a.title}</p>
                <p className="muted">{a.offices.map((id) => OFFICES.find((o) => o.id === id)?.label).filter(Boolean).join(" · ")}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CtaBand eyebrow="No Fee Unless We Win" title="Talk to our team" text="The consultation is free, the call is confidential, and there’s no obligation." cta="Get a Free Case Review" />
    </main>
  );
}
