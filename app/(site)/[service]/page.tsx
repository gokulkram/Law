import LocationPage from "@/components/LocationPage";
import ServicePage from "@/components/ServicePage";
import { getContent } from "@/lib/content-store";
import { contentPageMeta, redirectOrNotFound } from "@/lib/site";

// Top-level content pages: practice areas (/car-accident-lawyer) and offices (/los-angeles).
// Paths come from the database. dynamicParams must stay true: with false, Next refuses to
// regenerate these pages after a content update (NoFallbackError). Unknown paths follow a redirect set in the admin panel, or 404.
export const dynamicParams = true;

type Props = { params: Promise<{ service: string }> };

export async function generateStaticParams() {
  const c = await getContent();
  return [...c.services.filter((s) => s.slug.split("/").length === 2), ...c.locations].map((s) => ({ service: s.slug.slice(1) }));
}

export async function generateMetadata({ params }: Props) {
  const slug = `/${(await params).service}`;
  const c = await getContent();
  const p = c.service(slug) ?? c.location(slug);
  return p ? contentPageMeta(p.slug, p.title, p.description) : {};
}

export default async function Page({ params }: Props) {
  const slug = `/${(await params).service}`;
  const c = await getContent();
  const service = c.service(slug);
  if (service) return <ServicePage s={service} />;
  const location = c.location(slug);
  if (location) return <LocationPage l={location} />;
  return redirectOrNotFound(slug);
}
