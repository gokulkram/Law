import LegalView from "@/components/static-pages/LegalView";
import type { LegalText } from "@/content/static-text";
import { getContent } from "@/lib/content-store";
import { staticPageMeta } from "@/lib/site";

export const generateMetadata = () => staticPageMeta("/disclaimer");

export default async function Disclaimer() {
  return <LegalView t={(await getContent()).staticText<LegalText>("/disclaimer")} path="/disclaimer" crumb="Disclaimer" />;
}
