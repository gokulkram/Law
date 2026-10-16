"use server";

import { revalidatePath } from "next/cache";
import { staffFor, type StaffRole } from "@/lib/admin/auth";
import { tempPassword } from "@/lib/admin/password";
import { createAdminClient } from "@/lib/supabase/admin";

// User management - admins only. Uses the secret key (auth admin API), so every action
// re-checks the caller's role first.

export type UserActionState = { error?: string; message?: string; password?: string } | undefined;

const ROLES: StaffRole[] = ["admin", "editor", "reviewer"];
const parseRole = (v: FormDataEntryValue | null) => (ROLES.includes(v as StaffRole) ? (v as StaffRole) : null);
const DENIED = { error: "Only admins can manage users." };

export async function createUser(_prev: UserActionState, form: FormData): Promise<UserActionState> {
  if (!(await staffFor("admin"))) return DENIED;
  const email = String(form.get("email") || "").trim().toLowerCase();
  const fullName = String(form.get("full_name") || "").trim();
  const role = parseRole(form.get("role"));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (!role) return { error: "Choose a role." };

  const password = tempPassword();
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || null },
  });
  if (error) return { error: /already/i.test(error.message) ? "An account with that email already exists." : error.message };
  // The on_auth_user_created trigger made the profile row; the role is set here, never by the user.
  const { error: roleError } = await admin.from("profiles").update({ role, full_name: fullName || null }).eq("id", data.user.id);
  if (roleError) return { error: `Account created, but setting the role failed: ${roleError.message}` };
  revalidatePath("/admin/users");
  return { message: `Account created for ${email}. Send them this temporary password - they can change it under My account.`, password };
}

export async function updateRole(_prev: UserActionState, form: FormData): Promise<UserActionState> {
  const me = await staffFor("admin");
  if (!me) return DENIED;
  const id = String(form.get("id") || "");
  if (id === me.id) return { error: "You can’t change your own role." };
  const role = parseRole(form.get("role")); // null = remove access
  const { error } = await createAdminClient().from("profiles").update({ role }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { message: role ? "Role updated." : "Admin access removed." };
}

export async function resetPassword(_prev: UserActionState, form: FormData): Promise<UserActionState> {
  if (!(await staffFor("admin"))) return DENIED;
  const id = String(form.get("id") || "");
  const password = tempPassword();
  const { error } = await createAdminClient().auth.admin.updateUserById(id, { password });
  if (error) return { error: error.message };
  return { message: "Password reset. Send them this temporary password:", password };
}

export async function deleteUser(_prev: UserActionState, form: FormData): Promise<UserActionState> {
  const me = await staffFor("admin");
  if (!me) return DENIED;
  const id = String(form.get("id") || "");
  if (id === me.id) return { error: "You can’t delete your own account." };
  const { error } = await createAdminClient().auth.admin.deleteUser(id);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { message: "Account deleted." };
}

/** Link a reviewer account to the attorney they are (used to credit review sign-offs). */
export async function setAttorney(_prev: UserActionState, form: FormData): Promise<UserActionState> {
  if (!(await staffFor("admin"))) return DENIED;
  const id = String(form.get("id") || "");
  const slug = String(form.get("attorney_slug") || "").trim() || null;
  const admin = createAdminClient();
  if (slug) {
    const { data: page } = await admin.from("pages").select("path").eq("path", `/attorneys/${slug}`).maybeSingle();
    if (!page) return { error: "That attorney has no profile page." };
  }
  const { error } = await admin.from("profiles").update({ attorney_slug: slug }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { message: slug ? "Linked to the attorney profile." : "Attorney link removed." };
}
