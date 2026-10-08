// One lookup across every content-driven page: practice areas, city + service pages, offices.
import { ARTICLES } from "@/content/articles";
import { LOCAL_PAGES } from "@/content/local";
import { LOCATION_PAGES } from "@/content/locations";
import { SERVICE_PAGES } from "@/content/services";
import type { ServiceContent } from "@/content/types";

const SERVICES_BY_SLUG = new Map([...SERVICE_PAGES, ...LOCAL_PAGES].map((s) => [s.slug, s]));

/** A practice-area or city + service page (anything rendered by ServicePage). */
export const getServicePage = (slug: string): ServiceContent | undefined => SERVICES_BY_SLUG.get(slug);

/** Name + summary for linking to any content page (used for "related" cards). */
export type PageCard = { slug: string; name: string; summary: string };
// City + service pages have short names ("Car Accidents") because their breadcrumb already shows the
// city; when linked from elsewhere, prefix the city so they aren't confused with statewide pages.
const cityName = (p: ServiceContent) => LOCATION_PAGES.find((l) => l.officeId === p.location)?.name;
const CARDS = new Map<string, PageCard>([
  ...[...SERVICE_PAGES, ...LOCATION_PAGES, ...ARTICLES].map((p) => [p.slug, { slug: p.slug, name: p.name, summary: p.summary }] as const),
  ...LOCAL_PAGES.map((p) => [p.slug, { slug: p.slug, name: `${cityName(p) ?? ""} ${p.name}`.trim(), summary: p.summary }] as const),
]);
CARDS.set("/wrongful-death", {
  slug: "/wrongful-death",
  name: "Wrongful Death",
  summary: "When negligence takes a life, we help families seek accountability and the compensation they’re owed.",
});
export const getCard = (slug: string) => CARDS.get(slug);
