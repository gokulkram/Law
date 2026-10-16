// Fixed groupings used by the hub pages (practice areas, resources) and the site map. Code, not
// page content - pages themselves live in the database (lib/content-store.ts).
import type { ArticleCategory, ServiceGroup } from "@/content/types";

// Order of the groups on the practice-areas page. Their introductions are editable text on that page.
export const SERVICE_GROUPS: { group: ServiceGroup }[] = [
  { group: "Wrongful Death" },
  { group: "Vehicle Accidents" },
  { group: "Serious Injuries" },
  { group: "Other Practice Areas" },
];

export const ARTICLE_CATEGORIES: ArticleCategory[] = ["After an Accident", "Insurance & Money", "Your Case", "Wrongful Death"];

/** Groups on the HTML site map (/site-map) and sitemap priorities. */
export type PageGroup = "Firm" | "Legal" | "Locations" | "Resources" | ServiceGroup;

/** Official State Bar of California profile for a license number. */
export const barProfileUrl = (barNumber: string) => `https://apps.calbar.ca.gov/attorney/Licensee/Detail/${barNumber}`;
