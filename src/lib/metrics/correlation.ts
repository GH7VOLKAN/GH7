/**
 * GH7.ai — Correlation Engine
 *
 * Connects events (checklist completions, scans, source changes) to metric changes.
 *
 * IMPORTANT: Shows correlation, NOT causation.
 * "Bundan sonra bu oldu" — NOT "Bu yuzden bu oldu"
 */

import type { ChecklistItem, PromptResult, SourceDomain } from "@prisma/client";

// ─── Types ─────────────────────────────────────────

export interface CorrelationEvent {
  date: Date;
  type: "checklist_completed" | "scan_result" | "source_detected" | "mention_change";
  description: string;
  metricBefore?: number;
  metricAfter?: number;
}

export interface CorrelationInsight {
  event: string;
  metric: string;
  confidence: "high" | "medium" | "low";
  description: string;
}

export interface CorrelationTimeline {
  events: CorrelationEvent[];
  insights: CorrelationInsight[];
}

// ─── Helpers ───────────────────────────────────────

/** Check if date B is within N days after date A */
function isWithinDaysAfter(dateA: Date, dateB: Date, days: number): boolean {
  const diff = dateB.getTime() - dateA.getTime();
  return diff > 0 && diff <= days * 24 * 60 * 60 * 1000;
}

/** Calculate mention rate for a set of results */
function mentionRate(results: PromptResult[]): number {
  if (results.length === 0) return 0;
  return results.filter((r) => r.mentioned).length / results.length;
}

/** Get results within a date range */
function resultsInRange(
  results: PromptResult[],
  start: Date,
  end: Date,
): PromptResult[] {
  return results.filter(
    (r) => r.createdAt >= start && r.createdAt <= end,
  );
}

/** Get N days before a date */
function daysBefore(date: Date, days: number): Date {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}

