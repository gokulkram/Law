import { ResourcesView } from "@/components/static-pages/HubViews";
import type { ResourcesText } from "@/content/static-text";
import { getContent } from "@/lib/content-store";
import { staticPageMeta } from "@/lib/site";

export const generateMetadata = () => staticPageMeta("/resources");

export default async function Resources() {
  return <ResourcesView t={(await getContent()).staticText<ResourcesText>("/resources")} />;
}
