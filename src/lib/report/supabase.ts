import { createClient } from "@supabase/supabase-js";

/**
 * Read-only Supabase client for the operator product (new project).
 * Uses the publishable (anon) key. The only data path it touches is the
 * `get_report` RPC, which returns a single report by its exact token —
 * RLS stays deny-all on the tables themselves.
 */
export function reportClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY missing");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