/** Get N days after a date */
function daysAfter(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

// ─── Main Correlation Builder ──────────────────────

export function buildCorrelationTimeline(
  checklistItems: ChecklistItem[],
  scanResults: PromptResult[],
  sources: SourceDomain[],
): CorrelationTimeline {
  const events: CorrelationEvent[] = [];
  const insights: CorrelationInsight[] = [];

  // Sort results by date for efficient range queries
  const sortedResults = [...scanResults].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  // ─── 1. Checklist completion → mention rate change within 7 days ───

  const completedItems = checklistItems
    .filter((item) => item.userMarkedDone && item.completedAt)
    .sort((a, b) => (a.completedAt!.getTime()) - (b.completedAt!.getTime()));

  for (const item of completedItems) {
    const completedAt = item.completedAt!;

    // Get results from 7 days before and 7 days after completion
    const beforeResults = resultsInRange(
      sortedResults,
      daysBefore(completedAt, 7),
      completedAt,
    );
    const afterResults = resultsInRange(
      sortedResults,
      completedAt,
      daysAfter(completedAt, 7),
    );

    const rateBefore = mentionRate(beforeResults);
    const rateAfter = mentionRate(afterResults);

    events.push({
      date: completedAt,
      type: "checklist_completed",
      description: `"${item.simpleTitle}" tamamlandı`,
      metricBefore: Math.round(rateBefore * 100),
      metricAfter: Math.round(rateAfter * 100),
    });

    // Only generate insight if there's meaningful data and a notable change
    if (beforeResults.length >= 3 && afterResults.length >= 3) {
      const change = rateAfter - rateBefore;
      if (Math.abs(change) > 0.05) {
        const direction = change > 0 ? "arttı" : "azaldı";
        const confidence: "high" | "medium" | "low" =
          Math.abs(change) > 0.15 ? "high" : Math.abs(change) > 0.08 ? "medium" : "low";

        insights.push({
          event: `"${item.simpleTitle}" tamamlandı`,
          metric: `Mention rate %${Math.round(Math.abs(change) * 100)} ${direction}`,
          confidence,
          description: `${item.simpleTitle} tamamlandıktan sonra mention rate %${Math.round(rateBefore * 100)} → %${Math.round(rateAfter * 100)} oldu`,
        });
      }
    }
  }

  // ─── 2. New source detected → citation rate change ───

  const sortedSources = [...sources].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  for (const source of sortedSources) {
    const detectedAt = source.createdAt;

    events.push({
      date: detectedAt,
      type: "source_detected",
      description: `Yeni kaynak tespit edildi: ${source.domain} (${source.type})`,
    });

    // Check if citation sources mentioning this domain increased after detection
    const afterResults = resultsInRange(
      sortedResults,
      detectedAt,
      daysAfter(detectedAt, 14),
    );

    const citingThisSource = afterResults.filter((r) => {
      const citations = r.citationSources as Array<{ url: string }> | null;
      if (!citations || !Array.isArray(citations)) return false;
      return citations.some((c) => {
        try {
          return new URL(c.url).hostname.replace(/^www\./, "").includes(source.domain);
        } catch {
          return false;
        }
      });
    });

    if (citingThisSource.length > 0 && afterResults.length >= 3) {
      insights.push({
        event: `${source.domain} kaynak olarak tespit edildi`,
        metric: `Sonraki 2 haftada ${citingThisSource.length}/${afterResults.length} yanıtta kaynak olarak gosterildi`,
        confidence: citingThisSource.length >= 3 ? "high" : "medium",
        description: `${source.domain} kaynagi tespit edildikten sonra ${citingThisSource.length} yanıtta citation olarak kullanildi`,
      });
    }
  }

  // ─── 3. Significant mention rate changes between scan weeks ───

  const weekGroups = new Map<number, PromptResult[]>();
  for (const r of sortedResults) {
    const week = r.scanWeek ?? Math.ceil(
      ((r.createdAt.getTime() - new Date(r.createdAt.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7,
    );
    if (!weekGroups.has(week)) weekGroups.set(week, []);
    weekGroups.get(week)!.push(r);
  }

  const weekNumbers = [...weekGroups.keys()].sort((a, b) => a - b);

  for (let i = 1; i < weekNumbers.length; i++) {
    const prevWeek = weekNumbers[i - 1];
    const currWeek = weekNumbers[i];
    const prevResults = weekGroups.get(prevWeek)!;
    const currResults = weekGroups.get(currWeek)!;

    const prevRate = mentionRate(prevResults);
    const currRate = mentionRate(currResults);
    const change = currRate - prevRate;

    if (Math.abs(change) > 0.1 && prevResults.length >= 3 && currResults.length >= 3) {
      const direction = change > 0 ? "yukseldi" : "dustu";
      const lastResult = currResults[currResults.length - 1];

      events.push({
        date: lastResult.createdAt,
        type: "mention_change",
        description: `Hafta ${currWeek}: Mention rate %${Math.round(prevRate * 100)} → %${Math.round(currRate * 100)} (${direction})`,
        metricBefore: Math.round(prevRate * 100),
        metricAfter: Math.round(currRate * 100),
      });

      // Check if any checklist item was completed between these weeks
      const weekStart = prevResults[prevResults.length - 1]?.createdAt ?? new Date();
      const weekEnd = currResults[currResults.length - 1]?.createdAt ?? new Date();

      const recentCompletions = completedItems.filter(
        (item) => item.completedAt && item.completedAt >= weekStart && item.completedAt <= weekEnd,
      );

      if (recentCompletions.length > 0) {
        const names = recentCompletions.map((c) => c.simpleTitle).join(", ");
        insights.push({
          event: `Hafta ${prevWeek} → ${currWeek} gecisinde mention rate ${direction}`,
          metric: `%${Math.round(prevRate * 100)} → %${Math.round(currRate * 100)}`,
          confidence: Math.abs(change) > 0.2 ? "high" : "medium",
          description: `Bu donemde tamamlanan adimlar: ${names}. Mention rate ${direction}.`,
        });
      }
    }
  }

  // Sort events chronologically
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return { events, insights };
}
