/**
 * GET /api/debug/providers
 *
 * /admin/health sayfası için — 5 AI provider'ın env var + canlı ping durumu.
 * Admin-only (getAdminUser guard).
 *
 * Response shape (admin/health/page.tsx UI'ına uygun):
 * {
 *   status: "ALL_OK" | "PARTIAL" | "FAILED",
 *   envVars: { OPENAI_API_KEY: boolean, ... },
 *   liveTests: {
 *     chatgpt: { ok, chars, error?, ms },
 *     claude: ...
 *   },
 *   timestamp: ISO
 * }
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

  // ENV VAR durumu
  const envVars: Record<string, boolean> = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: !!(
      process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY
    ),
    GOOGLE_AI_API_KEY: !!process.env.GOOGLE_AI_API_KEY,
    PERPLEXITY_API_KEY: !!process.env.PERPLEXITY_API_KEY,
    SERPAPI_KEY: !!process.env.SERPAPI_KEY,
    DATAFORSEO_LOGIN: !!process.env.DATAFORSEO_LOGIN,
    DATAFORSEO_PASSWORD: !!process.env.DATAFORSEO_PASSWORD,
  };

  // 5 provider canlı ping (30s timeout her biri)
  const providers = getAllProviderInstances();
  const liveTests: Record<
    string,
    { ok: boolean; chars?: number; error?: string; ms: number }
  > = {};

  await Promise.all(
    providers.map(async (p) => {
      const available = p.isAvailable();
      if (!available) {
        liveTests[p.platform] = {
          ok: false,
          error: "API key yok",
          ms: 0,
        };
        return;
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
          liveTests[p.platform] = {
            ok: false,
            error: result.error.slice(0, 200),
            ms,
          };
        } else {
          liveTests[p.platform] = {
            ok: !!result.content && result.content.length > 0,
            chars: result.content?.length ?? 0,
            ms,
          };
        }
      } catch (err) {
        liveTests[p.platform] = {
          ok: false,
          error: err instanceof Error ? err.message : String(err),
          ms: Date.now() - start,
        };
      }
    }),
  );

  const okCount = Object.values(liveTests).filter((t) => t.ok).length;
  const totalCount = Object.keys(liveTests).length;
  const status =
    okCount === totalCount
      ? "ALL_OK"
      : okCount === 0
        ? "FAILED"
        : "PARTIAL";

  return NextResponse.json({
    status,
    envVars,
    liveTests,
    timestamp: new Date().toISOString(),
  });
}
