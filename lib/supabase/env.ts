// Supabase project settings (Project Settings → API Keys). Set in .env.local and in Vercel.
//   NEXT_PUBLIC_SUPABASE_URL             https://<project-ref>.supabase.co
//   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY publishable key (sb_publishable_…) or legacy anon key
//   SUPABASE_SECRET_KEY                  secret key (sb_secret_…) or legacy service_role key - server only
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** Public URL prefix of files in the media library (Supabase Storage bucket "media"). */
export const MEDIA_PREFIX = SUPABASE_URL ? `${SUPABASE_URL}/storage/v1/object/public/media/` : "";

export function assertSupabaseEnv() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }
}
