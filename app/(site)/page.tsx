import { preload } from "react-dom";
import HomeView from "@/components/static-pages/HomeView";
import type { HomeText } from "@/content/static-text";
import { getContent } from "@/lib/content-store";
import { staticPageMeta } from "@/lib/site";

export const generateMetadata = () => staticPageMeta("/");

export default async function Home() {
  // The hero banner is a CSS background, so the browser finds it late - fetch it up front.
  preload("/images/banner-collage.webp", { as: "image", fetchPriority: "high" });
  return <HomeView t={(await getContent()).staticText<HomeText>("/")} />;
}
