import type { PlatformKey } from "@/lib/types";

export interface AIResponse {
  platform: PlatformKey;
  content: string;
  citations?: string[];
  error?: string;
}

export interface AnalysisResult {
  mentioned: boolean;
  position: string | null;
  sentiment: string | null;
  excerpt: string | null;
  citations: string[];
}
