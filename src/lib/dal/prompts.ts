import { prisma } from "@/lib/db";
import { cache } from "react";
import type { PlatformKey, Sentiment } from "@/lib/types";
import { extractCompetitorNames } from "@/lib/ai/types";

export interface PlatformResult {
  platform: PlatformKey;
  mentioned: boolean;
  position: string | null;
  sentiment: Sentiment | null;
  excerpt: string | null;
  fullResponse: string | null;
  citations: string[];
}

export interface PromptItemData {
  id: string;
  text: string;
  tags: string[];
  source: string;
  category: string | null;
  businessArea: string | null;
  searchIntent: string | null;
  salesPotential: string | null;
  visibility: number;
  position: string;
  sentiment: Sentiment;
  topCompetitor: string;
  modelResults: Record<PlatformKey, boolean>;
  platformResults: PlatformResult[];
  createdAt: string;
}

export const getPromptsData = cache(async (brandId: string) => {
  // En son scan'i al — running/failed olsa bile partial sonuçları gösterelim.
  // (Sadece "completed" filtrelemek, stuck/running scan'lerin 50-60 sonucunu
  // kullanıcıya gizler. Bkz. scan-diagnostic raporu.)
  const latestScan = await prisma.scan.findFirst({
    where: {
      brandId,
      status: { in: ["completed", "running", "failed"] },
    },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });

  const prompts = await prisma.prompt.findMany({
    where: { brandId, isActive: true },
    include: {
      results: latestScan
        ? {
            where: { scanId: latestScan.id },
            orderBy: { createdAt: "desc" },
          }
        : {
            orderBy: { createdAt: "desc" },
            take: 4,
          },
    },
    orderBy: { createdAt: "desc" },
  });

  const promptItems: PromptItemData[] = prompts.map((p) => {
    const modelResults: Record<PlatformKey, boolean> = {
      chatgpt: false,
      claude: false,
      gemini: false,
      perplexity: false,
      google_aio: false,
    };
    const platformResults: PlatformResult[] = [];
    let bestPosition = "—";
    let sentiment: Sentiment = "nötr";
    let mentionCount = 0;

    for (const r of p.results) {
      const plat = r.platform as PlatformKey;
      const result: PlatformResult = {
        platform: plat,
        mentioned: r.mentioned,
        position: r.position,
        sentiment: (r.sentiment as Sentiment) ?? null,
        excerpt: r.excerpt,
        fullResponse: r.fullResponse ?? null,
        citations: Array.isArray(r.citations) ? (r.citations as string[]) : [],
      };
      platformResults.push(result);

      if (r.mentioned) {
        modelResults[plat] = true;
        mentionCount++;
        if (r.position) bestPosition = r.position;
        if (r.sentiment) sentiment = r.sentiment as Sentiment;
      }
    }

    // Find top competitor for this prompt (from scan results)
    const allCompetitors: string[] = [];
    for (const r of p.results) {
      const comps = extractCompetitorNames(r.competitors);
      allCompetitors.push(...comps);
    }
    const compCounts: Record<string, number> = {};
    for (const c of allCompetitors) {
      compCounts[c] = (compCounts[c] ?? 0) + 1;
    }
    const sortedComps = Object.entries(compCounts).sort((a, b) => b[1] - a[1]);
    const topComp = sortedComps[0];
    const topCompetitor = topComp ? `${topComp[0]} (${topComp[1]}/4 platformda)` : "—";

    return {
      id: p.id,
      text: p.text,
      tags: p.tags,
      source: p.source,
      category: p.category,
      businessArea: p.businessArea ?? null,
      searchIntent: p.searchIntent ?? null,
      salesPotential: p.salesPotential ?? null,
      visibility: Math.round((mentionCount / 4) * 100),
      position: bestPosition,
      sentiment,
      topCompetitor,
      modelResults,
      platformResults,
      createdAt: p.createdAt.toISOString(),
    };
  });

  const suggested = await prisma.suggestedPrompt.findMany({
    where: { brandId },
    orderBy: { volume: "desc" },
  });

  const activeCount = prompts.length;
  const suggestedCount = suggested.length;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  for (const p of prompts) {
    const cat = p.category ?? "genel";
    categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + 1;
  }

  // Source breakdown
  const sourceBreakdown: Record<string, number> = {};
  for (const p of prompts) {
    sourceBreakdown[p.source] = (sourceBreakdown[p.source] ?? 0) + 1;
  }

  return {
    promptItems,
    suggested,
    activeCount,
    suggestedCount,
    categoryBreakdown,
    sourceBreakdown,
  };
});

