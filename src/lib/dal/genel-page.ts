/**
 * Genel Bakış sayfası için tek DAL.
 *
 * Hero + 6 bölüm için gerekli tüm veriyi tek query setinde toplar.
 */

import { prisma } from "@/lib/db";
import { cache } from "react";
import type { AuditItemResult } from "@/lib/ai/audit-43";

export interface QueryWithResults {
  id: string;
  text: string;
  category: string | null;
  platforms: Array<{
    platform: string;
    model: string;
    createdAt: string;
    mentioned: boolean;
    position: string | null;
    competitors: string[];
    fullResponse: string;
    excerpt: string | null;
    mentionContext: string | null;
  }>;
  mentionedCount: number;
  totalPlatforms: number;
  hasAnyMention: boolean;
  hasNoResponse: boolean; // hiç platform cevap vermedi
}

export interface GenelPageData {
  // Hero
  score: number;
  brandName: string;
  overallMessage: string; // Opus tek cümle (personalAnalysis'ten ilk cümle)
  totalPlatforms: number;
  totalQueries: number;
  totalCities: number;
  mentionedCount: number; // sorgu sayısı (mentioned at least once)
  competitorAheadCount: number; // sorgu sayısı (competitor mentioned, user not)
  nobodyCount: number; // sorgu sayısı (kimse bahsedilmedi)

  // Section 1: Queries
  queries: QueryWithResults[];

  // Section 2: Rekabet Analizi (Opus text)
  personalAnalysis: string | null;
  competitorName: string | null;
  competitorScore: number | null;

  // Section 3: 43 item audit
  auditItems: AuditItemResult[];
  categoryScores: Record<string, number>;

  // Section 4: Aksiyon planı (en kritik 7-10 fail/partial item)
  topActions: AuditItemResult[];

  // Last update
  lastUpdate: string | null;

  // Free/Pro
  plan: string;
}

const PLATFORM_MODEL_MAP: Record<string, string> = {
  chatgpt: "gpt-4o-search",
  claude: "claude-3.5-sonnet",
  gemini: "gemini-1.5-flash",
  perplexity: "sonar",
  google_aio: "AI Overview (SerpAPI)",
};

export const getGenelPageData = cache(
  async (
    brandId: string,
    userId: string | null,
    plan: string,
    brandDomain: string,
    brandName: string,
  ): Promise<GenelPageData | null> => {
    // 1) En son scan + prompt results
    const latestScan = await prisma.scan.findFirst({
      where: { brandId, status: "completed" },
      orderBy: { completedAt: "desc" },
      select: { id: true, completedAt: true },
    });

    const prompts = await prisma.prompt.findMany({
      where: { brandId, isActive: true },
      include: {
        results: latestScan
          ? {
              where: { scanId: latestScan.id },
              orderBy: { createdAt: "desc" },
            }
          : false,
      },
      orderBy: { createdAt: "asc" },
    });

    // 2) GeoAudit — en son audit
    const latestAudit = userId
      ? await prisma.geoAudit.findFirst({
          where: {
            userId,
            OR: [
              { url: { contains: brandDomain, mode: "insensitive" } },
              { brandName: { equals: brandName, mode: "insensitive" } },
            ],
          },
          orderBy: { createdAt: "desc" },
        })
      : null;

    // 3) Queries shape
    const queries: QueryWithResults[] = prompts.map((p) => {
      const platforms = (p.results ?? []).map((r) => {
        const competitors = Array.isArray(r.competitors)
          ? (r.competitors as unknown[])
              .map((c) => {
                if (typeof c === "string") return c;
                if (c && typeof c === "object" && "name" in c) {
                  return String((c as { name: unknown }).name);
                }
                return "";
              })
              .filter(Boolean)
          : [];
        return {
          platform: r.platform,
          model: PLATFORM_MODEL_MAP[r.platform] ?? r.platform,
          createdAt: r.createdAt.toISOString(),
          mentioned: r.mentioned,
          position: r.position,
          competitors,
          fullResponse: r.fullResponse ?? "",
          excerpt: r.excerpt,
          mentionContext: r.mentionContext,
        };
      });

      const mentionedCount = platforms.filter((pl) => pl.mentioned).length;
      const hasAnyMention = mentionedCount > 0;
      const hasNoResponse =
        platforms.length === 0 ||
        platforms.every((pl) => !pl.fullResponse || pl.fullResponse.startsWith("[ERROR]"));

      return {
        id: p.id,
        text: p.text,
        category: p.category,
        platforms,
        mentionedCount,
        totalPlatforms: platforms.length,
        hasAnyMention,
        hasNoResponse,
      };
    });

    // 4) Hero metrics
    const mentionedCount = queries.filter((q) => q.hasAnyMention).length;
    const competitorAheadCount = queries.filter(
      (q) =>
        !q.hasAnyMention &&
        !q.hasNoResponse &&
        q.platforms.some((p) => p.competitors.length > 0),
    ).length;
    const nobodyCount = queries.filter(
      (q) =>
        !q.hasAnyMention &&
        !q.hasNoResponse &&
        q.platforms.every((p) => p.competitors.length === 0),
    ).length;

    // Cities — brand.serviceRegions sayısı
    const brandForRegions = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { serviceRegions: true },
    });
    const totalCities = (brandForRegions?.serviceRegions ?? []).length;

    // 5) Overall message — personalAnalysis ilk cümle, yoksa fallback
    const personalAnalysis = latestAudit?.personalAnalysis ?? null;
    const overallMessage = personalAnalysis
      ? personalAnalysis.split(/[.!?]/)[0].trim() + "."
      : `${brandName}, yapay zeka platformlarında görünürlüğünüz sınırlı.`;

    // 6) Score
    const score = latestAudit?.overallScore ?? 0;

    // 7) Audit items
    const auditItems =
      (latestAudit?.auditItems as unknown as AuditItemResult[] | null) ?? [];
    const categoryScores =
      (latestAudit?.categoryScores as unknown as Record<string, number> | null) ?? {};

    // 8) Top actions — fail ve partial item'lar, öncelik sırasına göre
    // (fail öncelik, sonra partial; kategori ağırlığına göre)
    const topActions = auditItems
      .filter((it) => it.status === "fail" || it.status === "partial")
      .sort((a, b) => {
        if (a.status === "fail" && b.status !== "fail") return -1;
        if (b.status === "fail" && a.status !== "fail") return 1;
        return 0;
      })
      .slice(0, 10);

    return {
      score,
      brandName,
      overallMessage,
      totalPlatforms: 5,
      totalQueries: queries.length,
      totalCities,
      mentionedCount,
      competitorAheadCount,
      nobodyCount,
      queries,
      personalAnalysis,
      competitorName: latestAudit?.competitorName ?? null,
      competitorScore: latestAudit?.competitorScore ?? null,
      auditItems,
      categoryScores,
      topActions,
      lastUpdate: latestScan?.completedAt?.toISOString() ?? latestAudit?.createdAt?.toISOString() ?? null,
      plan,
    };
  },
);
