// Everything in lib/firm.ts plus the lists derived from page content (SERVICES, PAGES).
// Server components, routes and metadata import from here. Client components import lib/firm.ts.
import { ARTICLES } from "@/content/articles";
import { ATTORNEYS } from "@/content/attorneys";
import { LOCAL_PAGES } from "@/content/local";
import { LOCATION_PAGES } from "@/content/locations";
import { SERVICE_PAGES } from "@/content/services";
import type { ServiceGroup } from "@/content/types";

export * from "@/lib/firm";

// Practice areas the firm handles (structured data "knowsAbout"). Derived from the page
// registry, leaving out the wrongful-death reference guides (who can file, deadlines, ...).
const GUIDES = ["/wrongful-death/who-can-file", "/wrongful-death/survival-action", "/wrongful-death/statute-of-limitations"];
export const SERVICES = ["Wrongful death", ...SERVICE_PAGES.filter((p) => !GUIDES.includes(p.slug)).map((p) => p.name)];

// Every indexable page. Feeds /sitemap.xml and the HTML site map (/site-map). Practice-area
// pages come from the registry in content/services; add other new pages here.
export type PageGroup = "Firm" | "Legal" | "Locations" | "Resources" | ServiceGroup;
export const PAGES: { path: string; label: string; group: PageGroup }[] = [
  { path: "/", label: "Home", group: "Firm" },
  { path: "/about", label: "About Us", group: "Firm" },
  { path: "/contact", label: "Contact & Locations", group: "Firm" },
  { path: "/practice-areas", label: "All Practice Areas", group: "Firm" },
  { path: "/wrongful-death", label: "Wrongful Death Overview", group: "Wrongful Death" },
  ...SERVICE_PAGES.map((p) => ({ path: p.slug, label: p.name, group: p.group })),
  ...LOCATION_PAGES.flatMap((l) => [
    { path: l.slug, label: `${l.name} Office`, group: "Locations" as const },
    ...LOCAL_PAGES.filter((p) => p.location === l.officeId).map((p) => ({ path: p.slug, label: `${l.name}: ${p.name}`, group: "Locations" as const })),
  ]),
  ...(ATTORNEYS.length
    ? [{ path: "/attorneys", label: "Our Attorneys", group: "Firm" as const }, ...ATTORNEYS.map((a) => ({ path: `/attorneys/${a.slug}`, label: a.name, group: "Firm" as const }))]
    : []),
  { path: "/resources", label: "All Guides", group: "Resources" },
  ...ARTICLES.map((a) => ({ path: a.slug, label: a.name, group: "Resources" as const })),
  { path: "/privacy", label: "Privacy Policy", group: "Legal" },
  { path: "/disclaimer", label: "Disclaimer", group: "Legal" },
  { path: "/site-map", label: "Site Map", group: "Legal" },
];
