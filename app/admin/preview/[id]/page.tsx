import Link from "next/link";
import { notFound } from "next/navigation";
import ArticlePage from "@/components/ArticlePage";
import AttorneyPage from "@/components/AttorneyPage";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LocationPage from "@/components/LocationPage";
import Reveal from "@/components/Reveal";
import ServicePage from "@/components/ServicePage";
import AboutView from "@/components/static-pages/AboutView";
import ContactView from "@/components/static-pages/ContactView";
import HomeView from "@/components/static-pages/HomeView";
import { AttorneysView, PracticeAreasView, ResourcesView, SiteMapView } from "@/components/static-pages/HubViews";
import LegalView from "@/components/static-pages/LegalView";
import WrongfulDeathView from "@/components/static-pages/WrongfulDeathView";
import type * as T from "@/content/static-text";
import type { ArticleContent, Attorney, LocationContent, ServiceContent } from "@/content/types";
import { getContent } from "@/lib/content-store";
import { requireStaff } from "@/lib/admin/auth";
import { PAGE_COLUMNS, type PageRow } from "@/lib/admin/pages";
import { createClient } from "@/lib/supabase/server";

// Draft preview: the saved draft rendered with the real page template, header and footer.
// Outside the (panel) layout, so it checks access itself. Related cards and links use live content.
export const metadata = { title: "Preview", robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }> };

export default async function Preview({ params }: Props) {
  await requireStaff();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("pages").select(PAGE_COLUMNS).eq("id", id).maybeSingle();
  if (!data) notFound();
  const row = data as PageRow;

  // Same shape the live site builds; the review byline shows only if this draft is the reviewed text.
  const page = {
    ...row.content,
    ...(row.seo.title !== undefined && { title: row.seo.title }),
    ...(row.seo.description !== undefined && { description: row.seo.description }),
    ...(row.review_status === "reviewed" && row.reviewed_by && { reviewedBy: row.reviewed_by, reviewed: row.reviewed_at ?? undefined }),
  };

  let body: React.ReactNode;
  switch (row.type) {
    case "service":
    case "local":
      body = <ServicePage s={page as ServiceContent} seo={row.seo} />;
      break;
    case "location":
      body = <LocationPage l={page as LocationContent} seo={row.seo} />;
      break;
    case "article":
      body = <ArticlePage a={page as ArticleContent} seo={row.seo} />;
      break;
    case "attorney":
      body = <AttorneyPage a={page as Attorney} seo={row.seo} />;
      break;
    default:
      body = await staticPreview(row.path, row.content);
  }

  return (
    <>
      <div className="preview-bar" role="status">
        <span><strong>Draft preview</strong> - not live. {row.status === "published" ? "Publishing replaces the live page with this." : "This page isn’t published yet."}</span>
        <Link href={`/admin/pages/${row.id}`}>Back to editor</Link>
      </div>
      <Header />
      {body}
      <Footer />
      <Reveal />
    </>
  );
}

/** A main page rendered with its draft text. */
async function staticPreview(path: string, text: unknown): Promise<React.ReactNode> {
  switch (path) {
    case "/": return <HomeView t={text as T.HomeText} />;
    case "/about": return <AboutView t={text as T.AboutText} hasAttorneys={(await getContent()).attorneys.length > 0} />;
    case "/contact": return <ContactView t={text as T.ContactText} />;
    case "/privacy": return <LegalView t={text as T.LegalText} path="/privacy" crumb="Privacy Policy" contactSection />;
    case "/disclaimer": return <LegalView t={text as T.LegalText} path="/disclaimer" crumb="Disclaimer" />;
    case "/wrongful-death": return <WrongfulDeathView t={text as T.WrongfulDeathText} />;
    case "/practice-areas": return <PracticeAreasView t={text as T.PracticeAreasText} />;
    case "/resources": return <ResourcesView t={text as T.ResourcesText} />;
    case "/site-map": return <SiteMapView t={text as T.HeroOnlyText} />;
    case "/attorneys": return <AttorneysView t={text as T.AttorneysText} />;
    default: return <main className="section"><div className="container"><p>This page has no preview.</p></div></main>;
  }
}
