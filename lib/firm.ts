// Firm details and helpers with NO page content behind them. Client components ("use client") must
// import from here, not from lib/site.ts - that file also loads every content page, which would put
// all of the site's text into the JavaScript sent to browsers.

// Firm details used across the site - pages, footer, forms and structured data (JSON-LD)
// all read from here. Placeholders: replace before launch (see README).

export const SITE_NAME = "California Law";
export const SITE_DESCRIPTION =
  "California personal injury law firm focused on wrongful death, with six offices statewide. Free consultation, no fee unless we win.";

// Production URL, e.g. https://www.example.com. Canonical tags, sitemap entries and
// structured-data URLs are only emitted when this is set, so a guessed domain never
// ends up in search results. It is read at build time: redeploy after changing it.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "";

export const PHONE = "(800) 555-0100";
export const PHONE_HREF = "tel:+18005550100";
export const PHONE_E164 = "+1-800-555-0100";
export const EMAIL = "intake@californialaw.com";

// Social profiles - links render in the footer (and go into structured data) only once filled in.
export const SOCIAL: { label: string; short: string; url: string }[] = [
  { label: "Facebook", short: "f", url: "" },
  { label: "LinkedIn", short: "in", url: "" },
  { label: "X", short: "x", url: "" },
];

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/practice-areas", label: "Practice Areas" },
  { href: "/wrongful-death", label: "Wrongful Death" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

// `street` and `postalCode` are blank until the firm supplies real addresses. They must match
// each office's Google Business Profile exactly (name, address, phone).
export type Office = {
  id: string;
  label: string;
  kind: "Main Office" | "Branch Office";
  street: string;
  locality: string;
  postalCode: string;
  phone: string;
  tel: string;
  img: string;
};

export const OFFICES: Office[] = [
  { id: "los-angeles", label: "Los Angeles", kind: "Main Office", street: "", locality: "Los Angeles", postalCode: "", phone: "(800) 555-0100", tel: "+18005550100", img: "/images/office-los-angeles.webp" },
  { id: "orange-county", label: "Orange County", kind: "Branch Office", street: "", locality: "Irvine", postalCode: "", phone: "(800) 555-0120", tel: "+18005550120", img: "/images/office-orange-county.webp" },
  { id: "san-diego", label: "San Diego", kind: "Branch Office", street: "", locality: "San Diego", postalCode: "", phone: "(800) 555-0140", tel: "+18005550140", img: "/images/office-san-diego.webp" },
  { id: "bay-area", label: "Bay Area", kind: "Branch Office", street: "", locality: "San Francisco", postalCode: "", phone: "(800) 555-0160", tel: "+18005550160", img: "/images/office-bay-area.webp" },
  { id: "sacramento", label: "Sacramento", kind: "Branch Office", street: "", locality: "Sacramento", postalCode: "", phone: "(800) 555-0180", tel: "+18005550180", img: "/images/office-sacramento.webp" },
  { id: "inland-empire", label: "Inland Empire", kind: "Branch Office", street: "", locality: "Riverside", postalCode: "", phone: "(800) 555-0200", tel: "+18005550200", img: "/images/office-inland-empire.webp" },
];

export const CASE_TYPES = [
  "Wrongful death",
  "Car / truck accident",
  "Medical malpractice",
  "Workplace injury",
  "Slip & fall",
  "Other personal injury",
];

// Absolute URL when SITE_URL is set, otherwise undefined.
export function absUrl(path: string) {
  return SITE_URL ? `${SITE_URL}${path === "/" ? "" : path}` : undefined;
}

const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE_NAME} - California personal injury and wrongful death attorneys` };

// Shared page metadata: canonical URL only when SITE_URL is configured.
// Keep titles under ~60 characters (the " | California Law" suffix counts) and descriptions under ~155.
export function pageMeta(path: string, title: string, description: string) {
  return {
    title,
    description,
    alternates: SITE_URL ? { canonical: path } : undefined,
    // Pages set their own openGraph, which replaces the inherited one - so repeat the share image
    // (app/opengraph-image.tsx) here or it is lost on every page except the home page.
    openGraph: { title, description, url: SITE_URL ? path : undefined, siteName: SITE_NAME, type: "website" as const, locale: "en_US", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image" as const, title, description, images: [OG_IMAGE.url] },
  };
}
