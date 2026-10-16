// SEED DATA ONLY - see content/services/index.ts. Guides (/resources/...); order = display order.
import type { ArticleContent } from "@/content/types";

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
