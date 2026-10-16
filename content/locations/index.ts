// SEED DATA ONLY - see content/services/index.ts. Office pages (/los-angeles, ...); order = display order.
import type { LocationContent } from "@/content/types";

import losAngeles from "./los-angeles";
import orangeCounty from "./orange-county";
import sanDiego from "./san-diego";
import bayArea from "./bay-area";
import sacramento from "./sacramento";
import inlandEmpire from "./inland-empire";

export const LOCATION_PAGES: LocationContent[] = [losAngeles, orangeCounty, sanDiego, bayArea, sacramento, inlandEmpire];
