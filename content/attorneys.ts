// The firm's attorneys. EMPTY until the firm provides real details - never add placeholder people.
//
// While this list is empty: /attorneys and /attorneys/* return 404, no "Reviewed by" bylines appear,
// and nothing links here. Add an attorney and the team page, bio page, Person structured data, sitemap
// entries and site-map links all appear automatically. To show "Reviewed by <name>" on a content page,
// set `reviewedBy: "<slug>"` and `reviewed: "YYYY-MM-DD"` in that page's content file - only after the
// attorney has actually reviewed it.
//
// Example shape (see the Attorney type in content/types.ts):
// {
//   slug: "jane-doe",
//   name: "Jane Doe",
//   title: "Founding Partner",
//   barNumber: "123456",
//   admitted: "2005",
//   photo: "/images/attorneys/jane-doe.webp",
//   offices: ["los-angeles"],
//   practiceAreas: ["/wrongful-death", "/truck-accident-lawyer"],
//   education: [{ school: "…", degree: "J.D.", year: "2004" }],
//   bio: [{ p: "…" }],
//   memberships: ["Consumer Attorneys of California"],
//   languages: ["English", "Spanish"],
// },
import type { Attorney } from "@/content/types";

export const ATTORNEYS: Attorney[] = [];

const BY_SLUG = new Map(ATTORNEYS.map((a) => [a.slug, a]));
export const getAttorney = (slug?: string) => (slug ? BY_SLUG.get(slug) : undefined);

/** Official State Bar of California profile for a license number. */
export const barProfileUrl = (barNumber: string) => `https://apps.calbar.ca.gov/attorney/Licensee/Detail/${barNumber}`;
