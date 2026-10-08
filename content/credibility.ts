// Trust signals shown on the site: headline stats and client testimonials.
//
// ⚠ EVERYTHING HERE IS A PLACEHOLDER from the original design. Before launch, replace each item with a
// verified figure or an approved client review, or delete it - California Rules of Professional Conduct
// 7.1–7.2 prohibit misleading claims, and figures and testimonials need to be accurate and typically
// carry a disclaimer that past results don't guarantee future outcomes. Set `verified: true` on each
// real item. `npm run build` prints a warning while any placeholder remains.

export type Stat = { value: string; label: string; verified: boolean };
export type Testimonial = { quote: string; initials: string; who: string; kind: string; verified: boolean };

/** Home page trust bar (4 items). */
export const HOME_STATS: Stat[] = [
  { value: "2,000+", label: "Families helped", verified: false },
  { value: "98%", label: "Case success rate", verified: false },
  { value: "35+ yrs", label: "Combined trial experience", verified: false },
  { value: "24/7", label: "Availability", verified: true },
];

/** Wrongful death page sidebar (4 items). */
export const WRONGFUL_DEATH_STATS: Stat[] = [
  { value: "$500M+", label: "Recovered for clients", verified: false },
  { value: "98%", label: "Case success rate", verified: false },
  { value: "35+ yrs", label: "Combined trial experience", verified: false },
  { value: "24/7", label: "Free, confidential intake", verified: true },
];

/** Home page testimonial slider. Use only reviews the client approved for publication. */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "After we lost my husband, I couldn’t think straight. California Law handled everything with such kindness and fought harder than I ever expected. They gave my children a future.",
    initials: "MT",
    who: "Maria T.",
    kind: "Wrongful death - trucking collision",
    verified: false,
  },
  {
    quote: "The insurance company offered almost nothing. My attorney at California Law refused to settle and won a verdict that covered my surgeries and lost income. I’ll never be able to thank them enough.",
    initials: "JR",
    who: "James R.",
    kind: "Catastrophic injury - auto accident",
    verified: false,
  },
  {
    quote: "They explained every step in plain language and always returned my calls. I never felt like just a case number. Truly compassionate, truly relentless.",
    initials: "DC",
    who: "Denise & Carl W.",
    kind: "Medical malpractice",
    verified: false,
  },
];

const unverified = [...HOME_STATS, ...WRONGFUL_DEATH_STATS, ...TESTIMONIALS].filter((x) => !x.verified).length;
if (unverified && process.env.NODE_ENV === "production" && typeof window === "undefined") {
  console.warn(`⚠ content/credibility.ts: ${unverified} placeholder stat(s)/testimonial(s) are still unverified - replace or remove before launch.`);
}
