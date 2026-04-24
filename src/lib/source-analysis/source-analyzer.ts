/**
 * Kaynak analyzer — Brief N v4 Aşama 6.
 *
 * Fetch edilmiş bir kaynağın metninde marka + rakip varlığı ve kalite
 * sinyallerini çıkarır. Türkçe normalize ile eşleştirme yapılır.
 */

import { normalizeTurkish } from "@/lib/ai/analyzer";
import type { FetchResult } from "./url-fetcher";

export type SourceAnalysisOutcome = {
  status: "analyzed" | "unreachable";
  mentionsBrand: boolean;
  mentionedCompetitors: string[];
  qualitySignals: {
    hasImages: boolean;
    hasReviews: boolean;
    hasRating: boolean;
    textLength: number;
  };
  reason?: string;
};

const REVIEW_RE = /review|yorum|değerlendirme|degerlendirme|reviews?/i;
const RATING_RE = /\d[.,]\d\s*\/\s*(?:5|10)|★{1,}|\d{1,2}\s*\/\s*10|stars?\s*\d/i;

function brandVariants(brandName: string, aliases: string[]): string[] {
  const all = [brandName, ...aliases].map((s) => s.trim()).filter(Boolean);
  return [...new Set(all.map((s) => normalizeTurkish(s)))];
}

function containsAny(normalizedText: string, terms: string[]): boolean {
  return terms.some((t) => t.length >= 2 && normalizedText.includes(t));
}

/**
 * Fetch sonucu + marka + rakip listesinden analiz üretir.
 * Unreachable ise status=unreachable + neutral; analyzed ise match.
 */
export function analyzeFetchedSource(
  fetchResult: FetchResult,
  brandName: string,
  brandAliases: string[],
  competitors: Array<{ name: string }>,
): SourceAnalysisOutcome {
  if (fetchResult.status === "unreachable") {
    return {
      status: "unreachable",
      mentionsBrand: false,
      mentionedCompetitors: [],
      qualitySignals: {
        hasImages: false,
        hasReviews: false,
        hasRating: false,
        textLength: 0,
      },
      reason: fetchResult.reason,
    };
  }

  const rawText = fetchResult.text;
  const normalized = normalizeTurkish(rawText);

  // Brand match
  const brandTerms = brandVariants(brandName, brandAliases);
  const mentionsBrand = containsAny(normalized, brandTerms);

  // Rakip match
  const mentionedCompetitors: string[] = [];
  for (const c of competitors) {
    const normCompetitor = normalizeTurkish(c.name);
    if (normCompetitor.length >= 2 && normalized.includes(normCompetitor)) {
      mentionedCompetitors.push(c.name);
    }
  }

  return {
    status: "analyzed",
    mentionsBrand,
    mentionedCompetitors,
    qualitySignals: {
      hasImages: fetchResult.hasImages,
      hasReviews: REVIEW_RE.test(rawText),
      hasRating: RATING_RE.test(rawText),
      textLength: rawText.length,
    },
  };
}
