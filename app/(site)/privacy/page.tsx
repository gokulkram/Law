import LegalView from "@/components/static-pages/LegalView";
import type { LegalText } from "@/content/static-text";
import { getContent } from "@/lib/content-store";
import { staticPageMeta } from "@/lib/site";

export const generateMetadata = () => staticPageMeta("/privacy");

export default async function Privacy() {
  return <LegalView t={(await getContent()).staticText<LegalText>("/privacy")} path="/privacy" crumb="Privacy Policy" contactSection />;
}
