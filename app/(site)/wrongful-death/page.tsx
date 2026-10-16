import WrongfulDeathView from "@/components/static-pages/WrongfulDeathView";
import type { WrongfulDeathText } from "@/content/static-text";
import { getContent } from "@/lib/content-store";
import { staticPageMeta } from "@/lib/site";

export const generateMetadata = () => staticPageMeta("/wrongful-death");

export default async function WrongfulDeath() {
  return <WrongfulDeathView t={(await getContent()).staticText<WrongfulDeathText>("/wrongful-death")} />;
}
