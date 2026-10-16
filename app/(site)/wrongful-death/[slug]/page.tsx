import ServicePage from "@/components/ServicePage";
import { getContent } from "@/lib/content-store";
import { contentPageMeta, redirectOrNotFound } from "@/lib/site";

// Wrongful-death sub-pages, e.g. /wrongful-death/car-accident.
// Paths come from the database. dynamicParams must stay true: with false, Next refuses to
// regenerate these pages after a content update (NoFallbackError). Unknown paths follow a redirect set in the admin panel, or 404.
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getContent()).services.filter((s) => s.slug.startsWith("/wrongful-death/")).map((s) => ({ slug: s.slug.split("/")[2] }));
}

export async function generateMetadata({ params }: Props) {
  const s = (await getContent()).service(`/wrongful-death/${(await params).slug}`);
  return s ? contentPageMeta(s.slug, s.title, s.description) : {};
}

export default async function Page({ params }: Props) {
  const s = (await getContent()).service(`/wrongful-death/${(await params).slug}`);
  if (!s) return redirectOrNotFound(`/wrongful-death/${(await params).slug}`);
  return <ServicePage s={s} />;
}
