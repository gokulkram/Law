import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { Blocks } from "@/components/RichText";
import { CtaBand, PageHero } from "@/components/Sections";
import { getCard } from "@/content";
import { ATTORNEYS, barProfileUrl, getAttorney } from "@/content/attorneys";
import { attorneySchema } from "@/lib/schema";
import { OFFICES, pageMeta } from "@/lib/site";

// Attorney bio pages, e.g. /attorneys/jane-doe.
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ATTORNEYS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const a = getAttorney((await params).slug);
  return a ? pageMeta(`/attorneys/${a.slug}`, `${a.name}, ${a.title}`, `${a.name} is a ${a.title.toLowerCase()} at California Law, licensed by the State Bar of California since ${a.admitted}.`) : {};
}

export default async function AttorneyPage({ params }: Props) {
  const a = getAttorney((await params).slug);
  if (!a) notFound();
  const offices = a.offices.map((id) => OFFICES.find((o) => o.id === id)).filter((o) => !!o);
  const areas = a.practiceAreas.map(getCard).filter((c) => !!c);
  return (
    <main>
      <JsonLd data={attorneySchema(a)} />
      <PageHero trail={[["Our Attorneys", "/attorneys"], [a.name, `/attorneys/${a.slug}`]]} title={a.name}>{a.title}</PageHero>
      <section className="section">
        <div className="container layout-2col">
          <article className="prose service">
            <Blocks blocks={a.bio} />
            {areas.length > 0 && (
              <>
                <h2>Practice areas</h2>
                <ul className="bul">{areas.map((c) => <li key={c.slug}><Link href={c.slug}>{c.name}</Link></li>)}</ul>
              </>
            )}
            <h2>Education</h2>
            <ul className="bul">{a.education.map((e) => <li key={e.school}>{e.degree}, {e.school}{e.year ? `, ${e.year}` : ""}</li>)}</ul>
            {a.memberships?.length ? (<><h2>Memberships</h2><ul className="bul">{a.memberships.map((m) => <li key={m}>{m}</li>)}</ul></>) : null}
          </article>
          <aside className="sidebar office-card">
            {a.photo && <img src={a.photo} alt={a.name} width={272} height={272} style={{ borderRadius: "var(--radius-sm)", marginBottom: 14 }} />}
            <h3>{a.name}</h3>
            <p>{a.title}</p>
            <p>State Bar of California <a href={barProfileUrl(a.barNumber)} target="_blank" rel="noopener" style={{ color: "var(--gold-300)" }}>#{a.barNumber}</a> &middot; admitted {a.admitted}</p>
            {offices.length > 0 && <p>{offices.map((o) => <Link key={o.id} href={`/${o.id}`} style={{ color: "#fff", display: "block" }}>{o.label} office</Link>)}</p>}
            {a.languages?.length ? <p>Languages: {a.languages.join(", ")}</p> : null}
          </aside>
        </div>
      </section>
      <CtaBand eyebrow="No Fee Unless We Win" title={`Talk to ${a.name.split(" ")[0]}’s team`} text="The consultation is free, the call is confidential, and there’s no obligation." cta="Get a Free Case Review" />
    </main>
  );
}
