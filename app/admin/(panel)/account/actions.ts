"use server";

import { revalidatePath } from "next/cache";
import { staffFor } from "@/lib/admin/auth";
import { MIN_PASSWORD } from "@/lib/admin/password-rules";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AccountState = { error?: string; message?: string } | undefined;

export async function updateName(_prev: AccountState, form: FormData): Promise<AccountState> {
  const me = await staffFor();
  if (!me) return { error: "Please sign in again." };
  const fullName = String(form.get("full_name") || "").trim().slice(0, 120);
  // profiles has no update policy (roles must not be self-editable), so write just this column server-side.
  const { error } = await createAdminClient().from("profiles").update({ full_name: fullName || null }).eq("id", me.id);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { message: "Name saved." };
}

export async function changePassword(_prev: AccountState, form: FormData): Promise<AccountState> {
  const me = await staffFor();
  if (!me) return { error: "Please sign in again." };
  const current = String(form.get("current") || "");
  const next = String(form.get("password") || "");
  if (next.length < MIN_PASSWORD) return { error: `Use at least ${MIN_PASSWORD} characters.` };
  if (next !== String(form.get("confirm") || "")) return { error: "The new passwords don’t match." };

  const supabase = await createClient();
  const { error: wrong } = await supabase.auth.signInWithPassword({ email: me.email, password: current });
  if (wrong) return { error: "Your current password is incorrect." };
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: error.message };
  return { message: "Password changed." };
}
