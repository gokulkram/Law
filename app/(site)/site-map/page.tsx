import { SiteMapView } from "@/components/static-pages/HubViews";
import type { HeroOnlyText } from "@/content/static-text";
import { getContent } from "@/lib/content-store";
import { staticPageMeta } from "@/lib/site";

export const generateMetadata = () => staticPageMeta("/site-map");

export default async function SiteMap() {
  return <SiteMapView t={(await getContent()).staticText<HeroOnlyText>("/site-map")} />;
}
