import ArticlePage from "@/components/ArticlePage";
import { getContent } from "@/lib/content-store";
import { contentPageMeta, redirectOrNotFound } from "@/lib/site";

// Guides, e.g. /resources/how-to-get-a-california-collision-report.
// Paths come from the database. dynamicParams must stay true: with false, Next refuses to
// regenerate these pages after a content update (NoFallbackError). Unknown paths follow a redirect set in the admin panel, or 404.
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getContent()).articles.map((a) => ({ slug: a.slug.split("/")[2] }));
}

export async function generateMetadata({ params }: Props) {
  const a = (await getContent()).article(`/resources/${(await params).slug}`);
  if (!a) return {};
  const meta = await contentPageMeta(a.slug, a.title, a.description);
  return { ...meta, openGraph: { ...meta.openGraph, type: "article" as const, publishedTime: a.published, modifiedTime: a.updated } };
}

export default async function Page({ params }: Props) {
  const a = (await getContent()).article(`/resources/${(await params).slug}`);
  if (!a) return redirectOrNotFound(`/resources/${(await params).slug}`);
  return <ArticlePage a={a} />;
}
