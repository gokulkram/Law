// Structured data (schema.org JSON-LD), built from lib/site.ts and the page content (lib/content-store.ts).
import { barProfileUrl } from "@/content/groups";
import type { ArticleContent, Attorney, LocationContent, ServiceContent } from "@/content/types";
import { parseJsonLd, type Seo } from "@/lib/admin/page-model";
import type { Content } from "@/lib/content-store";
import { SITE_NAME, SITE_URL, absUrl, type Office } from "@/lib/firm";

const FIRM_ID = `${SITE_URL}/#firm`;
const SITE_ID = `${SITE_URL}/#website`;

function address(o: Office) {
  return {
    "@type": "PostalAddress",
    ...(o.street && { streetAddress: o.street }),
    addressLocality: o.locality,
    addressRegion: "CA",
    ...(o.postalCode && { postalCode: o.postalCode }),
    addressCountry: "US",
  };
}

// Site-wide graph: the firm, each office as a department, and the website.
export function firmSchema(c: Content) {
  const { firm } = c;
  const sameAs = firm.social.map((s) => s.url).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LegalService",
        "@id": FIRM_ID,
        name: SITE_NAME,
        description: firm.description,
        ...(SITE_URL && { url: SITE_URL, logo: `${SITE_URL}/assets/logo-header.webp`, image: `${SITE_URL}/opengraph-image` }),
        telephone: firm.phoneSchema,
        email: firm.email,
        address: address(firm.offices[0]),
        areaServed: { "@type": "State", name: "California" },
        knowsAbout: c.knowsAbout,
        openingHours: "Mo-Su 00:00-23:59",
        ...(sameAs.length && { sameAs }),
        department: firm.offices.map((o) => ({
          "@type": "LegalService",
          "@id": `${SITE_URL}/#office-${o.id}`,
          name: `${SITE_NAME} - ${o.label}`,
          telephone: o.tel,
          address: address(o),
          ...(SITE_URL && { url: `${SITE_URL}/contact` }),
          parentOrganization: { "@id": FIRM_ID },
        })),
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        name: SITE_NAME,
        ...(SITE_URL && { url: SITE_URL }),
        publisher: { "@id": FIRM_ID },
        inLanguage: "en-US",
      },
    ],
  };
}

// Breadcrumb trail: [["Home", "/"], ["Wrongful Death", "/wrongful-death"]]. Needs absolute URLs,
// so it's only produced once SITE_URL is set.
export function breadcrumbSchema(trail: [string, string][]) {
  if (!SITE_URL) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: absUrl(path) })),
  };
}

// Person node for an attorney (bio pages), and a reference to one for "reviewedBy".
const personId = (a: Attorney) => `${SITE_URL}/attorneys/${a.slug}#person`;
export function attorneySchema(a: Attorney) {
  const url = absUrl(`/attorneys/${a.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId(a),
    name: a.name,
    jobTitle: a.title,
    ...(url && { url }),
    ...(a.photo && SITE_URL && { image: `${SITE_URL}${a.photo}` }),
    worksFor: { "@id": FIRM_ID },
    alumniOf: a.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
    knowsLanguage: a.languages,
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "license",
      name: `State Bar of California license #${a.barNumber}`,
      recognizedBy: { "@type": "Organization", name: "State Bar of California" },
    },
    sameAs: [barProfileUrl(a.barNumber)],
  };
}
const reviewer = (c: Content, slug?: string, date?: string) => {
  const a = c.attorney(slug);
  return a ? { reviewedBy: { "@type": "Person", "@id": personId(a), name: a.name }, ...(date && { lastReviewed: date }) } : {};
};

const strip = (text: string) => text.replace(/\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g, (_, b, t) => b ?? t);

// Practice-area page: the service (provided by the firm), its FAQ, and the page itself.
export function servicePageSchema(s: ServiceContent, c: Content) {
  const url = absUrl(s.slug);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        ...(url && { "@id": `${url}#service`, url }),
        name: s.h1,
        serviceType: s.name,
        description: s.description,
        provider: { "@id": s.location ? `${SITE_URL}/#office-${s.location}` : FIRM_ID },
        areaServed: s.location
          ? { "@type": "AdministrativeArea", name: c.firm.offices.find((o) => o.id === s.location)?.label ?? "California" }
          : { "@type": "State", name: "California" },
      },
      {
        "@type": "WebPage",
        ...(url && { "@id": url, url }),
        name: s.title,
        description: s.description,
        dateModified: s.updated,
        ...reviewer(c, s.reviewedBy, s.reviewed),
        isPartOf: { "@id": SITE_ID },
        inLanguage: "en-US",
      },
      {
        "@type": "FAQPage",
        mainEntity: s.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })),
      },
    ],
  };
}

// Office page: the office as a LegalService (same @id as in the firm graph), its FAQ, and the page.
export function locationPageSchema(l: LocationContent, c: Content) {
  const office = c.firm.offices.find((o) => o.id === l.officeId);
  const url = absUrl(l.slug);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LegalService",
        "@id": `${SITE_URL}/#office-${l.officeId}`,
        name: `${SITE_NAME} - ${l.name}`,
        description: l.description,
        ...(url && { url }),
        ...(office && { telephone: office.tel, address: address(office) }),
        areaServed: l.areasServed.map((name) => ({ "@type": "City", name })),
        knowsAbout: c.knowsAbout,
        parentOrganization: { "@id": FIRM_ID },
      },
      {
        "@type": "WebPage",
        ...(url && { "@id": url, url }),
        name: l.title,
        description: l.description,
        dateModified: l.updated,
        ...reviewer(c, l.reviewedBy, l.reviewed),
        isPartOf: { "@id": SITE_ID },
        about: { "@id": `${SITE_URL}/#office-${l.officeId}` },
        inLanguage: "en-US",
      },
      {
        "@type": "FAQPage",
        mainEntity: l.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })),
      },
    ],
  };
}

// Guide page: an Article published by the firm (author = the reviewing attorney once there is one).
export function articleSchema(a: ArticleContent, c: Content) {
  const url = absUrl(a.slug);
  const attorney = c.attorney(a.reviewedBy);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        ...(url && { "@id": `${url}#article`, url, mainEntityOfPage: url }),
        headline: a.h1,
        description: a.description,
        articleSection: a.category,
        datePublished: a.published,
        dateModified: a.updated,
        author: attorney ? { "@type": "Person", "@id": personId(attorney), name: attorney.name } : { "@id": FIRM_ID },
        publisher: { "@id": FIRM_ID },
        ...(SITE_URL && { image: `${SITE_URL}/opengraph-image` }),
        inLanguage: "en-US",
        isPartOf: { "@id": SITE_ID },
        ...reviewer(c, a.reviewedBy, a.reviewed),
      },
      {
        "@type": "FAQPage",
        mainEntity: a.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })),
      },
    ],
  };
}

// Per-page structured-data settings from the admin panel.
type Graph = { "@context": string; "@graph": { "@type": string }[] };
/** Leaves out the FAQPage node when the page's SEO settings turn the FAQ schema off. */
export function applySchemaSettings<T extends Graph>(schema: T, seo: Seo): T {
  return seo.faqSchema === false ? { ...schema, "@graph": schema["@graph"].filter((n) => n["@type"] !== "FAQPage") } : schema;
}
/** The page's custom JSON-LD, parsed (never output as raw text), or null. */
export function customJsonLd(seo: Seo) {
  if (!seo.jsonLd) return null;
  const r = parseJsonLd(seo.jsonLd);
  return r.ok ? { "@context": "https://schema.org", ...r.value } : null;
}
