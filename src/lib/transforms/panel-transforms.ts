import type { DashboardOverview } from "@/lib/dal/overview";

// ---------------------------------------------------------------------------
// Position string → numeric value mapping
// ---------------------------------------------------------------------------
const POSITION_MAP: Record<string, number> = {
  "1. sırada": 1,
  "2. sırada": 2,
  "3. sırada": 3,
  "bahsediliyor": 4,
  "ilk sırada": 1,
};

function positionToNumber(pos: string): number {
  const lower = pos.toLowerCase().trim();
  if (POSITION_MAP[lower] !== undefined) return POSITION_MAP[lower];
  const match = lower.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  return 0;
}

// ---------------------------------------------------------------------------
// Sentiment string → numeric value mapping
// ---------------------------------------------------------------------------
const SENTIMENT_MAP: Record<string, number> = {
  pozitif: 1,
  "nötr": 0.5,
  negatif: 0,
};

function sentimentToNumber(s: string): number {
  return SENTIMENT_MAP[s.toLowerCase().trim()] ?? 0.5;
}

// ---------------------------------------------------------------------------
// overviewToMetrics
// Converts DashboardOverview to the flat metrics shape used by panel pages.
// ---------------------------------------------------------------------------
export function overviewToMetrics(data: Partial<DashboardOverview> | null | undefined) {
  if (!data) {
    return {
      geoScore: 0,
      shareOfVoice: 0,
      coverage: 0,
      avgPosition: 0,
      sentiment: 0,
      changes: { geoScore: 0, shareOfVoice: 0, coverage: 0, avgPosition: 0, sentiment: 0 },
    };
  }

  // GEO Score
  const geoScore = data.mentionScore ?? 0;

  // Share of Voice — derived from competitorRanking: user's mentionCount / total
  let shareOfVoice = 0;
  const ranking = data.competitorRanking ?? [];
  if (ranking.length > 0) {
    const totalMentions = ranking.reduce((sum, c) => sum + c.mentionCount, 0);
    const userEntry = ranking.find((c) => c.isUser);
    if (userEntry && totalMentions > 0) {
      shareOfVoice = Math.round((userEntry.mentionCount / totalMentions) * 100);
    }
  }

  // Coverage — (totalMentionCount / totalResultCount) * 100
  const totalMention = data.totalMentionCount ?? 0;
  const totalResult = data.totalResultCount ?? 0;
  const coverage = totalResult > 0 ? Math.round((totalMention / totalResult) * 100) : 0;

  // Average position from recentMentions
  const mentions = data.recentMentions ?? [];
  let avgPosition = 0;
  if (mentions.length > 0) {
    const positions = mentions.map((m) => positionToNumber(m.position)).filter((p) => p > 0);
    if (positions.length > 0) {
      avgPosition = +(positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1);
    }
  }

  // Average sentiment from recentMentions
  let sentiment = 0;
  if (mentions.length > 0) {
    const values = mentions.map((m) => sentimentToNumber(m.sentiment));
    sentiment = +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
  }

  return {
    geoScore,
    shareOfVoice,
    coverage,
    avgPosition,
    sentiment,
    changes: { geoScore: 0, shareOfVoice: 0, coverage: 0, avgPosition: 0, sentiment: 0 },
  };
}

// ---------------------------------------------------------------------------
// overviewToCompetitors
// Maps competitorRanking to the donut-chart format: { name, share, color }[]
// ---------------------------------------------------------------------------
const COMPETITOR_COLORS = [
  "#18181B", // first entry (user brand)
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#E5E7EB",
  "#F3F4F6",
];

export function overviewToCompetitors(data: Partial<DashboardOverview> | null | undefined) {
  if (!data || !data.competitorRanking || data.competitorRanking.length === 0) {
    return [];
  }

  const ranking = data.competitorRanking;
  const totalMentions = ranking.reduce((sum, c) => sum + c.mentionCount, 0);

  // Put user entry first, then the rest sorted by mentionCount desc
  const userEntry = ranking.find((c) => c.isUser);
  const others = ranking.filter((c) => !c.isUser).sort((a, b) => b.mentionCount - a.mentionCount);
  const ordered = userEntry ? [userEntry, ...others] : others;

  return ordered.map((entry, i) => ({
    name: entry.name,
    share: totalMentions > 0 ? Math.round((entry.mentionCount / totalMentions) * 100) : 0,
    color: COMPETITOR_COLORS[i] ?? COMPETITOR_COLORS[COMPETITOR_COLORS.length - 1],
  }));
}

// ---------------------------------------------------------------------------
// promptsToKeywords
// Maps prompt-level data to the keyword table format used by panel pages.
// Expects an array of objects with at least { text, mentionCount, totalResults,
// sentiment, category } — typically from a prompt-level DAL query.
// ---------------------------------------------------------------------------
export interface PromptKeywordInput {
  text?: string;
  promptText?: string;
  mentionCount?: number;
  mentionedPlatforms?: number;
  totalResults?: number;
  totalPlatforms?: number;
  avgPosition?: number;
  sentiment?: string | number;
  category?: string;
}

export function promptsToKeywords(prompts: PromptKeywordInput[] | null | undefined) {
  if (!prompts || prompts.length === 0) return [];

  return prompts.map((p) => {
    const mentioned = p.mentionCount ?? p.mentionedPlatforms ?? 0;
    const total = p.totalResults ?? p.totalPlatforms ?? 1;
    const coverage = total > 0 ? Math.round((mentioned / total) * 100) : 0;
    const shareOfVoice = coverage; // approximate: same as coverage when per-prompt

    let sentimentVal = 0;
    if (typeof p.sentiment === "number") {
      sentimentVal = p.sentiment;
    } else if (typeof p.sentiment === "string") {
      sentimentVal = sentimentToNumber(p.sentiment);
    }

    return {
      keyword: p.text ?? p.promptText ?? "",
      shareOfVoice,
      coverage,
      avgPosition: p.avgPosition ?? 0,
      sentiment: sentimentVal,
      category: p.category ?? "bilgi",
    };
  });
}

// ---------------------------------------------------------------------------
// overviewToTrend
// Maps weeklyTrend (per-platform %) to the chart format used by panel pages.
// ---------------------------------------------------------------------------
export function overviewToTrend(data: Partial<DashboardOverview> | null | undefined) {
  if (!data || !data.weeklyTrend || data.weeklyTrend.length === 0) return [];

  return data.weeklyTrend.map((point) => {
    const platforms = [point.chatgpt, point.claude, point.gemini, point.perplexity, point.google_aio];
    const nonZero = platforms.filter((v) => v > 0);
    const avg = nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;

    return {
      date: point.week,
      shareOfVoice: Math.round(avg),
      coverage: Math.round(avg), // approximate — same as aggregate mention rate
      avgPosition: 0, // not available from weeklyTrend data
      sentiment: 0, // not available from weeklyTrend data
    };
  });
}
