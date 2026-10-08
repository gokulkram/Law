import { notFound } from "next/navigation";
import ServicePage from "@/components/ServicePage";
import { SERVICE_PAGES, getService } from "@/content/services";
import { pageMeta } from "@/lib/site";

// Wrongful-death sub-pages, e.g. /wrongful-death/car-accident.
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICE_PAGES.filter((s) => s.slug.startsWith("/wrongful-death/")).map((s) => ({ slug: s.slug.split("/")[2] }));
}

export async function generateMetadata({ params }: Props) {
  const s = getService(`/wrongful-death/${(await params).slug}`);
  return s ? pageMeta(s.slug, s.title, s.description) : {};
}

export default async function Page({ params }: Props) {
  const s = getService(`/wrongful-death/${(await params).slug}`);
  if (!s) notFound();
  return <ServicePage s={s} />;
}
