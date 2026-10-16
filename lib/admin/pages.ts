import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Json, PageType, Seo } from "@/lib/admin/page-model";
import type { ValidationContext } from "@/lib/admin/validate";
import { createClient } from "@/lib/supabase/server";

// Server-side data for the page editor. Reads go through the signed-in user's client (RLS applies).

export type PageRow = {
  id: string;
  path: string;
  type: PageType;
  status: "draft" | "published" | "archived";
  content: Json;
  seo: Seo;
  published_content: Json | null;
  published_seo: Seo | null;
  published_at: string | null;
  review_status: "not_reviewed" | "needs_review" | "reviewed";
  reviewed_by: string | null;
  reviewed_at: string | null;
  published_is_reviewed: boolean;
  sort_order: number;
  updated_at: string;
  updated_by: string | null;
};

export const PAGE_COLUMNS =
  "id, path, type, status, content, seo, published_content, published_seo, published_at, review_status, reviewed_by, reviewed_at, published_is_reviewed, sort_order, updated_at, updated_by";

/** Section numbers on the verified fact sheet. null if the file can't be read (the § check then fails closed). */
export async function allowedSections(): Promise<string[] | null> {
  try {
    const facts = await readFile(join(process.cwd(), "content", "FACTS.md"), "utf8");
    return [...new Set([...facts.matchAll(/§\s?(\d+(?:\.\d+)?)/g)].map((m) => m[1]))];
  } catch {
    return null;
  }
}

type Lite = { id: string; path: string; type: PageType; status: string; content: Json; seo: Seo; published_content: Json | null };

/** Every page, lightly: for validation, pickers and "what links here". */
export async function allPagesLite(): Promise<Lite[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("pages").select("id, path, type, status, content, seo, published_content").order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Lite[];
}

export async function validationContext(pages: Lite[]): Promise<ValidationContext> {
  const live = (p: Lite) => p.status === "published" && p.published_content;
  return {
    knownPaths: pages.map((p) => p.path),
    publishedPaths: pages.filter(live).map((p) => p.path),
    servicePaths: pages.filter((p) => p.type === "service").map((p) => p.path),
    allowedSections: await allowedSections(),
    others: pages.map((p) => ({ path: p.path, title: p.seo.title, description: p.seo.description, h1: (p.content as { h1?: string }).h1 })),
  };
}

/** Name to show for a page in lists and pickers. */
export const pageName = (p: { path: string; content: Json; seo?: Seo }) => String((p.content as { name?: string }).name || p.seo?.title || p.path);
