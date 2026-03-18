import { prisma } from "@/lib/db";
import { cache } from "react";
import type { PlatformKey } from "@/lib/types";

// Turkish character normalization — consistent with analyzer.ts
function normalizeTurkish(text: string): string {
  return text
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "s")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "U")
    .replace(/ü/g, "u")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c")
    .toLowerCase();
}

export interface CompetitorRowData {
  id: string;
  name: string;
  domain: string;
  isUser: boolean;
  mentionScore: number;
  readinessScore: number;
  platforms: Record<PlatformKey, number>;
  // AI discovery metadata
  reason: string | null;
  products: string[];
  relevance: string;
  source: string;
}

export interface CompetitorDetailData {
  name: string;
  mentionScore: number;
  userMentionScore: number;
  readinessGaps: string[];
  topSourcePages: { path: string; promptCount: number }[];
}

// Deep detail for competitor dialog
export interface CompetitorPromptAppearance {
  promptText: string;
  platform: string;
  excerpt: string;
  userMentionedToo: boolean;
}

export interface EmptyAreaOpportunity {
  promptText: string;
  platforms: string[];
  topMention: string | null;
}

export interface CompetitorDeepDetail {
  promptAppearances: CompetitorPromptAppearance[];
  sharedSources: string[];
  competitorOnlySources: string[];
}

