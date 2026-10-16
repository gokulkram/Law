import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content-store";
import { SITE_URL } from "@/lib/site";

// Site-wide rules from the admin panel (SEO): extra Disallow paths, and "discourage indexing", which
// blocks the whole site for staging / pre-launch.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { siteSeo } = await getContent();
  if (siteSeo.discourageIndexing) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", ...(siteSeo.robotsDisallow ?? [])] },
    sitemap: SITE_URL ? `${SITE_URL}/sitemap.xml` : undefined,
  };
}
