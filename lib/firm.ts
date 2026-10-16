// Firm details and helpers with NO page content behind them. Client components ("use client") must
// import from here, not from lib/site.ts - that file also loads every content page, which would put
// all of the site's text into the JavaScript sent to browsers.

// Site identity and helpers. The site name and default description stay in code (the logo, the
// share image and the title template use them); the firm description used in structured data is
// edited in the admin panel.

export const SITE_NAME = "California Law";
export const SITE_DESCRIPTION =
  "California personal injury law firm focused on wrongful death, with six offices statewide. Free consultation, no fee unless we win.";

// Production URL, e.g. https://www.example.com. Canonical tags, sitemap entries and
// structured-data URLs are only emitted when this is set, so a guessed domain never
// ends up in search results. It is read at build time: redeploy after changing it.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "";

// Phone, email, social links and offices are edited in the admin panel (Site settings) and read
// with getContent().firm (lib/content-store.ts). Office ids are part of URLs, so they stay here.
export const OFFICE_IDS = ["los-angeles", "orange-county", "san-diego", "bay-area", "sacramento", "inland-empire"];

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/practice-areas", label: "Practice Areas" },
  { href: "/wrongful-death", label: "Wrongful Death" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export type { Office } from "@/lib/admin/settings-model";

// Absolute URL when SITE_URL is set, otherwise undefined.
export function absUrl(path: string) {
  return SITE_URL ? `${SITE_URL}${path === "/" ? "" : path}` : undefined;
}

const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE_NAME} - California personal injury and wrongful death attorneys` };

/** Per-page SEO overrides from the admin panel (see Seo in lib/admin/page-model.ts). */
export type SeoOverrides = { canonical?: string; noindex?: boolean; nofollow?: boolean; ogTitle?: string; ogDescription?: string; ogImage?: string };

// Shared page metadata: canonical URL only when SITE_URL is configured.
// Keep titles under ~60 characters (the " | California Law" suffix counts) and descriptions under ~155.
// Overrides set in the admin panel replace the defaults; with none set the output is unchanged.
export function pageMeta(path: string, title: string, description: string, seo: SeoOverrides = {}) {
  const ogTitle = seo.ogTitle || title;
  const ogDescription = seo.ogDescription || description;
  const image = seo.ogImage ? { url: seo.ogImage } : OG_IMAGE;
  return {
    title,
    description,
    alternates: SITE_URL ? { canonical: seo.canonical || path } : undefined,
    ...((seo.noindex || seo.nofollow) && { robots: { index: !seo.noindex, follow: !seo.nofollow } }),
    // Pages set their own openGraph, which replaces the inherited one - so repeat the share image
    // (app/opengraph-image.tsx) here or it is lost on every page except the home page.
    openGraph: { title: ogTitle, description: ogDescription, url: SITE_URL ? path : undefined, siteName: SITE_NAME, type: "website" as const, locale: "en_US", images: [image] },
    twitter: { card: "summary_large_image" as const, title: ogTitle, description: ogDescription, images: [image.url] },
  };
}
