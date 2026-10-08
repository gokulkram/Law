import { notFound } from "next/navigation";
import ServicePage from "@/components/ServicePage";
import { getServicePage } from "@/content";
import { LOCAL_PAGES } from "@/content/local";
import { pageMeta } from "@/lib/site";

// City + service pages, e.g. /los-angeles/car-accident-lawyer.
export const dynamicParams = false;

type Props = { params: Promise<{ service: string; topic: string }> };

// Returns both segments: the parent [service] params come from page.tsx, not a layout, so they
// aren't passed down here.
export function generateStaticParams() {
  return LOCAL_PAGES.map((p) => {
    const [, service, topic] = p.slug.split("/");
    return { service, topic };
  });
}

export async function generateMetadata({ params }: Props) {
  const { service, topic } = await params;
  const s = getServicePage(`/${service}/${topic}`);
  return s ? pageMeta(s.slug, s.title, s.description) : {};
}

export default async function Page({ params }: Props) {
  const { service, topic } = await params;
  const s = getServicePage(`/${service}/${topic}`);
  if (!s?.location) notFound();
  return <ServicePage s={s} />;
}
