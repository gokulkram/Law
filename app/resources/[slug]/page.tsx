import { notFound } from "next/navigation";
import ArticlePage from "@/components/ArticlePage";
import { ARTICLES, getArticle } from "@/content/articles";
import { pageMeta } from "@/lib/site";

// Guides, e.g. /resources/how-to-get-a-california-collision-report.
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug.split("/")[2] }));
}

export async function generateMetadata({ params }: Props) {
  const a = getArticle(`/resources/${(await params).slug}`);
  if (!a) return {};
  const meta = pageMeta(a.slug, a.title, a.description);
  return { ...meta, openGraph: { ...meta.openGraph, type: "article" as const, publishedTime: a.published, modifiedTime: a.updated } };
}

export default async function Page({ params }: Props) {
  const a = getArticle(`/resources/${(await params).slug}`);
  if (!a) notFound();
  return <ArticlePage a={a} />;
}
