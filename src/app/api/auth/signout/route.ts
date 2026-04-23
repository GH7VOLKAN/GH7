/**
 * POST /api/auth/signout
 *
 * Supabase session'ı sonlandırır, kullanıcıyı ana sayfaya yönlendirir.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    new URL(request.url).origin;

  return NextResponse.redirect(new URL("/", appUrl), {
    status: 303,
  });
}
