/**
 * GH7.ai — 8 Metrics System Types
 * All metrics are calculated from existing prompt_results data — NO extra API cost.
 */

import type { PlatformKey } from "@/lib/types";

// ─── Shared ────────────────────────────────────────

export interface WeekBucket {
  week: number; // ISO week number
  year: number;
  startDate: Date;
  endDate: Date;
}

// ─── 1. Mention Rate Trend ─────────────────────────

export interface MentionRateWeek {
  week: number;
  year: number;
  total: number;
  mentioned: number;
  rate: number; // 0-1
}

export interface MentionRateTrend {
  current: MentionRateWeek;
  previous: MentionRateWeek | null;
  changePercent: number; // e.g. +5.2 or -3.1
  weeks: MentionRateWeek[];
}

// ─── 2. Position Tracking ──────────────────────────

export interface PositionWeek {
  week: number;
  year: number;
  first: number;  // "1. sıra" count
  second: number; // "2. sıra" count
  third: number;  // "3. sıra" count
  mentioned: number; // "bahsediliyor" count
  notMentioned: number;
  avgPosition: number; // weighted avg (1=best, 4=bahsediliyor, 5=not mentioned)
}

export interface PositionTrend {
  current: PositionWeek;
  previous: PositionWeek | null;
  positionChange: number; // negative = improved (moved up)
  weeks: PositionWeek[];
}

// ─── 3. Source Map ─────────────────────────────────

export interface SourceEntry {
  domain: string;
  url: string;
  type: string; // website, directory, social, news, review, other
  count: number;
  platforms: string[];
}

export interface SourceMap {
  totalSources: number;
  uniqueDomains: number;
  byType: Record<string, number>;
  topSources: SourceEntry[];
}

// ─── 4. Share of Voice ─────────────────────────────

export interface CompetitorVoice {
  name: string;
  mentions: number;
  totalResults: number;
  sharePercent: number;
}

export interface ShareOfVoice {
  brand: CompetitorVoice;
  competitors: CompetitorVoice[];
  totalResultsAnalyzed: number;
}

// ─── 5. Platform Performance ───────────────────────

export interface PlatformMetric {
  platform: PlatformKey;
  total: number;
  mentioned: number;
  mentionRate: number;
  avgPosition: number;
  sentimentBreakdown: { pozitif: number; notr: number; negatif: number };
}

export interface PlatformPerformance {
  platforms: PlatformMetric[];
  bestPlatform: PlatformKey | null;
  worstPlatform: PlatformKey | null;
}

// ─── 6. Question Type Analysis ─────────────────────

export interface QuestionTypeMetric {
  category: string; // lokasyon, urun, karsilastirma, oneri, fiyat, yorum, genel, uzmanlik, itibar
  total: number;
  mentioned: number;
  mentionRate: number;
  avgPosition: number;
}

export interface QuestionTypeAnalysis {
  categories: QuestionTypeMetric[];
  bestCategory: string | null;
  worstCategory: string | null;
}

// ─── 7. Sentiment Tracking ─────────────────────────

export interface SentimentWeek {
  week: number;
  year: number;
  pozitif: number;
  notr: number;
  negatif: number;
  total: number;
  positiveRate: number; // 0-1
}

export interface SentimentTracking {
  current: SentimentWeek;
  previous: SentimentWeek | null;
  trend: "improving" | "declining" | "stable";
  weeks: SentimentWeek[];
}

// ─── 8. Google Organic Ranking ─────────────────────

export interface GoogleRankingEntry {
  promptText: string;
  position: string | null;
  mentioned: boolean;
  hasAIOverview: boolean;
  citationSources: Array<{ name: string; url: string; type: string }>;
}

export interface GoogleRanking {
  totalQueries: number;
  mentionedInAIO: number;
  aioMentionRate: number;
  avgPosition: number;
  entries: GoogleRankingEntry[];
}

// ─── Combined Metrics ──────────────────────────────

export interface AllMetrics {
  mentionRateTrend: MentionRateTrend;
  positionTrend: PositionTrend;
  sourceMap: SourceMap;
  shareOfVoice: ShareOfVoice;
  platformPerformance: PlatformPerformance;
  questionTypeAnalysis: QuestionTypeAnalysis;
  sentimentTracking: SentimentTracking;
  googleRanking: GoogleRanking;
  calculatedAt: Date;
}

// ─── Weekly Report (Opus output) ───────────────────

export interface WeeklyReportData {
  weeklyScore: number;
  previousScore: number;
  trend: "rising" | "falling" | "stable";
  highlights: string[];
  concerns: string[];
  correlations: Array<{
    event: string;
    metric: string;
    confidence: "high" | "medium" | "low";
  }>;
  nextActions: string[];
}
