// Everything in lib/firm.ts plus metadata for the hand-built pages, whose SEO title and description
// live in the database. Server components, routes and metadata import from here. Client components
// import lib/firm.ts - this file loads the site content.
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { getContent } from "@/lib/content-store";
import { pageMeta } from "@/lib/firm";

export * from "@/lib/firm";

/** Metadata for a hand-built page (home, about, ...) from its database row. */
export async function staticPageMeta(path: string) {
  const c = await getContent();
  const p = c.staticPage(path);
  const meta = pageMeta(path, p.title, p.description, c.seo(path));
  return p.titleAbsolute ? { ...meta, title: { absolute: p.title } } : meta;
}

/** Metadata for a content page, including the SEO overrides set in the admin panel. */
export async function contentPageMeta(path: string, title: string, description: string) {
  return pageMeta(path, title, description, (await getContent()).seo(path));
}

/**
 * For a URL with no live page: follow its redirect from the admin panel, or show the 404 page.
 * Routes call this only after looking for a page, so a live page always wins over a redirect.
 * Redirects from a render are 308 (permanent) / 307 (temporary) - search engines treat them as 301/302.
 */
export async function redirectOrNotFound(path: string): Promise<never> {
  const r = (await getContent()).redirectFor(path);
  if (r) {
    if (r.permanent) permanentRedirect(r.destination);
    redirect(r.destination);
  }
  notFound();
}
