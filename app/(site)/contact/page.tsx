import ContactView from "@/components/static-pages/ContactView";
import type { ContactText } from "@/content/static-text";
import { getContent } from "@/lib/content-store";
import { staticPageMeta } from "@/lib/site";

export const generateMetadata = () => staticPageMeta("/contact");

export default async function Contact() {
  return <ContactView t={(await getContent()).staticText<ContactText>("/contact")} />;
}
