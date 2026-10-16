import AttorneyPage from "@/components/AttorneyPage";
import { getContent } from "@/lib/content-store";
import { contentPageMeta, redirectOrNotFound } from "@/lib/site";

// Attorney bio pages, e.g. /attorneys/jane-doe.
// Paths come from the database. dynamicParams must stay true: with false, Next refuses to
// regenerate these pages after a content update (NoFallbackError). Unknown paths follow a redirect set in the admin panel, or 404.
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getContent()).attorneys.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const a = (await getContent()).attorney((await params).slug);
  return a ? contentPageMeta(`/attorneys/${a.slug}`, `${a.name}, ${a.title}`, `${a.name} is a ${a.title.toLowerCase()} at California Law, licensed by the State Bar of California since ${a.admitted}.`) : {};
}

export default async function Page({ params }: Props) {
  const a = (await getContent()).attorney((await params).slug);
  if (!a) return redirectOrNotFound(`/attorneys/${(await params).slug}`);
  return <AttorneyPage a={a} />;
}