export interface PromptDetailPlatformResult {
  platform: PlatformKey;
  mentioned: boolean;
  position: string | null;
  sentiment: Sentiment | null;
  excerpt: string | null;
  fullResponse: string | null;
  citations: string[];
  competitors: string[];
  mentionContext: string | null;
  responseQuality: string | null;
  retryAttempt: number;
}

export interface PromptDetailData {
  id: string;
  text: string;
  tags: string[];
  source: string;
  category: string | null;
  businessArea: string | null;
  searchIntent: string | null;
  salesPotential: string | null;
  lastScanAt: string | null;
  platformResults: PromptDetailPlatformResult[];
  history: {
    scanId: string;
    completedAt: string | null;
    mentionCount: number;
    position: string | null;
  }[];
}

export const getPromptDetail = cache(
  async (promptId: string, brandId: string): Promise<PromptDetailData | null> => {
    const prompt = await prisma.prompt.findFirst({
      where: { id: promptId, brandId },
      include: {
        results: {
          orderBy: { createdAt: "desc" },
          take: 50, // son 10 scan × 5 platform = 50
          include: {
            scan: { select: { id: true, completedAt: true } },
          },
        },
      },
    });

    if (!prompt) return null;

    // En son scan'in sonuçlarını al — platformResults için
    const latestScanId = prompt.results[0]?.scanId;
    const latestResults = latestScanId
      ? prompt.results.filter((r) => r.scanId === latestScanId)
      : [];

    const platformResults: PromptDetailPlatformResult[] = latestResults.map((r) => ({
      platform: r.platform as PlatformKey,
      mentioned: r.mentioned,
      position: r.position,
      sentiment: (r.sentiment as Sentiment) ?? null,
      excerpt: r.excerpt,
      fullResponse: r.fullResponse ?? null,
      citations: Array.isArray(r.citations) ? (r.citations as string[]) : [],
      competitors: extractCompetitorNames(r.competitors),
      mentionContext: r.mentionContext ?? null,
      responseQuality: (r as unknown as { responseQuality?: string | null }).responseQuality ?? null,
      retryAttempt: (r as unknown as { retryAttempt?: number }).retryAttempt ?? 0,
    }));

    // History — scan bazlı mention count
    const byScan = new Map<string, { completedAt: Date | null; mentions: number; position: string | null }>();
    for (const r of prompt.results) {
      const key = r.scanId;
      const prev = byScan.get(key) ?? {
        completedAt: r.scan?.completedAt ?? null,
        mentions: 0,
        position: null,
      };
      if (r.mentioned) prev.mentions += 1;
      if (r.position && !prev.position) prev.position = r.position;
      byScan.set(key, prev);
    }
    const history = Array.from(byScan.entries())
      .map(([scanId, v]) => ({
        scanId,
        completedAt: v.completedAt?.toISOString() ?? null,
        mentionCount: v.mentions,
        position: v.position,
      }))
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
      .slice(0, 10);

    return {
      id: prompt.id,
      text: prompt.text,
      tags: prompt.tags,
      source: prompt.source,
      category: prompt.category,
      businessArea: prompt.businessArea ?? null,
      searchIntent: prompt.searchIntent ?? null,
      salesPotential: prompt.salesPotential ?? null,
      lastScanAt: prompt.lastScanAt?.toISOString() ?? null,
      platformResults,
      history,
    };
  },
);
