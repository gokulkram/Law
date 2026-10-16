"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; email?: string } | undefined;

// Only paths inside the admin panel - never redirect to another site.
const safeNext = (next: unknown) => (typeof next === "string" && /^\/admin(\/|$|\?)/.test(next) && !next.startsWith("//") ? next : "/admin");

export async function signIn(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password.", email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "That email and password don’t match an admin account.", email };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  if (!profile?.role) {
    await supabase.auth.signOut();
    return { error: "This account doesn’t have admin access. Ask an administrator to give you a role.", email };
  }
  redirect(safeNext(form.get("next")));
}
