import { notFound } from "next/navigation";
import { AttorneysView } from "@/components/static-pages/HubViews";
import type { AttorneysText } from "@/content/static-text";
import { getContent } from "@/lib/content-store";
import { staticPageMeta } from "@/lib/site";

// Team page. 404 until there are attorney pages in the database.
export const generateMetadata = () => staticPageMeta("/attorneys");

export default async function Attorneys() {
  const c = await getContent();
  if (c.attorneys.length === 0) notFound();
  return <AttorneysView t={c.staticText<AttorneysText>("/attorneys")} />;
}
