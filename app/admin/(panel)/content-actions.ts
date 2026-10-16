"use server";

import { updateTag } from "next/cache";
import { staffFor } from "@/lib/admin/auth";
import { CONTENT_TAG } from "@/lib/content-store";

export type RefreshState = { error?: string; message?: string } | undefined;

// Drops the cached site content so every public page re-reads the database on its next visit.
// Saving in the editor does this automatically (Phase 3); this button covers changes made outside the
// panel, e.g. `npm run content:import`.
export async function refreshSiteContent(): Promise<RefreshState> {
  if (!(await staffFor("admin", "editor"))) return { error: "Only admins and editors can refresh the site." };
  updateTag(CONTENT_TAG);
  return { message: "Done - pages will show the latest published content on their next visit." };
}
