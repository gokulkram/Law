import type { Metadata } from "next";
import Analytics from "@/components/Analytics";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import A11yMenu from "@/components/A11yMenu";
import JsonLd from "@/components/JsonLd";
import { getContent } from "@/lib/content-store";
import { firmSchema } from "@/lib/schema";

// Site-wide settings from the admin panel (SEO): search-engine verification tags, and "discourage
// indexing" for staging sites. With no settings saved this adds nothing.
export async function generateMetadata(): Promise<Metadata> {
  const { siteSeo } = await getContent();
  const other: Record<string, string> = {};
  if (siteSeo.bingVerification) other["msvalidate.01"] = siteSeo.bingVerification;
  return {
    ...((siteSeo.googleVerification || siteSeo.bingVerification) && {
      verification: { ...(siteSeo.googleVerification && { google: siteSeo.googleVerification }), ...(siteSeo.bingVerification && { other }) },
    }),
    ...(siteSeo.discourageIndexing && { robots: { index: false, follow: false } }),
  };
}

// Shell for every public page. The admin panel (app/admin) sits outside this group so it gets
// no site header, footer or structured data.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const c = await getContent();
  return (
    <>
      <JsonLd data={firmSchema(c)} />
      <Header />
      {children}
      <Footer />
      <Reveal />
      <A11yMenu />
      <Analytics settings={c.siteSeo} />
    </>
  );
}
