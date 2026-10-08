import type { NextConfig } from "next";

const OLD_PAGES = ["about", "contact", "practice-areas", "wrongful-death", "thank-you"];

const nextConfig: NextConfig = {
  // Keep links to the old static-site URLs (/about.html etc.) working.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      ...OLD_PAGES.map((p) => ({ source: `/${p}.html`, destination: `/${p}`, permanent: true })),
    ];
  },
};

export default nextConfig;
