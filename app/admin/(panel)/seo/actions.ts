"use server";

import { updateTag } from "next/cache";
import { staffFor } from "@/lib/admin/auth";
import { siteSeoErrors, type SiteSeo } from "@/lib/admin/settings-model";
import { CONTENT_TAG } from "@/lib/content-store";
import { createClient } from "@/lib/supabase/server";

// `values` = what was submitted, sent back on an error so the form can show it again (React resets
// forms after an action).
export type SettingsState = { error?: string; message?: string; values?: Record<string, string> } | undefined;

const text = (form: FormData, k: string) => String(form.get(k) || "").trim() || undefined;

/** Site-wide SEO settings - admins only (RLS: settings are admin-write). */
export async function saveSiteSeo(_prev: SettingsState, form: FormData): Promise<SettingsState> {
  const me = await staffFor("admin");
  if (!me) return { error: "Only admins can change site-wide SEO settings." };
  const supabase = await createClient();
  const { data: current } = await supabase.from("site_settings").select("value").eq("key", "seo").maybeSingle();
  const prev = (current?.value ?? {}) as SiteSeo;

  const next: SiteSeo = JSON.parse(JSON.stringify({
    googleVerification: text(form, "googleVerification"),
    bingVerification: text(form, "bingVerification"),
    ga4Id: text(form, "ga4Id")?.toUpperCase(),
    gtmId: text(form, "gtmId")?.toUpperCase(),
    robotsDisallow: String(form.get("robotsDisallow") || "").split("\n").map((l) => l.trim()).filter(Boolean),
    // The indexing switch has its own action with a confirmation step.
    discourageIndexing: prev.discourageIndexing || undefined,
  }));
  if (!next.robotsDisallow?.length) delete next.robotsDisallow;
  const errors = siteSeoErrors(next);
  if (errors.length) {
    const values = Object.fromEntries(["googleVerification", "bingVerification", "ga4Id", "gtmId", "robotsDisallow"].map((k) => [k, String(form.get(k) ?? "")]));
    return { error: errors.join(" "), values };
  }

  const { error } = await supabase.from("site_settings").upsert({ key: "seo", value: next, updated_by: me.id });
  if (error) return { error: error.message };
  updateTag(CONTENT_TAG);
  return { message: "Saved - the website uses the new settings on its next page view." };
}

/** Turns "discourage search engines" on or off. On = robots.txt blocks everything + noindex everywhere. */
export async function setDiscourageIndexing(on: boolean): Promise<SettingsState> {
  const me = await staffFor("admin");
  if (!me) return { error: "Only admins can change this." };
  const supabase = await createClient();
  const { data: current } = await supabase.from("site_settings").select("value").eq("key", "seo").maybeSingle();
  const value = { ...((current?.value ?? {}) as SiteSeo) };
  if (on) value.discourageIndexing = true;
  else delete value.discourageIndexing;
  const { error } = await supabase.from("site_settings").upsert({ key: "seo", value, updated_by: me.id });
  if (error) return { error: error.message };
  updateTag(CONTENT_TAG);
  return { message: on ? "Search engines are now asked not to index the site." : "Search engines may index the site again." };
}
