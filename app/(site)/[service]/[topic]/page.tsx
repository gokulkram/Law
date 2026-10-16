import ServicePage from "@/components/ServicePage";
import { getContent } from "@/lib/content-store";
import { contentPageMeta, redirectOrNotFound } from "@/lib/site";

// City + service pages, e.g. /los-angeles/car-accident-lawyer.
// Paths come from the database. dynamicParams must stay true: with false, Next refuses to
// regenerate these pages after a content update (NoFallbackError). Unknown paths follow a redirect set in the admin panel, or 404.
export const dynamicParams = true;

type Props = { params: Promise<{ service: string; topic: string }> };

// Returns both segments: the parent [service] params come from page.tsx, not a layout, so they
// aren't passed down here.
export async function generateStaticParams() {
  return (await getContent()).local.map((p) => {
    const [, service, topic] = p.slug.split("/");
    return { service, topic };
  });
}

export async function generateMetadata({ params }: Props) {
  const { service, topic } = await params;
  const s = (await getContent()).servicePage(`/${service}/${topic}`);
  return s ? contentPageMeta(s.slug, s.title, s.description) : {};
}

export default async function Page({ params }: Props) {
  const { service, topic } = await params;
  const s = (await getContent()).servicePage(`/${service}/${topic}`);
  if (!s?.location) return redirectOrNotFound(`/${service}/${topic}`);
  return <ServicePage s={s} />;
}
