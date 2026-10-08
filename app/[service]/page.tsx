import { notFound } from "next/navigation";
import LocationPage from "@/components/LocationPage";
import ServicePage from "@/components/ServicePage";
import { getLocation, LOCATION_PAGES } from "@/content/locations";
import { SERVICE_PAGES, getService } from "@/content/services";
import { pageMeta } from "@/lib/site";

// Top-level content pages: practice areas (/car-accident-lawyer) and offices (/los-angeles).
// Only slugs in the registries exist.
export const dynamicParams = false;

type Props = { params: Promise<{ service: string }> };

export function generateStaticParams() {
  return [...SERVICE_PAGES.filter((s) => s.slug.split("/").length === 2), ...LOCATION_PAGES].map((s) => ({ service: s.slug.slice(1) }));
}

export async function generateMetadata({ params }: Props) {
  const slug = `/${(await params).service}`;
  const p = getService(slug) ?? getLocation(slug);
  return p ? pageMeta(p.slug, p.title, p.description) : {};
}

export default async function Page({ params }: Props) {
  const slug = `/${(await params).service}`;
  const service = getService(slug);
  if (service) return <ServicePage s={service} />;
  const location = getLocation(slug);
  if (location) return <LocationPage l={location} />;
  notFound();
}