export const getCompetitorsData = cache(async (brandId: string) => {
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  const competitors = await prisma.competitor.findMany({
    where: { brandId },
    orderBy: { mentionScore: "desc" },
  });

  // Latest scores for the user brand
  const latestScore = await prisma.scoreHistory.findFirst({
    where: { brandId },
    orderBy: { date: "desc" },
  });

  const userMentionScore = latestScore?.mentionScore ?? 0;
  const userReadinessScore = latestScore?.readinessScore ?? 0;

  // Compute user's per-platform scores from latest completed scan
  const latestScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
  });

  const userPlatforms: Record<PlatformKey, number> = { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0, google_aio: 0 };

  // Fetch scan results once and reuse for user platforms, competitor scores, and SoV
  const scanResults = latestScan
    ? await prisma.promptResult.findMany({
        where: { scanId: latestScan.id },
      })
    : [];

  if (latestScan) {
    const platCounts: Record<string, { mentioned: number; total: number }> = {
      chatgpt: { mentioned: 0, total: 0 },
      claude: { mentioned: 0, total: 0 },
      gemini: { mentioned: 0, total: 0 },
      perplexity: { mentioned: 0, total: 0 },
    };

    for (const r of scanResults) {
      if (!platCounts[r.platform]) continue;
      platCounts[r.platform].total++;
      if (r.mentioned) platCounts[r.platform].mentioned++;
    }

    for (const [plat, counts] of Object.entries(platCounts)) {
      userPlatforms[plat as PlatformKey] =
        counts.total > 0 ? Math.round((counts.mentioned / counts.total) * 100) : 0;
    }
  }

  // Compute competitor platform scores from scan data
  const competitorPlatformScores = new Map<string, Record<PlatformKey, number>>();
  const competitorMentionScores = new Map<string, number>();

  if (latestScan) {
    for (const comp of competitors) {
      const nameNorm = normalizeTurkish(comp.name);
      const platCounts: Record<string, { mentioned: number; total: number }> = {
        chatgpt: { mentioned: 0, total: 0 },
        claude: { mentioned: 0, total: 0 },
        gemini: { mentioned: 0, total: 0 },
        perplexity: { mentioned: 0, total: 0 },
      };
      let totalMentioned = 0;
      let totalChecked = 0;

      for (const r of scanResults) {
        if (!platCounts[r.platform]) continue;
        platCounts[r.platform].total++;
        totalChecked++;

        // Check fullResponse (3000 chars) first, fall back to excerpt (200 chars)
        const textToSearch = r.fullResponse ?? r.excerpt ?? "";
        const inText = normalizeTurkish(textToSearch).includes(nameNorm);

        // Also check the competitors array from the analyzer
        const inCompetitors = (r.competitors as string[])?.some(
          (c: string) => normalizeTurkish(c).includes(nameNorm) || nameNorm.includes(normalizeTurkish(c))
        ) ?? false;

        if (inText || inCompetitors) {
          platCounts[r.platform].mentioned++;
          totalMentioned++;
        }
      }

      const platforms: Record<PlatformKey, number> = { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0, google_aio: 0 };
      for (const [plat, counts] of Object.entries(platCounts)) {
        platforms[plat as PlatformKey] = counts.total > 0
          ? Math.round((counts.mentioned / counts.total) * 100)
          : 0;
      }

      competitorPlatformScores.set(comp.id, platforms);
      competitorMentionScores.set(comp.id, totalChecked > 0 ? Math.round((totalMentioned / totalChecked) * 100) : 0);
    }
  }

  const rows: CompetitorRowData[] = [
    {
      id: "user",
      name: brand?.name ?? "Siz",
      domain: brand?.domain ?? "",
      isUser: true,
      mentionScore: userMentionScore,
      readinessScore: userReadinessScore,
      platforms: userPlatforms,
      reason: null,
      products: [],
      relevance: "direct",
      source: "user",
    },
    ...competitors.map((c) => ({
      id: c.id,
      name: c.name,
      domain: c.domain,
      isUser: false,
      mentionScore: competitorMentionScores.get(c.id) ?? c.mentionScore,
      readinessScore: c.readinessScore,
      platforms: competitorPlatformScores.get(c.id) ?? (c.platforms as Record<PlatformKey, number>) ?? {
        chatgpt: 0,
        claude: 0,
        gemini: 0,
        perplexity: 0,
        google_aio: 0,
      },
      reason: c.reason,
      products: c.products ?? [],
      relevance: c.relevance ?? "direct",
      source: c.source ?? "manual",
    })),
  ];

  // Populate readiness gaps from audit checks that are failing/partial
  const failingChecks = await prisma.auditCheck.findMany({
    where: {
      category: { brandId },
      status: { in: ["fail", "partial"] },
    },
    include: { category: true },
    orderBy: { score: "asc" },
  });

  const readinessGaps = failingChecks.map(
    (c) => `${c.label}: ${c.recommendation ?? c.detail ?? "İyileştirme gerekli"}`
  );

  // Top source pages from source domains
  const sources = await prisma.sourceDomain.findMany({
    where: { brandId },
    orderBy: { usagePercent: "desc" },
    take: 5,
  });

  const topSourcePages = sources.map((s) => ({
    path: s.domain,
    promptCount: s.urls.length,
  }));

  // Detail for top competitor (re-sort by computed scores)
  const sortedCompetitorRows = rows.filter(r => !r.isUser).sort((a, b) => b.mentionScore - a.mentionScore);
  const topCompetitorRow = sortedCompetitorRows[0];
  const detail: CompetitorDetailData | null = topCompetitorRow
    ? {
        name: topCompetitorRow.name,
        mentionScore: topCompetitorRow.mentionScore,
        userMentionScore,
        readinessGaps,
        topSourcePages,
      }
    : null;

  // Count AI-discovered vs manual
  const aiDiscoveredCount = competitors.filter((c) => c.source === "ai_discovered").length;
  const manualCount = competitors.filter((c) => c.source === "manual").length;

  // --- Share of Voice calculation ---
  const sovColors = [
    "hsl(217, 91%, 60%)",  // blue
    "hsl(280, 67%, 55%)",  // purple
    "hsl(25, 95%, 53%)",   // orange
    "hsl(346, 77%, 50%)",  // rose
    "hsl(173, 58%, 39%)",  // teal
    "hsl(47, 96%, 53%)",   // amber
  ];

  const totalPrompts = latestScan
    ? await prisma.promptResult.count({ where: { scanId: latestScan.id } })
    : 0;
  const totalMentions = latestScan
    ? await prisma.promptResult.count({ where: { scanId: latestScan.id, mentioned: true } })
    : 0;

  let shareOfVoice: { name: string; isUser: boolean; percentage: number; color: string }[] = [];

  if (latestScan && totalPrompts > 0) {
    // Reuse scanResults already fetched above
    const allResults = scanResults;

    // User brand: count prompts where mentioned = true
    const userMentionCount = allResults.filter((r) => r.mentioned).length;

    // Competitors: count prompts where their name appears in the response
    const competitorSovEntries: { name: string; count: number }[] = [];
    for (const comp of competitors) {
      const nameNorm = normalizeTurkish(comp.name);
      const count = allResults.filter((r) => {
        const textToSearch = r.fullResponse ?? r.excerpt ?? "";
        const inText = normalizeTurkish(textToSearch).includes(nameNorm);
        const inCompetitors = (r.competitors as string[])?.some(
          (c: string) => normalizeTurkish(c).includes(nameNorm) || nameNorm.includes(normalizeTurkish(c))
        ) ?? false;
        return inText || inCompetitors;
      }).length;
      competitorSovEntries.push({ name: comp.name, count });
    }

    // Build SoV array
    const userPct = Math.round((userMentionCount / totalPrompts) * 100);
    shareOfVoice.push({
      name: brand?.name ?? "Siz",
      isUser: true,
      percentage: userPct,
      color: "hsl(142, 71%, 45%)",
    });

    let competitorColorIdx = 0;
    let assignedTotal = userPct;
    for (const entry of competitorSovEntries) {
      const pct = Math.round((entry.count / totalPrompts) * 100);
      if (pct > 0) {
        shareOfVoice.push({
          name: entry.name,
          isUser: false,
          percentage: pct,
          color: sovColors[competitorColorIdx % sovColors.length],
        });
        assignedTotal += pct;
        competitorColorIdx++;
      }
    }

    // "Diğerleri" for remaining percentage
    const othersPct = Math.max(0, 100 - assignedTotal);
    if (othersPct > 0) {
      shareOfVoice.push({
        name: "Diğerleri",
        isUser: false,
        percentage: othersPct,
        color: "hsl(220, 9%, 70%)",
      });
    }
  }

  // --- Empty Area Opportunities ---
  // Prompts where brand is NOT mentioned AND no competitor appears more than once
  let emptyAreaOpportunities: EmptyAreaOpportunity[] = [];

  if (latestScan) {
    const allResultsWithPrompt = await prisma.promptResult.findMany({
      where: { scanId: latestScan.id },
      select: {
        mentioned: true,
        competitors: true,
        platform: true,
        prompt: { select: { text: true } },
      },
    });

    // Group results by prompt text
    const promptMap = new Map<
      string,
      { platforms: string[]; mentioned: boolean; competitorCounts: Map<string, number> }
    >();

    for (const r of allResultsWithPrompt) {
      const key = r.prompt.text;
      let entry = promptMap.get(key);
      if (!entry) {
        entry = { platforms: [], mentioned: false, competitorCounts: new Map() };
        promptMap.set(key, entry);
      }
      entry.platforms.push(r.platform);
      if (r.mentioned) entry.mentioned = true;
      for (const comp of r.competitors) {
        entry.competitorCounts.set(comp, (entry.competitorCounts.get(comp) ?? 0) + 1);
      }
    }

    for (const [promptText, entry] of promptMap) {
      // Skip if brand is mentioned in any platform for this prompt
      if (entry.mentioned) continue;

      // Check: no competitor appears more than once (no one dominates)
      const maxCount = Math.max(0, ...entry.competitorCounts.values());
      if (maxCount > 1) continue;

      // This is an empty area — find top mention (if any single mention exists)
      let topMention: string | null = null;
      if (entry.competitorCounts.size > 0) {
        topMention = [...entry.competitorCounts.entries()][0][0];
      }

      emptyAreaOpportunities.push({
        promptText,
        platforms: [...new Set(entry.platforms)],
        topMention,
      });
    }

    // Limit to top 10
    emptyAreaOpportunities = emptyAreaOpportunities.slice(0, 10);
  }

  return {
    rows,
    detail,
    userMentionScore,
    userReadinessScore,
    aiDiscoveredCount,
    manualCount,
    totalResults: totalPrompts,
    totalMentions,
    shareOfVoice,
    emptyAreaOpportunities,
  };
});

