/**
 * GET /api/auth/state
 *
 * Client-side'dan çağrılan tek merkezi auth state endpoint'i.
 * /analiz mount, /giris redirect check, herhangi bir component bunu kullanır.
 */

import { NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getAuthState();
  return NextResponse.json(state);
}
