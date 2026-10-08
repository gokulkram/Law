// Registry of office pages (/los-angeles, ...). Order = display order.
import type { LocationContent } from "@/content/types";

import losAngeles from "./los-angeles";
import orangeCounty from "./orange-county";
import sanDiego from "./san-diego";
import bayArea from "./bay-area";
import sacramento from "./sacramento";
import inlandEmpire from "./inland-empire";

export const LOCATION_PAGES: LocationContent[] = [losAngeles, orangeCounty, sanDiego, bayArea, sacramento, inlandEmpire];

const BY_SLUG = new Map(LOCATION_PAGES.map((l) => [l.slug, l]));
export const getLocation = (slug: string) => BY_SLUG.get(slug);