/**
 * Get deep detail for a competitor — called client-side via server action
 */
export async function getCompetitorDeepDetail(
  brandId: string,
  competitorName: string,
): Promise<CompetitorDeepDetail> {
  const latestScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
    select: { id: true },
  });

  if (!latestScan) {
    return { promptAppearances: [], sharedSources: [], competitorOnlySources: [] };
  }

  // Find prompt results where competitor name appears in excerpt
  const allResults = await prisma.promptResult.findMany({
    where: { scanId: latestScan.id },
    include: { prompt: { select: { text: true } } },
  });

  const nameNorm = normalizeTurkish(competitorName);
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });

  const promptAppearances: CompetitorPromptAppearance[] = [];

  for (const r of allResults) {
    const textToSearch = r.fullResponse ?? r.excerpt ?? "";
    const inText = normalizeTurkish(textToSearch).includes(nameNorm);
    const inCompetitors = (r.competitors as string[])?.some(
      (c: string) => normalizeTurkish(c).includes(nameNorm) || nameNorm.includes(normalizeTurkish(c))
    ) ?? false;

    if (inText || inCompetitors) {
      promptAppearances.push({
        promptText: r.prompt.text,
        platform: r.platform,
        excerpt: r.excerpt ?? (r.fullResponse?.slice(0, 300) ?? ""),
        userMentionedToo: r.mentioned,
      });
    }
  }

  // Source comparison: find citation URLs from competitor vs user results
  const competitorCitationDomains = new Set<string>();
  const userCitationDomains = new Set<string>();

  for (const r of allResults) {
    const textToSearch = r.fullResponse ?? r.excerpt ?? "";
    const compMentioned = normalizeTurkish(textToSearch).includes(nameNorm);
    const citations = Array.isArray(r.citations) ? (r.citations as string[]) : [];
    for (const url of citations) {
      try {
        const domain = new URL(url).hostname.replace(/^www\./, "");
        if (compMentioned) {
          competitorCitationDomains.add(domain);
        }
        if (r.mentioned) {
          userCitationDomains.add(domain);
        }
      } catch {
        // ignore invalid URLs
      }
    }
  }

  const sharedSources = [...competitorCitationDomains].filter((d) => userCitationDomains.has(d));
  const competitorOnlySources = [...competitorCitationDomains].filter((d) => !userCitationDomains.has(d));

  return { promptAppearances, sharedSources, competitorOnlySources };
}

// ─── Sidebar rakip overlay için ────────────────────────

export const getTopCompetitorChecklist = cache(
  async (brandId: string): Promise<{ name: string; score: number } | null> => {
    const topCompetitor = await prisma.competitor.findFirst({
      where: { brandId },
      orderBy: { mentionScore: "desc" },
      select: { name: true, mentionScore: true },
    });

    if (!topCompetitor || topCompetitor.mentionScore === 0) return null;
    return { name: topCompetitor.name, score: topCompetitor.mentionScore };
  },
);
