import AboutView from "@/components/static-pages/AboutView";
import type { AboutText } from "@/content/static-text";
import { getContent } from "@/lib/content-store";
import { staticPageMeta } from "@/lib/site";

export const generateMetadata = () => staticPageMeta("/about");

export default async function About() {
  const c = await getContent();
  return <AboutView t={c.staticText<AboutText>("/about")} hasAttorneys={c.attorneys.length > 0} />;
}
