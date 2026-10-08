// Content model for practice-area (service) pages. One file per page in content/services/,
// rendered by components/ServicePage.tsx. Inline text supports **bold** and [link text](/path).

export type Block =
  | { p: string } // paragraph
  | { ul: string[] } // bulleted list
  | { ol: string[] } // numbered list
  | { callout: string }; // highlighted note (deadlines, warnings)

export type ServiceGroup = "Wrongful Death" | "Vehicle Accidents" | "Serious Injuries" | "Other Practice Areas";

export type ServiceContent = {
  /** Full URL path, e.g. "/car-accident-lawyer" or "/wrongful-death/car-accident". */
  slug: string;
  group: ServiceGroup;
  /** Short name for links, cards and breadcrumbs, e.g. "Car Accidents". */
  name: string;
  /** <title> without the " | California Law" suffix - at most 43 characters. */
  title: string;
  /** Meta description - at most 155 characters. */
  description: string;
  h1: string;
  /** One or two sentences under the H1. */
  heroText: string;
  /** Card text on the practice-areas hub - at most 160 characters. */
  summary: string;
  /** Answer-first opening paragraph. */
  intro: string;
  /** Optional numbered "what to do" list, shown after the intro. */
  steps?: { heading: string; items: { title: string; text: string }[] };
  sections: { heading: string; blocks: Block[] }[];
  faqs: { q: string; a: string }[];
  /** Slugs of 3–4 related service pages. */
  related: string[];
  /** ISO date the content was last updated. */
  updated: string;
  /** City + service pages only: the office id this page belongs to (e.g. "los-angeles"). */
  location?: string;
  /** Attorney who reviewed this page (slug in content/attorneys.ts) and the ISO review date. */
  reviewedBy?: string;
  reviewed?: string;
};

// Office / city landing page, e.g. /los-angeles. One file per page in content/locations/,
// rendered by components/LocationPage.tsx. Office address and phone come from OFFICES in lib/site.ts.
export type LocationContent = {
  /** "/los-angeles" - must equal "/" + the office id in lib/site.ts. */
  slug: string;
  /** Office id in lib/site.ts OFFICES. */
  officeId: string;
  /** Short place name for links and breadcrumbs, e.g. "Los Angeles". */
  name: string;
  /** <title> without the " | California Law" suffix - at most 43 characters. */
  title: string;
  /** Meta description - at most 155 characters. */
  description: string;
  h1: string;
  heroText: string;
  /** Card text - at most 160 characters. */
  summary: string;
  intro: string;
  /** Cities and communities served from this office. */
  areasServed: string[];
  /** Courthouses where cases from this area are typically heard - official name, address, official URL. */
  courts: { name: string; address: string; url: string; note?: string }[];
  sections: { heading: string; blocks: Block[] }[];
  faqs: { q: string; a: string }[];
  /** ISO date the content was last updated. */
  updated: string;
  /** Attorney who reviewed this page (slug in content/attorneys.ts) and the ISO review date. */
  reviewedBy?: string;
  reviewed?: string;
};

export type ArticleCategory = "After an Accident" | "Insurance & Money" | "Your Case" | "Wrongful Death";

// Guide / article, e.g. /resources/how-to-get-a-california-collision-report. One file per page in
// content/articles/, rendered by components/ArticlePage.tsx. Same text fields as a service page.
export type ArticleContent = {
  /** "/resources/<slug>" */
  slug: string;
  category: ArticleCategory;
  /** Short name for links, cards and breadcrumbs. */
  name: string;
  /** <title> without the " | California Law" suffix - at most 43 characters. */
  title: string;
  /** Meta description - at most 155 characters. */
  description: string;
  h1: string;
  heroText: string;
  /** Card text on the resources hub - at most 160 characters. */
  summary: string;
  /** Answer-first opening paragraph (the direct answer to the question in the title). */
  intro: string;
  steps?: { heading: string; items: { title: string; text: string }[] };
  sections: { heading: string; blocks: Block[] }[];
  faqs: { q: string; a: string }[];
  /** Practice-area slugs this guide supports - they link back to it under "Helpful guides". */
  services: string[];
  /** Slugs of 2–4 related pages (other guides or practice areas) shown at the end. */
  related: string[];
  /** ISO dates. */
  published: string;
  updated: string;
  /** Attorney who reviewed this page (slug in content/attorneys.ts) and the ISO review date. */
  reviewedBy?: string;
  reviewed?: string;
};

// Attorney profile - content/attorneys.ts. Only real attorneys with real State Bar numbers.
export type Attorney = {
  /** URL slug: /attorneys/<slug> */
  slug: string;
  name: string;
  /** e.g. "Founding Partner", "Senior Trial Attorney" */
  title: string;
  /** State Bar of California license number - links to the official profile. */
  barNumber: string;
  /** Year admitted to the State Bar of California. */
  admitted: string;
  /** Square photo in public/images/attorneys/, e.g. "/images/attorneys/jane-doe.webp". */
  photo?: string;
  /** Office ids from lib/site.ts OFFICES. */
  offices: string[];
  /** Practice-area slugs, e.g. "/wrongful-death", "/car-accident-lawyer". */
  practiceAreas: string[];
  education: { school: string; degree: string; year?: string }[];
  bio: Block[];
  memberships?: string[];
  languages?: string[];
};
