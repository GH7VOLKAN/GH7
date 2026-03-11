import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase URL ve Anon Key gerekli. .env.local dosyasını kontrol edin."
    );
  }

  return createBrowserClient(url, key);
}
