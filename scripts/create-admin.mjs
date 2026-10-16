// Creates the first admin account (or makes an existing account an admin) and prints a
// temporary password. Later users are added from the admin panel (/admin/users).
//
//   npm run admin:create -- you@example.com "Your Name"
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY from .env.local.
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const [email, fullName] = process.argv.slice(2);
if (!email) {
  console.error('Usage: npm run admin:create -- <email> ["Full Name"]');
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const password = randomBytes(12).toString("base64url");

const { data, error } = await supabase.auth.admin.createUser({
  email: email.toLowerCase(),
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName ?? null },
});

if (error && /already/i.test(error.message)) {
  const { error: upd } = await supabase.from("profiles").update({ role: "admin" }).eq("email", email.toLowerCase());
  if (upd) throw upd;
  console.log(`${email} already had an account - it is now an admin. Password unchanged.`);
} else if (error) {
  console.error(error.message);
  process.exit(1);
} else {
  const { error: roleError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
  if (roleError) throw roleError;
  console.log(`Admin created: ${data.user.email}\nTemporary password: ${password}\nSign in at /admin/login, then change it under My account.`);
}
