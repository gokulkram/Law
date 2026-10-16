// SEED DATA ONLY. The live site reads practice-area pages from the database (lib/content-store.ts);
// these files were imported with `npm run content:import` and are kept for reference and checks.
// Edits made here do not reach the site.
import type { ServiceContent } from "@/content/types";

import wdCar from "./wrongful-death--car-accident";
import wdTruck from "./wrongful-death--truck-accident";
import wdMedMal from "./wrongful-death--medical-malpractice";
import wdWork from "./wrongful-death--workplace";
import wdWho from "./wrongful-death--who-can-file";
import wdSurvival from "./wrongful-death--survival-action";
import wdDeadlines from "./wrongful-death--statute-of-limitations";
import car from "./car-accident-lawyer";
import truck from "./truck-accident-lawyer";
import motorcycle from "./motorcycle-accident-lawyer";
import rideshare from "./rideshare-accident-lawyer";
import pedestrian from "./pedestrian-accident-lawyer";
import bicycle from "./bicycle-accident-lawyer";
import catastrophic from "./catastrophic-injury-lawyer";
import brain from "./brain-injury-lawyer";
import spinal from "./spinal-cord-injury-lawyer";
import burn from "./burn-injury-lawyer";
import medMal from "./medical-malpractice-lawyer";
import nursingHome from "./nursing-home-abuse-lawyer";
import premises from "./premises-liability-lawyer";
import dogBite from "./dog-bite-lawyer";
import product from "./product-liability-lawyer";
import workplace from "./workplace-injury-lawyer";
import government from "./government-claims-lawyer";

// Order here is the display order within each group.
export const SERVICE_PAGES: ServiceContent[] = [
  wdCar, wdTruck, wdMedMal, wdWork, wdWho, wdSurvival, wdDeadlines,
  car, truck, motorcycle, rideshare, pedestrian, bicycle,
  catastrophic, brain, spinal, burn,
  medMal, nursingHome, premises, dogBite, product, workplace, government,
];
