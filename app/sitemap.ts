import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content-store";
import { SITE_URL, absUrl } from "@/lib/site";

// Empty until NEXT_PUBLIC_SITE_URL is set - sitemap URLs must be absolute and on the real domain.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!SITE_URL) return [];
  const c = await getContent();
  if (c.siteSeo.discourageIndexing) return [];
  // Pages marked noindex or "leave out of sitemap" in the admin panel are skipped.
  return c.sitePages
    .filter((p) => !c.seo(p.path).noindex && !c.seo(p.path).sitemapExclude)
    .map((p) => ({
      url: absUrl(p.path)!,
      changeFrequency: p.group === "Legal" ? "yearly" : "monthly",
      priority: c.seo(p.path).sitemapPriority ?? (p.path === "/" ? 1 : p.group === "Legal" ? 0.3 : p.group === "Firm" ? 0.7 : 0.8),
    }));
}
