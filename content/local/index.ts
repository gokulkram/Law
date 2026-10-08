// Registry of city + service pages (/los-angeles/car-accident-lawyer, ...).
import type { ServiceContent } from "@/content/types";

import laCar from "./los-angeles--car-accident-lawyer";
import laTruck from "./los-angeles--truck-accident-lawyer";
import laDeath from "./los-angeles--wrongful-death-lawyer";
import ocCar from "./orange-county--car-accident-lawyer";
import ocTruck from "./orange-county--truck-accident-lawyer";
import ocDeath from "./orange-county--wrongful-death-lawyer";
import sdCar from "./san-diego--car-accident-lawyer";
import sdTruck from "./san-diego--truck-accident-lawyer";
import sdDeath from "./san-diego--wrongful-death-lawyer";

export const LOCAL_PAGES: ServiceContent[] = [laCar, laTruck, laDeath, ocCar, ocTruck, ocDeath, sdCar, sdTruck, sdDeath];

export const localPagesFor = (officeId: string) => LOCAL_PAGES.filter((p) => p.location === officeId);
