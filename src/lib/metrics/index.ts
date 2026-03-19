/**
 * GH7.ai — 8 Metrics System
 * All metrics are calculated from existing prompt_results data — NO extra API cost.
 *
 * Each function takes raw DB rows and returns typed, aggregated metrics.
 */

import type { PromptResult, Prompt } from "@prisma/client";
import type { PlatformKey } from "@/lib/types";
import type {
  MentionRateTrend,
  MentionRateWeek,
  PositionTrend,
  PositionWeek,
  SourceMap,
  SourceEntry,
  ShareOfVoice,
  CompetitorVoice,
  PlatformPerformance,
  PlatformMetric,
  QuestionTypeAnalysis,
  QuestionTypeMetric,
  SentimentTracking,
  SentimentWeek,
  GoogleRanking,
  GoogleRankingEntry,
  AllMetrics,
} from "./types";

// Re-export types for convenience
export type { AllMetrics } from "./types";

// ─── Helpers ───────────────────────────────────────

/** Get ISO week number for a date */
function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
  );
}

/** Get year for grouping */
function getYear(date: Date): number {
  return date.getFullYear();
}

/** Group results by week */
function groupByWeek(results: PromptResult[]): Map<string, PromptResult[]> {
  const groups = new Map<string, PromptResult[]>();
  for (const r of results) {
    const week = r.scanWeek ?? getWeekNumber(r.createdAt);
    const year = getYear(r.createdAt);
    const key = `${year}-W${week}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  return groups;
}

/** Parse week key back to numbers */
function parseWeekKey(key: string): { year: number; week: number } {
  const [yearStr, weekStr] = key.split("-W");
  return { year: parseInt(yearStr), week: parseInt(weekStr) };
}

/** Position string to numeric weight (lower = better) */
function positionToWeight(pos: string | null): number {
  if (!pos) return 5;
  if (pos === "1. sıra") return 1;
  if (pos === "2. sıra") return 2;
  if (pos === "3. sıra") return 3;
  if (pos === "bahsediliyor") return 4;
  return 5;
}

/** Sort week keys chronologically */
function sortWeekKeys(keys: string[]): string[] {
  return keys.sort((a, b) => {
    const pa = parseWeekKey(a);
    const pb = parseWeekKey(b);
    if (pa.year !== pb.year) return pa.year - pb.year;
    return pa.week - pb.week;
  });
}

// ─── 1. Mention Rate Trend ─────────────────────────

export function calculateMentionRateTrend(results: PromptResult[]): MentionRateTrend {
  const weekGroups = groupByWeek(results);
  const sortedKeys = sortWeekKeys([...weekGroups.keys()]);

  const weeks: MentionRateWeek[] = sortedKeys.map((key) => {
    const group = weekGroups.get(key)!;
    const { year, week } = parseWeekKey(key);
    const mentioned = group.filter((r) => r.mentioned).length;
    return {
      week,
      year,
      total: group.length,
      mentioned,
      rate: group.length > 0 ? mentioned / group.length : 0,
    };
  });

  const current = weeks[weeks.length - 1] ?? { week: 0, year: 0, total: 0, mentioned: 0, rate: 0 };
  const previous = weeks.length >= 2 ? weeks[weeks.length - 2] : null;

  const changePercent = previous
    ? Math.round((current.rate - previous.rate) * 1000) / 10
    : 0;

  return { current, previous, changePercent, weeks };
}

// ─── 2. Position Tracking ──────────────────────────

export function calculatePositionTrend(results: PromptResult[]): PositionTrend {
  const weekGroups = groupByWeek(results);
  const sortedKeys = sortWeekKeys([...weekGroups.keys()]);

  const weeks: PositionWeek[] = sortedKeys.map((key) => {
    const group = weekGroups.get(key)!;
    const { year, week } = parseWeekKey(key);

    let first = 0, second = 0, third = 0, mentioned = 0, notMentioned = 0;
    let totalWeight = 0;
    let count = 0;

    for (const r of group) {
      const w = positionToWeight(r.position);
      if (r.position === "1. sıra") first++;
      else if (r.position === "2. sıra") second++;
      else if (r.position === "3. sıra") third++;
      else if (r.mentioned) mentioned++;
      else notMentioned++;

      totalWeight += w;
      count++;
    }

    return {
      week,
      year,
      first,
      second,
      third,
      mentioned,
      notMentioned,
      avgPosition: count > 0 ? Math.round((totalWeight / count) * 100) / 100 : 5,
    };
  });

  const current = weeks[weeks.length - 1] ?? {
    week: 0, year: 0, first: 0, second: 0, third: 0,
    mentioned: 0, notMentioned: 0, avgPosition: 5,
  };
  const previous = weeks.length >= 2 ? weeks[weeks.length - 2] : null;
  const positionChange = previous
    ? Math.round((current.avgPosition - previous.avgPosition) * 100) / 100
    : 0;

  return { current, previous, positionChange, weeks };
}

// ─── 3. Source Map ─────────────────────────────────

export function calculateSourceMap(results: PromptResult[]): SourceMap {
  const sourceTracker = new Map<string, SourceEntry>();

  for (const r of results) {
    const rawSources = r.citationSources as Array<{ name: string; url: string; type: string }> | null;
    if (!rawSources || !Array.isArray(rawSources)) continue;

    for (const src of rawSources) {
      if (!src.url) continue;
      let domain: string;
      try {
        domain = new URL(src.url).hostname.replace(/^www\./, "");
      } catch {
        domain = src.url;
      }

      const existing = sourceTracker.get(domain);
      if (existing) {
        existing.count++;
        if (!existing.platforms.includes(r.platform)) {
          existing.platforms.push(r.platform);
        }
      } else {
        sourceTracker.set(domain, {
          domain,
          url: src.url,
          type: src.type || "other",
          count: 1,
          platforms: [r.platform],
        });
      }
    }
  }

  const allSources = [...sourceTracker.values()];
  const byType: Record<string, number> = {};
  for (const s of allSources) {
    byType[s.type] = (byType[s.type] || 0) + s.count;
  }

  // Sort by count descending
  allSources.sort((a, b) => b.count - a.count);

  return {
    totalSources: allSources.reduce((sum, s) => sum + s.count, 0),
    uniqueDomains: allSources.length,
    byType,
    topSources: allSources.slice(0, 20),
  };
}

// ─── 4. Share of Voice ─────────────────────────────

export function calculateShareOfVoice(
  results: PromptResult[],
  brandName: string,
): ShareOfVoice {
  const totalResults = results.length;
  if (totalResults === 0) {
    return {
      brand: { name: brandName, mentions: 0, totalResults: 0, sharePercent: 0 },
      competitors: [],
      totalResultsAnalyzed: 0,
    };
  }

  // Brand mentions
  const brandMentions = results.filter((r) => r.mentioned).length;

  // Competitor mentions — aggregate across all results
  const competitorMap = new Map<string, number>();
  for (const r of results) {
    if (!r.competitors || !Array.isArray(r.competitors)) continue;
    for (const comp of r.competitors) {
      const name = typeof comp === "string" ? comp : (comp as { name: string }).name;
      if (!name) continue;
      competitorMap.set(name, (competitorMap.get(name) || 0) + 1);
    }
  }

  // Total "voice slots" = brand mentions + all competitor mentions
  const totalVoiceSlots = brandMentions + [...competitorMap.values()].reduce((a, b) => a + b, 0);

  const brand: CompetitorVoice = {
    name: brandName,
    mentions: brandMentions,
    totalResults,
    sharePercent: totalVoiceSlots > 0
      ? Math.round((brandMentions / totalVoiceSlots) * 1000) / 10
      : 0,
  };

  const competitors: CompetitorVoice[] = [...competitorMap.entries()]
    .map(([name, mentions]) => ({
      name,
      mentions,
      totalResults,
      sharePercent: totalVoiceSlots > 0
        ? Math.round((mentions / totalVoiceSlots) * 1000) / 10
        : 0,
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 15);

  return { brand, competitors, totalResultsAnalyzed: totalResults };
}

// ─── 5. Platform Performance ───────────────────────

export function calculatePlatformPerformance(results: PromptResult[]): PlatformPerformance {
  const platformMap = new Map<string, PromptResult[]>();

  for (const r of results) {
    if (!platformMap.has(r.platform)) platformMap.set(r.platform, []);
    platformMap.get(r.platform)!.push(r);
  }

  const platforms: PlatformMetric[] = [...platformMap.entries()].map(([platform, group]) => {
    const mentioned = group.filter((r) => r.mentioned).length;
    const mentionRate = group.length > 0 ? mentioned / group.length : 0;

    let totalWeight = 0;
    let posCount = 0;
    let pozitif = 0, notr = 0, negatif = 0;

    for (const r of group) {
      if (r.mentioned) {
        totalWeight += positionToWeight(r.position);
        posCount++;
      }
      if (r.sentiment === "pozitif") pozitif++;
      else if (r.sentiment === "negatif") negatif++;
      else notr++;
    }

    return {
      platform: platform as PlatformKey,
      total: group.length,
      mentioned,
      mentionRate: Math.round(mentionRate * 1000) / 10,
      avgPosition: posCount > 0 ? Math.round((totalWeight / posCount) * 100) / 100 : 5,
      sentimentBreakdown: { pozitif, notr, negatif },
    };
  });

  // Sort by mention rate descending
  platforms.sort((a, b) => b.mentionRate - a.mentionRate);

  return {
    platforms,
    bestPlatform: platforms[0]?.platform ?? null,
    worstPlatform: platforms.length > 0 ? platforms[platforms.length - 1].platform : null,
  };
}

// ─── 6. Question Type Analysis ─────────────────────

export function calculateQuestionTypeAnalysis(
  results: PromptResult[],
  prompts: Prompt[],
): QuestionTypeAnalysis {
  // Build prompt category map
  const promptCategoryMap = new Map<string, string>();
  for (const p of prompts) {
    promptCategoryMap.set(p.id, p.category || "genel");
  }

  // Group results by prompt category
  const categoryMap = new Map<string, { total: number; mentioned: number; totalWeight: number; posCount: number }>();

  for (const r of results) {
    const category = promptCategoryMap.get(r.promptId) || "genel";

    if (!categoryMap.has(category)) {
      categoryMap.set(category, { total: 0, mentioned: 0, totalWeight: 0, posCount: 0 });
    }

    const cat = categoryMap.get(category)!;
    cat.total++;
    if (r.mentioned) {
      cat.mentioned++;
      cat.totalWeight += positionToWeight(r.position);
      cat.posCount++;
    }
  }

  const categories: QuestionTypeMetric[] = [...categoryMap.entries()].map(([category, data]) => ({
    category,
    total: data.total,
    mentioned: data.mentioned,
    mentionRate: data.total > 0 ? Math.round((data.mentioned / data.total) * 1000) / 10 : 0,
    avgPosition: data.posCount > 0 ? Math.round((data.totalWeight / data.posCount) * 100) / 100 : 5,
  }));

  // Sort by mention rate descending
  categories.sort((a, b) => b.mentionRate - a.mentionRate);

  return {
    categories,
    bestCategory: categories[0]?.category ?? null,
    worstCategory: categories.length > 0 ? categories[categories.length - 1].category : null,
  };
}

// ─── 7. Sentiment Tracking ─────────────────────────

export function calculateSentimentTracking(results: PromptResult[]): SentimentTracking {
  // Only consider results where brand is mentioned
  const mentionedResults = results.filter((r) => r.mentioned);
  const weekGroups = groupByWeek(mentionedResults);
  const sortedKeys = sortWeekKeys([...weekGroups.keys()]);

  const weeks: SentimentWeek[] = sortedKeys.map((key) => {
    const group = weekGroups.get(key)!;
    const { year, week } = parseWeekKey(key);

    let pozitif = 0, notr = 0, negatif = 0;
    for (const r of group) {
      if (r.sentiment === "pozitif") pozitif++;
      else if (r.sentiment === "negatif") negatif++;
      else notr++;
    }

    const total = group.length;
    return {
      week,
      year,
      pozitif,
      notr,
      negatif,
      total,
      positiveRate: total > 0 ? pozitif / total : 0,
    };
  });

  const current = weeks[weeks.length - 1] ?? {
    week: 0, year: 0, pozitif: 0, notr: 0, negatif: 0, total: 0, positiveRate: 0,
  };
  const previous = weeks.length >= 2 ? weeks[weeks.length - 2] : null;

  let trend: "improving" | "declining" | "stable" = "stable";
  if (previous) {
    const diff = current.positiveRate - previous.positiveRate;
    if (diff > 0.05) trend = "improving";
    else if (diff < -0.05) trend = "declining";
  }

  return { current, previous, trend, weeks };
}

// ─── 8. Google Organic Ranking (AIO) ───────────────

export function calculateGoogleRanking(
  results: PromptResult[],
  prompts: Prompt[],
): GoogleRanking {
  // Filter to google_aio results only
  const aioResults = results.filter((r) => r.platform === "google_aio");

  // Build prompt text map
  const promptTextMap = new Map<string, string>();
  for (const p of prompts) {
    promptTextMap.set(p.id, p.text);
  }

  const entries: GoogleRankingEntry[] = aioResults.map((r) => {
    const sources = (r.citationSources as Array<{ name: string; url: string; type: string }>) ?? [];
    return {
      promptText: promptTextMap.get(r.promptId) || "—",
      position: r.position,
      mentioned: r.mentioned,
      hasAIOverview: r.fullResponse !== null && r.fullResponse !== "",
      citationSources: sources,
    };
  });

  const mentionedInAIO = entries.filter((e) => e.mentioned).length;
  const totalQueries = entries.length;

  // Average position for mentioned entries
  let totalWeight = 0;
  let posCount = 0;
  for (const e of entries) {
    if (e.mentioned) {
      totalWeight += positionToWeight(e.position);
      posCount++;
    }
  }

  return {
    totalQueries,
    mentionedInAIO,
    aioMentionRate: totalQueries > 0 ? Math.round((mentionedInAIO / totalQueries) * 1000) / 10 : 0,
    avgPosition: posCount > 0 ? Math.round((totalWeight / posCount) * 100) / 100 : 5,
    entries,
  };
}

// ─── Calculate All Metrics ─────────────────────────

export function calculateAllMetrics(
  results: PromptResult[],
  prompts: Prompt[],
  brandName: string,
): AllMetrics {
  return {
    mentionRateTrend: calculateMentionRateTrend(results),
    positionTrend: calculatePositionTrend(results),
    sourceMap: calculateSourceMap(results),
    shareOfVoice: calculateShareOfVoice(results, brandName),
    platformPerformance: calculatePlatformPerformance(results),
    questionTypeAnalysis: calculateQuestionTypeAnalysis(results, prompts),
    sentimentTracking: calculateSentimentTracking(results),
    googleRanking: calculateGoogleRanking(results, prompts),
    calculatedAt: new Date(),
  };
}
