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

export interface AnalysisResult {
  mentioned: boolean;
  position: string | null;
  sentiment: string | null;
  excerpt: string | null;
  citations: string[];
  competitors: string[];
  citationSources: CitationSource[];
}
