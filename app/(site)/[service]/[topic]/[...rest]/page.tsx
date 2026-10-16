import { redirectOrNotFound } from "@/lib/site";

// No pages live three or more levels deep; this route exists so old deep URLs can be redirected
// from the admin panel (otherwise they 404).
type Props = { params: Promise<{ service: string; topic: string; rest: string[] }> };

export default async function Page({ params }: Props) {
  const { service, topic, rest } = await params;
  return redirectOrNotFound(`/${[service, topic, ...rest].join("/")}`);
}
