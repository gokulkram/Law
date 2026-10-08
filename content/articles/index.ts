// Registry of guides (/resources/...). Order = display order within each category.
import type { ArticleCategory, ArticleContent } from "@/content/types";

import collisionReport from "./resources--how-to-get-a-california-collision-report";
import adjuster from "./resources--talking-to-insurance-adjuster";
import uninsured from "./resources--uninsured-motorist-claims-california";
import medicalBills from "./resources--who-pays-medical-bills-after-accident";
import contingencyFees from "./resources--contingency-fees-california";
import timeline from "./resources--how-long-personal-injury-case-takes";
import painSuffering from "./resources--pain-and-suffering-california";
import wdDistribution from "./resources--wrongful-death-settlement-distribution";

export const ARTICLES: ArticleContent[] = [
  collisionReport, adjuster, uninsured, medicalBills, painSuffering, contingencyFees, timeline, wdDistribution,
];

export const ARTICLE_CATEGORIES: ArticleCategory[] = ["After an Accident", "Insurance & Money", "Your Case", "Wrongful Death"];

const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));
export const getArticle = (slug: string) => BY_SLUG.get(slug);

/** Guides that support a given practice-area page (for "Helpful guides" on that page). */
export const articlesFor = (serviceSlug: string) => ARTICLES.filter((a) => a.services.includes(serviceSlug));
