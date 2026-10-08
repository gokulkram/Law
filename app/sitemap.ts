import type { MetadataRoute } from "next";
import { PAGES, SITE_URL, absUrl } from "@/lib/site";

// Empty until NEXT_PUBLIC_SITE_URL is set - sitemap URLs must be absolute and on the real domain.
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return [];
  return PAGES.map((p) => ({
    url: absUrl(p.path)!,
    changeFrequency: p.group === "Legal" ? "yearly" : "monthly",
    priority: p.path === "/" ? 1 : p.group === "Legal" ? 0.3 : p.group === "Firm" ? 0.7 : 0.8,
  }));
}
