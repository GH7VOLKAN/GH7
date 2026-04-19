/**
 * /api/panel/scan-diagnostic
 *
 * Authenticated kullanıcı kendi brand'i için AI provider sağlığını görür.
 * Admin check yok — sadece oturum açmış olmak yeterli.
 *
 * Dönen JSON:
 *  - ENV VAR durumu (present/length, key'in kendisi GÖSTERİLMEZ)
 *  - 5 AI provider'a canlı ping (30s timeout)
 *  - Kullanıcının tek brand'inin son 10 scan'ı
 *  - Prompt + PromptResult sayıları
 *  - summary.likelyIssue → tek cümle kök neden teşhisi
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveBrand } from "@/lib/dal/brand";
import { getAllProviderInstances } from "@/lib/ai/provider-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface EnvCheck {
  name: string;
  present: boolean;
  length: number;
}

interface ProviderCheck {
  platform: string;
  available: boolean;
  pingOk: boolean;
  pingMs: number | null;
  pingError: string | null;
}

export async function GET() {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json(
        {
          error:
            "Oturum veya marka yok. Önce /giris üzerinden giriş yapın ya da /analiz yapın.",
        },
        { status: 401 },
      );
    }

    const brand = activeBrand.brand;

    // 1. ENV VAR check (değerler gösterilmez, sadece present+length)
    const envVars: EnvCheck[] = [
      "OPENAI_API_KEY",
      "GH7_ANTHROPIC_API_KEY",
      "ANTHROPIC_API_KEY",
      "GOOGLE_AI_API_KEY",
      "PERPLEXITY_API_KEY",
      "SERPAPI_KEY",
      "DATAFORSEO_LOGIN",
      "DATAFORSEO_PASSWORD",
      "DATABASE_URL",
      "UPSTASH_REDIS_REST_URL",
      "RESEND_API_KEY",
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ].map((name) => {
      const v = process.env[name];
      return {
        name,
        present: !!v && v.length > 0,
        length: v?.length ?? 0,
      };
    });

    // 2. 5 AI provider'a canlı ping
    const providers = getAllProviderInstances();
    const providerChecks: ProviderCheck[] = await Promise.all(
      providers.map(async (p) => {
        const available = p.isAvailable();
        if (!available) {
          return {
            platform: p.platform,
            available: false,
            pingOk: false,
            pingMs: null,
            pingError: "API key yok (env var missing)",
          };
        }
        const start = Date.now();
        try {
          const result = await Promise.race([
            p.sendPrompt("Türkiye'nin başkenti nedir? Tek kelime."),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Timeout 30s")), 30000),
            ),
          ]);
          const ms = Date.now() - start;
          if (result.error) {
            return {
              platform: p.platform,
              available: true,
              pingOk: false,
              pingMs: ms,
              pingError: result.error.slice(0, 300),
            };
          }
          return {
            platform: p.platform,
            available: true,
            pingOk: !!result.content && result.content.length > 0,
            pingMs: ms,
            pingError: null,
          };
        } catch (err) {
          return {
            platform: p.platform,
            available: true,
            pingOk: false,
            pingMs: Date.now() - start,
            pingError: err instanceof Error ? err.message : String(err),
          };
        }
      }),
    );

    // 3. Kullanıcının brand'inin son 10 scan'i
    const recentScans = await prisma.scan.findMany({
      where: { brandId: brand.id },
      orderBy: { startedAt: "desc" },
      take: 10,
      include: {
        _count: { select: { results: true } },
      },
    });

    const promptCount = await prisma.prompt.count({
      where: { brandId: brand.id },
    });

    const promptResultCount = await prisma.promptResult.count({
      where: { scan: { brandId: brand.id } },
    });

    // 4. Teşhis özeti
    const availableCount = providerChecks.filter((p) => p.available).length;
    const pingingCount = providerChecks.filter((p) => p.pingOk).length;
    let likelyIssue: string;

    if (availableCount === 0) {
      likelyIssue =
        "🔴 KRİTİK: Hiçbir AI provider aktif değil. Vercel env vars'da API key'ler eksik veya yanlış.";
    } else if (pingingCount === 0) {
      likelyIssue =
        "🔴 KRİTİK: Hiçbir provider ping'e cevap vermedi. Key'ler var ama geçersiz ya da API sağlayıcı kapalı.";
    } else if (pingingCount < availableCount) {
      likelyIssue = `🟡 KISMEN ÇALIŞIYOR: ${pingingCount}/${availableCount} provider OK. Ping geçemeyen provider'lara bakın.`;
    } else if (promptCount === 0) {
      likelyIssue =
        "🟡 Hiç Prompt yok. /analiz yapıldı mı? Discovery aşamasında hata olmuş olabilir.";
    } else if (promptResultCount === 0) {
      likelyIssue =
        "🟡 Prompt var ama PromptResult BOŞ. Scan tetiklenmemiş veya executeScan silent fail. Vercel function logs'ta '[api/run-audit-43]' satırlarına bakın.";
    } else {
      likelyIssue = "✅ Veri akışı sağlıklı görünüyor.";
    }

    return NextResponse.json({
      summary: {
        envVarsOk: envVars.filter((e) => e.present).length,
        envVarsTotal: envVars.length,
        providersAvailable: availableCount,
        providersPinging: pingingCount,
        promptCount,
        promptResultCount,
        recentScanCount: recentScans.length,
        likelyIssue,
      },
      brand: {
        id: brand.id,
        name: brand.name,
        domain: brand.domain,
      },
      envVars,
      providers: providerChecks,
      recentScans: recentScans.map((s) => ({
        id: s.id,
        status: s.status,
        type: s.type,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        resultCount: s._count.results,
        durationMs:
          s.completedAt && s.startedAt
            ? s.completedAt.getTime() - s.startedAt.getTime()
            : null,
      })),
      counts: {
        prompts: promptCount,
        promptResults: promptResultCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[panel/scan-diagnostic] Error:", err);
    return NextResponse.json(
      {
        error: "Diagnostic failed",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
