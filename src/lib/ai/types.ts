import type { PlatformKey } from "@/lib/types";

export interface AIResponse {
  platform: PlatformKey;
  content: string;
  citations?: string[];
  error?: string;
}

export interface CitationSource {
  name: string;
  url: string;
  type: "website" | "directory" | "social" | "news" | "review" | "other";
}

export interface CompetitorDetail {
  name: string;
  position: string | null;
  sentiment: string;
}

export interface AnalysisResult {
  mentioned: boolean;
  mentionType: "direct" | "indirect" | "none";
  position: string | null;
  sentiment: string | null;
  excerpt: string | null;
  citations: string[];
  competitors: string[] | CompetitorDetail[];
  citationSources: CitationSource[];
  mentionContext: string | null;
  competitorAdvantage: string | null;
}

/**
 * Extract competitor names from Prisma Json field.
 * Supports both old string[] format and new CompetitorDetail[] format.
 */
export function extractCompetitorNames(competitors: unknown): string[] {
  if (!Array.isArray(competitors)) return [];
  return competitors
    .map((c: unknown) =>
      typeof c === "string" ? c : (c as { name?: string })?.name ?? "",
    )
    .filter(Boolean);
}
