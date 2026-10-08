// Registry of practice-area pages. Add new pages here - routes, the practice-areas hub, the
// sitemap, the HTML site map and structured data all read from this list.
import type { ServiceContent, ServiceGroup } from "@/content/types";

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

export const SERVICE_GROUPS: { group: ServiceGroup; intro: string }[] = [
  { group: "Wrongful Death", intro: "When negligence takes a life, California law lets the family hold the responsible party accountable. Start here for your rights, deadlines, and the claims we handle." },
  { group: "Vehicle Accidents", intro: "Crashes on California roads - cars, trucks, motorcycles, rideshares, and the pedestrians and cyclists who share them." },
  { group: "Serious Injuries", intro: "Injuries that change a life require accounting for a lifetime of care, lost earnings, and loss of independence." },
  { group: "Other Practice Areas", intro: "Medical negligence, elder abuse, dangerous property and products, workplace injuries, and claims against public entities." },
];

const BY_SLUG = new Map(SERVICE_PAGES.map((s) => [s.slug, s]));
export const getService = (slug: string) => BY_SLUG.get(slug);
