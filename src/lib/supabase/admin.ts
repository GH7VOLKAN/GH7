import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for BACKGROUND JOBS only (no user session).
 * Bypasses RLS. SERVER-ONLY — never import into a client component.
 * Used by the Inngest order-run function to read orders and write reports.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
