import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "editor" | "reviewer";
export type Staff = { id: string; email: string; fullName: string | null; role: StaffRole };

export const ROLE_LABELS: Record<StaffRole, string> = { admin: "Admin", editor: "Editor", reviewer: "Attorney reviewer" };

// Data access layer for the admin panel. proxy.ts already sends signed-out visitors to the login
// page, but every admin page and Server Action checks again here - proxy alone is not a security boundary.

/** The signed-in staff member, or null (signed out, or signed in without a role). One lookup per request. */
export const getStaff = cache(async (): Promise<Staff | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("email, full_name, role").eq("id", user.id).single();
  if (!profile?.role) return null;
  return { id: user.id, email: profile.email, fullName: profile.full_name, role: profile.role };
});

/** For admin pages: the staff member, or a redirect to the login page. Pass roles to restrict further. */
export async function requireStaff(...roles: StaffRole[]): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login?error=access");
  if (roles.length && !roles.includes(staff.role)) redirect("/admin?error=forbidden");
  return staff;
}

/** For Server Actions: the staff member, or null if they may not perform the action. */
export async function staffFor(...roles: StaffRole[]): Promise<Staff | null> {
  const staff = await getStaff();
  return staff && (!roles.length || roles.includes(staff.role)) ? staff : null;
}
