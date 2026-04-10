import { prisma } from "@/lib/db";
import { cache } from "react";
import type { PlatformKey, Sentiment } from "@/lib/types";
import { extractCompetitorNames } from "@/lib/ai/types";

/**
 * Strip markdown, URLs, garbled text from AI responses for clean display.
 */
function cleanExcerpt(text: string): string {
  // Detect garbled/binary responses
  if (isGarbledResponse(text)) return "";
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/[^\s)]+/g, "")
    .replace(/(?:www\.)[a-zA-Z0-9.-]+\.[a-z]{2,}[^\s]*/g, "")
    .replace(/\*{1,3}([^*]*?)\*{1,3}/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[\s]*[-*+]\s+/gm, " ")
    .replace(/^[\s]*\d+\.\s+/gm, " ")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^>\s*/gm, "")
    .replace(/[_~|]/g, "")
    .replace(/\[\d+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Detect garbled/binary/error responses that shouldn't be shown */
function isGarbledResponse(text: string): boolean {
  if (!text || text.length < 10) return false;
  if (text.startsWith("[ERROR]") || text.startsWith("ERROR")) return true;
  if (text.includes("Bu arama için AI Bakışı mevcut değil")) return true;
  // Check for base64-like content (long strings without spaces)
  const words = text.split(/\s+/);
  const longWords = words.filter((w) => w.length > 40);
  if (longWords.length >= 2) return true;
  // Check for very low space ratio (normal text has ~1 space per 5-7 chars)
  const spaceRatio = (text.match(/\s/g) || []).length / text.length;
  if (text.length > 50 && spaceRatio < 0.05) return true;
  return false;
}

export interface RecentMention {
  id: string;
  platform: PlatformKey;
  timeAgo: string;
  prompt: string;
  excerpt: string;
  position: string;
  sentiment: Sentiment;
  citations: string[];
  scanDate: string;
}

export interface PlatformStat {
  platform: PlatformKey;
  mentioned: number;
  total: number;
}

export interface WeeklyMentionRate {
  totalScans: number; // how many scans this week (up to 3)
  mentionedInScans: number; // how many scans brand was mentioned at all
  perPlatform: Record<PlatformKey, { mentioned: number; total: number }>;
}

export interface CompetitorRankEntry {
  name: string;
  mentionCount: number;
  totalResults: number;
  isUser: boolean;
  perPlatform: Record<PlatformKey, { mentioned: number; total: number }>;
}

export interface WeeklyTrendPoint {
  week: string; // "Hafta 1", "Hafta 2", ...
  chatgpt: number;
  claude: number;
  gemini: number;
  perplexity: number;
  google_aio: number;
}

export interface ChecklistProgress {
  total: number;
  completed: number;
}

/** Prompt summary for overview — best/worst performing questions */
export interface PromptSummaryItem {
  promptText: string;
  mentionedPlatforms: number;
  totalPlatforms: number;
  platformResults: Record<PlatformKey, boolean>;
}

/** AI response excerpt where brand is mentioned */
export interface AiResponseExcerpt {
  platform: PlatformKey;
  promptText: string;
  excerpt: string;
}

/** Checklist item summary for overview */
export interface ChecklistOverviewItem {
  simpleTitle: string;
  feasibilityScore: number;
  estimatedTime: string | null;
  impact: string;
  difficulty: string;
}

/** Source map entry for overview */
export interface SourceMapEntry {
  domain: string;
  type: string;
  exists: boolean;
}

export interface DashboardOverview {
  mentionScore: number;
  mentionTrend: number;
  readinessScore: number;
  readinessTrend: number;
  activePromptCount: number;
  totalSourceCount: number;
  lastScanDate: string | null;
  lastScanTimeAgo: string | null;
  totalMentionCount: number;
  totalResultCount: number;
  recentMentions: RecentMention[];
  platformStats: PlatformStat[];
  weeklyMentionRate: WeeklyMentionRate;
  visibilityData: {
    name: string;
    isUser: boolean;
    platforms: Record<PlatformKey, number>;
  }[];
  priorityActions: { title: string; impact: string }[];
  scoreHistory: { date: string; mentionScore: number; readinessScore: number }[];
  topCompetitorName: string | null;
  topCompetitorGap: number;
  /** Senin Yerine Kim — rakip sıralama (ScanResult.competitors'dan) */
  competitorRanking: CompetitorRankEntry[];
  /** 4-week per-platform mention rate trend (%) */
  weeklyTrend: WeeklyTrendPoint[];
  /** Checklist (gelisim plani) progress */
  checklistProgress: ChecklistProgress;
  /** Total number of scans completed */
  totalScanCount: number;
  /** Top performing prompts (best mention rate) */
  bestPrompts: PromptSummaryItem[];
  /** Worst performing prompts (zero mentions) */
  worstPrompts: PromptSummaryItem[];
  /** AI response excerpts where brand is mentioned */
  aiResponseExcerpts: AiResponseExcerpt[];
  /** Easiest checklist items (highest feasibility, not complete) */
  easiestChecklistItems: ChecklistOverviewItem[];
  /** Highest impact checklist items (not complete) */
  highImpactChecklistItems: ChecklistOverviewItem[];
  /** Source map for overview */
  sourceMap: SourceMapEntry[];
  /** Brand domain */
  brandDomain: string;
}

export const getOverviewData = cache(async (brandId: string): Promise<DashboardOverview> => {
  // Get latest two score history entries for trend calculation
  const scores = await prisma.scoreHistory.findMany({
    where: { brandId },
    orderBy: { date: "desc" },
    take: 2,
  });

  const latest = scores[0];
  const prev = scores[1];

  const mentionScore = latest?.mentionScore ?? 0;
  const readinessScore = latest?.readinessScore ?? 0;
  const mentionTrend = prev ? mentionScore - prev.mentionScore : 0;
  const readinessTrend = prev ? readinessScore - prev.readinessScore : 0;

  // Active prompts count
  const activePromptCount = await prisma.prompt.count({
    where: { brandId, isActive: true },
  });

  // Source domains count
  const totalSourceCount = await prisma.sourceDomain.count({
    where: { brandId },
  });

  // Recent mentions (latest scan results where mentioned = true)
  const latestScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
  });

  const lastScanDate = latestScan?.completedAt?.toISOString() ?? null;
  const lastScanTimeAgo = latestScan?.completedAt ? getTimeAgo(latestScan.completedAt) : null;

  let recentMentions: RecentMention[] = [];
  let totalMentionCount = 0;
  let totalResultCount = 0;
  let platformStats: PlatformStat[] = [];

  if (latestScan) {
    const allResults = await prisma.promptResult.findMany({
      where: { scanId: latestScan.id },
    });
    totalResultCount = allResults.length;
    totalMentionCount = allResults.filter((r) => r.mentioned).length;

    // Per-platform breakdown
    const platCounts: Record<string, { mentioned: number; total: number }> = {
      chatgpt: { mentioned: 0, total: 0 },
      claude: { mentioned: 0, total: 0 },
      gemini: { mentioned: 0, total: 0 },
      perplexity: { mentioned: 0, total: 0 },
      google_aio: { mentioned: 0, total: 0 },
    };
    for (const r of allResults) {
      if (!platCounts[r.platform]) continue;
      platCounts[r.platform].total++;
      if (r.mentioned) platCounts[r.platform].mentioned++;
    }
    platformStats = (["chatgpt", "claude", "gemini", "perplexity", "google_aio"] as PlatformKey[]).map((p) => ({
      platform: p,
      mentioned: platCounts[p].mentioned,
      total: platCounts[p].total,
    }));

    const results = await prisma.promptResult.findMany({
      where: { scanId: latestScan.id, mentioned: true },
      include: { prompt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const scanDate = latestScan.completedAt?.toISOString().split("T")[0] ?? "";

    recentMentions = results.map((r) => ({
      id: r.id,
      platform: r.platform as PlatformKey,
      timeAgo: getTimeAgo(r.createdAt),
      prompt: r.prompt.text,
      excerpt: r.excerpt ?? "",
      position: r.position ?? "bahsediliyor",
      sentiment: (r.sentiment ?? "nötr") as Sentiment,
      citations: Array.isArray(r.citations) ? (r.citations as string[]) : [],
      scanDate,
    }));
  }

  // Weekly mention rate — last 3 completed scans (this week)
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const recentScans = await prisma.scan.findMany({
    where: { brandId, status: "completed", completedAt: { gte: weekStart } },
    orderBy: { completedAt: "desc" },
    take: 3,
    select: { id: true },
  });

  let weeklyMentionRate: WeeklyMentionRate = {
    totalScans: recentScans.length,
    mentionedInScans: 0,
    perPlatform: {
      chatgpt: { mentioned: 0, total: recentScans.length },
      claude: { mentioned: 0, total: recentScans.length },
      gemini: { mentioned: 0, total: recentScans.length },
      perplexity: { mentioned: 0, total: recentScans.length },
      google_aio: { mentioned: 0, total: recentScans.length },
    },
  };

  if (recentScans.length > 0) {
    const weekResults = await prisma.promptResult.findMany({
      where: { scanId: { in: recentScans.map((s) => s.id) } },
      select: { scanId: true, platform: true, mentioned: true },
    });

    // Per-scan: did brand get mentioned at all?
    const scanMentioned = new Set<string>();
    // Per-platform per-scan: was brand mentioned on this platform in this scan?
    const platScanMentioned: Record<PlatformKey, Set<string>> = {
      chatgpt: new Set(),
      claude: new Set(),
      gemini: new Set(),
      perplexity: new Set(),
      google_aio: new Set(),
    };

    for (const r of weekResults) {
      if (r.mentioned) {
        scanMentioned.add(r.scanId);
        const p = r.platform as PlatformKey;
        if (platScanMentioned[p]) {
          platScanMentioned[p].add(r.scanId);
        }
      }
    }

    weeklyMentionRate = {
      totalScans: recentScans.length,
      mentionedInScans: scanMentioned.size,
      perPlatform: {
        chatgpt: { mentioned: platScanMentioned.chatgpt.size, total: recentScans.length },
        claude: { mentioned: platScanMentioned.claude.size, total: recentScans.length },
        gemini: { mentioned: platScanMentioned.gemini.size, total: recentScans.length },
        perplexity: { mentioned: platScanMentioned.perplexity.size, total: recentScans.length },
        google_aio: { mentioned: platScanMentioned.google_aio.size, total: recentScans.length },
      },
    };
  }

  // Competitor visibility data
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  const competitors = await prisma.competitor.findMany({ where: { brandId } });

  const visibilityData: DashboardOverview["visibilityData"] = [
    {
      name: brand?.name ?? "Siz",
      isUser: true,
      platforms: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0, google_aio: 0 },
    },
    ...competitors.map((c) => ({
      name: c.name,
      isUser: false,
      platforms: (c.platforms as Record<PlatformKey, number>) ?? {
        chatgpt: 0,
        claude: 0,
        gemini: 0,
        perplexity: 0,
      },
    })),
  ];

  // Priority actions (incomplete, high priority)
  const actions = await prisma.actionTask.findMany({
    where: { brandId, completed: false, priority: "high" },
    take: 3,
  });
  const priorityActions = actions.map((a) => ({
    title: a.title,
    impact: a.impact,
  }));

  // Score history for chart
  const history = await prisma.scoreHistory.findMany({
    where: { brandId },
    orderBy: { date: "asc" },
    take: 90, // last ~3 months
  });
  const scoreHistory = history.map((h) => ({
    date: h.date.toISOString().split("T")[0],
    mentionScore: h.mentionScore,
    readinessScore: h.readinessScore,
  }));

  // Top competitor for overview cards
  const topCompetitor = competitors.sort((a, b) => b.mentionScore - a.mentionScore)[0] ?? null;
  const topCompetitorName = topCompetitor?.name ?? null;
  const topCompetitorGap = topCompetitor ? topCompetitor.mentionScore - mentionScore : 0;

  // ── Senin Yerine Kim — Competitor ranking from ScanResult.competitors ──
  let competitorRanking: CompetitorRankEntry[] = [];
  if (latestScan) {
    const allScanResults = await prisma.promptResult.findMany({
      where: { scanId: latestScan.id },
      select: { platform: true, mentioned: true, competitors: true },
    });

    // Count how many times each competitor name appears across all results
    const compCounts: Record<string, { total: number; perPlatform: Record<PlatformKey, { mentioned: number; total: number }> }> = {};

    // Source 1: PromptResult.competitors field
    for (const r of allScanResults) {
      const comps = extractCompetitorNames(r.competitors);
      for (const name of comps) {
        const key = name.trim();
        if (!key) continue;
        if (!compCounts[key]) {
          compCounts[key] = {
            total: 0,
            perPlatform: {
              chatgpt: { mentioned: 0, total: 0 },
              claude: { mentioned: 0, total: 0 },
              gemini: { mentioned: 0, total: 0 },
              perplexity: { mentioned: 0, total: 0 },
              google_aio: { mentioned: 0, total: 0 },
            },
          };
        }
        compCounts[key].total++;
        const plat = r.platform as PlatformKey;
        if (compCounts[key].perPlatform[plat]) {
          compCounts[key].perPlatform[plat].mentioned++;
        }
      }
    }

    // Source 2: If PromptResult.competitors was empty, fall back to Competitor table
    if (Object.keys(compCounts).length === 0) {
      const dbCompetitors = await prisma.competitor.findMany({
        where: { brandId },
        select: { name: true, mentionScore: true },
        orderBy: { mentionScore: "desc" },
      });
      for (const c of dbCompetitors) {
        compCounts[c.name] = {
          total: c.mentionScore,
          perPlatform: {
            chatgpt: { mentioned: 0, total: 0 },
            claude: { mentioned: 0, total: 0 },
            gemini: { mentioned: 0, total: 0 },
            perplexity: { mentioned: 0, total: 0 },
            google_aio: { mentioned: 0, total: 0 },
          },
        };
      }
    }

    // Build ranking array: competitors + brand itself
    const brandEntry: CompetitorRankEntry = {
      name: brand?.name ?? "Siz",
      mentionCount: totalMentionCount,
      totalResults: totalResultCount,
      isUser: true,
      perPlatform: {
        chatgpt: platformStats.find((p) => p.platform === "chatgpt") ?? { mentioned: 0, total: 0 } as never,
        claude: platformStats.find((p) => p.platform === "claude") ?? { mentioned: 0, total: 0 } as never,
        gemini: platformStats.find((p) => p.platform === "gemini") ?? { mentioned: 0, total: 0 } as never,
        perplexity: platformStats.find((p) => p.platform === "perplexity") ?? { mentioned: 0, total: 0 } as never,
        google_aio: platformStats.find((p) => p.platform === "google_aio") ?? { mentioned: 0, total: 0 } as never,
      },
    };

    // Fix platform stat mapping for brand
    for (const ps of platformStats) {
      brandEntry.perPlatform[ps.platform] = { mentioned: ps.mentioned, total: ps.total };
    }

    const compEntries: CompetitorRankEntry[] = Object.entries(compCounts)
      .map(([name, data]) => ({
        name,
        mentionCount: data.total,
        totalResults: totalResultCount,
        isUser: false,
        perPlatform: data.perPlatform,
      }))
      .sort((a, b) => b.mentionCount - a.mentionCount);

    // Merge: insert brand at correct position and take top 5
    const merged = [...compEntries];
    // Find where brand should be inserted
    const brandPos = merged.findIndex((c) => c.mentionCount <= totalMentionCount);
    if (brandPos === -1) {
      merged.push(brandEntry);
    } else {
      merged.splice(brandPos, 0, brandEntry);
    }
    competitorRanking = merged.slice(0, 10);

    // If brand is not in top 10, add it anyway
    if (!competitorRanking.some((c) => c.isUser)) {
      competitorRanking.push(brandEntry);
    }
  }

  // ── 4-Week per-platform trend ────────────────────────
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const trendScans = await prisma.scan.findMany({
    where: { brandId, status: "completed", completedAt: { gte: fourWeeksAgo } },
    orderBy: { completedAt: "asc" },
    select: { id: true, completedAt: true },
  });

  // Bucket scans into 4 weeks
  const platforms: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity", "google_aio"];
  const weeklyTrend: WeeklyTrendPoint[] = [];

  if (trendScans.length > 0) {
    const now = new Date();
    const weekBuckets: { scanIds: string[] }[] = [
      { scanIds: [] },
      { scanIds: [] },
      { scanIds: [] },
      { scanIds: [] },
    ];
    for (const scan of trendScans) {
      const daysAgo = Math.floor((now.getTime() - (scan.completedAt?.getTime() ?? now.getTime())) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.min(3, Math.floor(daysAgo / 7));
      weekBuckets[3 - weekIndex].scanIds.push(scan.id);
    }

    const allTrendScanIds = trendScans.map((s) => s.id);
    const trendResults = allTrendScanIds.length > 0
      ? await prisma.promptResult.findMany({
          where: { scanId: { in: allTrendScanIds } },
          select: { scanId: true, platform: true, mentioned: true },
        })
      : [];

    // Group results by scanId for quick lookup
    const resultsByScan = new Map<string, { platform: string; mentioned: boolean }[]>();
    for (const r of trendResults) {
      if (!resultsByScan.has(r.scanId)) resultsByScan.set(r.scanId, []);
      resultsByScan.get(r.scanId)!.push(r);
    }

    for (let w = 0; w < 4; w++) {
      const bucket = weekBuckets[w];
      const point: WeeklyTrendPoint = {
        week: `Hafta ${w + 1}`,
        chatgpt: 0,
        claude: 0,
        gemini: 0,
        perplexity: 0,
        google_aio: 0,
      };
      if (bucket.scanIds.length > 0) {
        for (const p of platforms) {
          let mentioned = 0;
          let total = 0;
          for (const sid of bucket.scanIds) {
            const results = resultsByScan.get(sid) ?? [];
            for (const r of results) {
              if (r.platform === p) {
                total++;
                if (r.mentioned) mentioned++;
              }
            }
          }
          point[p] = total > 0 ? Math.round((mentioned / total) * 100) : 0;
        }
      }
      weeklyTrend.push(point);
    }
  }

  // ── Checklist (gelisim plani) progress ─────────────────
  const checklistItems = await prisma.checklistItem.findMany({
    where: { brandId },
    select: { status: true },
  });
  const checklistProgress: ChecklistProgress = {
    total: checklistItems.length,
    completed: checklistItems.filter((i) => i.status === "complete").length,
  };

  // ── Total scan count ───────────────────────────────────
  const totalScanCount = await prisma.scan.count({
    where: { brandId, status: "completed" },
  });

  // ── Prompt summary (best/worst performing) ─────────────
  let bestPrompts: PromptSummaryItem[] = [];
  let worstPrompts: PromptSummaryItem[] = [];
  let aiResponseExcerpts: AiResponseExcerpt[] = [];

  if (latestScan) {
    const promptResultsWithText = await prisma.promptResult.findMany({
      where: { scanId: latestScan.id },
      select: {
        platform: true,
        mentioned: true,
        excerpt: true,
        fullResponse: true,
        prompt: { select: { text: true } },
      },
    });

    // Group by prompt text
    const promptGroups = new Map<
      string,
      { platforms: Record<PlatformKey, boolean>; mentionedCount: number; totalCount: number }
    >();
    for (const r of promptResultsWithText) {
      const key = r.prompt.text;
      let group = promptGroups.get(key);
      if (!group) {
        group = {
          platforms: { chatgpt: false, claude: false, gemini: false, perplexity: false, google_aio: false },
          mentionedCount: 0,
          totalCount: 0,
        };
        promptGroups.set(key, group);
      }
      const plat = r.platform as PlatformKey;
      group.totalCount++;
      if (r.mentioned) {
        group.platforms[plat] = true;
        group.mentionedCount++;
      }
    }

    const promptSummaries: PromptSummaryItem[] = [];
    for (const [text, group] of promptGroups) {
      promptSummaries.push({
        promptText: text,
        mentionedPlatforms: group.mentionedCount,
        totalPlatforms: group.totalCount,
        platformResults: group.platforms,
      });
    }

    // Best: sorted by most mentions first
    bestPrompts = promptSummaries
      .filter((p) => p.mentionedPlatforms > 0)
      .sort((a, b) => b.mentionedPlatforms - a.mentionedPlatforms)
      .slice(0, 3);

    // Worst: zero mentions
    worstPrompts = promptSummaries
      .filter((p) => p.mentionedPlatforms === 0)
      .slice(0, 3);

    // AI response excerpts — find results where brand is mentioned, extract excerpt
    const brandName = brand?.name ?? "";
    const brandNameLower = brandName.toLowerCase();
    for (const r of promptResultsWithText) {
      if (!r.mentioned) continue;
      if (aiResponseExcerpts.length >= 3) break;

      const rawText = r.fullResponse ?? r.excerpt ?? "";
      if (!rawText) continue;
      const responseText = cleanExcerpt(rawText);
      if (!responseText) continue;

      // Find a snippet around the brand name
      const lowerResponse = responseText.toLowerCase();
      const brandIdx = lowerResponse.indexOf(brandNameLower);
      let snippet = "";
      if (brandIdx >= 0) {
        const start = Math.max(0, brandIdx - 60);
        const end = Math.min(responseText.length, brandIdx + brandName.length + 120);
        snippet = (start > 0 ? "..." : "") + responseText.slice(start, end).trim() + (end < responseText.length ? "..." : "");
      } else {
        snippet = responseText.slice(0, 180).trim() + (responseText.length > 180 ? "..." : "");
      }

      aiResponseExcerpts.push({
        platform: r.platform as PlatformKey,
        promptText: r.prompt.text,
        excerpt: snippet,
      });
    }
  }

  // ── Checklist items for overview (easiest + highest impact) ──
  const allChecklistItems = await prisma.checklistItem.findMany({
    where: { brandId, status: { not: "complete" } },
    select: {
      simpleTitle: true,
      feasibilityScore: true,
      estimatedTime: true,
      impact: true,
      difficulty: true,
    },
    orderBy: { feasibilityScore: "desc" },
  });

  const easiestChecklistItems: ChecklistOverviewItem[] = allChecklistItems
    .sort((a, b) => b.feasibilityScore - a.feasibilityScore)
    .slice(0, 3);

  const highImpactChecklistItems: ChecklistOverviewItem[] = [...allChecklistItems]
    .filter((i) => i.impact === "HIGH")
    .slice(0, 3);

  // ── Source map for overview ─────────────────────────────
  const sourceDomains = await prisma.sourceDomain.findMany({
    where: { brandId },
    select: { domain: true, type: true },
  });

  // Standard source categories to check
  const brandDomain = brand?.domain ?? "";
  const sourceMap: SourceMapEntry[] = [];

  // Check which standard categories exist
  // DB types vary: "kurumsal" | "dizin" | "ugc" | "referans" | "medya" | "directory" | "profile" | "news"
  const domainLower = brandDomain.replace(/^www\./, "").toLowerCase();
  const hasDomain = sourceDomains.some((s) => s.domain.toLowerCase().includes(domainLower) && domainLower.length > 0);
  const hasDirectory = sourceDomains.some((s) =>
    s.type === "dizin" || s.type === "directory" ||
    ["armut.com", "iyioneri.tr", "eniyisinde.com.tr", "efirmalar.com.tr"].some((d) => s.domain.includes(d))
  );
  const hasGoogleBusiness = sourceDomains.some((s) =>
    s.domain.includes("google") || s.domain.includes("maps.google")
  );
  const hasLinkedIn = sourceDomains.some((s) => s.domain.includes("linkedin"));
  const hasNews = sourceDomains.some((s) =>
    s.type === "medya" || s.type === "news" || s.type === "article" ||
    ["haberturk.com", "medium.com", "youtube.com"].some((d) => s.domain.includes(d))
  );

  sourceMap.push(
    { domain: brandDomain || "Web sitesi", type: "website", exists: hasDomain },
    { domain: "Dizin kaydi", type: "directory", exists: hasDirectory },
    { domain: "Google Business", type: "profile", exists: hasGoogleBusiness },
    { domain: "LinkedIn", type: "profile", exists: hasLinkedIn },
    { domain: "Haber/roportaj", type: "news", exists: hasNews },
  );

  return {
    mentionScore,
    mentionTrend,
    readinessScore,
    readinessTrend,
    activePromptCount,
    totalSourceCount,
    lastScanDate,
    lastScanTimeAgo,
    totalMentionCount,
    totalResultCount,
    recentMentions,
    platformStats,
    weeklyMentionRate,
    visibilityData,
    priorityActions,
    scoreHistory,
    topCompetitorName,
    topCompetitorGap,
    competitorRanking,
    weeklyTrend,
    checklistProgress,
    totalScanCount,
    bestPrompts,
    worstPrompts,
    aiResponseExcerpts,
    easiestChecklistItems,
    highImpactChecklistItems,
    sourceMap,
    brandDomain,
  };
});

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} saat önce`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} gün önce`;
}

// Helper — simple heuristic check
export function isLikelyCompanyName(name: string, excludeLower?: string): boolean {
  if (!name || name.length < 2 || name.length > 50) return false;
  const lower = name.toLowerCase();
  if (excludeLower && lower === excludeLower) return false;
  const genericWords = ["ve", "ile", "için", "veya", "da", "de", "bir", "bu", "şu", "the", "and", "or", "not", "but"];
  if (genericWords.includes(lower)) return false;
  if (/^\d+$/.test(name)) return false;
  return true;
}

