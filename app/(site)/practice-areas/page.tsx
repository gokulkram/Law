import { PracticeAreasView } from "@/components/static-pages/HubViews";
import type { PracticeAreasText } from "@/content/static-text";
import { getContent } from "@/lib/content-store";
import { staticPageMeta } from "@/lib/site";

export const generateMetadata = () => staticPageMeta("/practice-areas");

export default async function PracticeAreas() {
  return <PracticeAreasView t={(await getContent()).staticText<PracticeAreasText>("/practice-areas")} />;
}
