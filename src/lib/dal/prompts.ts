import { prisma } from "@/lib/db";
import { cache } from "react";
import type { PlatformKey, Sentiment } from "@/lib/types";

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
  // Get latest completed scan for this brand
  const latestScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
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
      const comps = Array.isArray(r.competitors) ? (r.competitors as string[]) : [];
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
