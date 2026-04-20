/**
 * GET /api/admin/actions/ping-providers
 *
 * Her AI provider için canlı ping. Admin panelinde API Durumu bölümü.
 * Admin-only.
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getAllProviderInstances } from "@/lib/ai/provider-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const providers = getAllProviderInstances();
  const results = await Promise.all(
    providers.map(async (p) => {
      const available = p.isAvailable();
      if (!available) {
        return {
          platform: p.platform,
          available: false,
          ok: false,
          error: "API key yok",
        };
      }
      const start = Date.now();
      try {
        const result = await Promise.race([
          p.sendPrompt("Türkiye'nin başkenti? Tek kelime."),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout 30s")), 30000),
          ),
        ]);
        const ms = Date.now() - start;
        if (result.error) {
          return {
            platform: p.platform,
            available: true,
            ok: false,
            ms,
            error: result.error.slice(0, 200),
          };
        }
        return {
          platform: p.platform,
          available: true,
          ok: !!result.content && result.content.length > 0,
          ms,
          error: null,
        };
      } catch (err) {
        return {
          platform: p.platform,
          available: true,
          ok: false,
          ms: Date.now() - start,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );

  return NextResponse.json({ providers: results });
}
