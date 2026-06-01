export type Engine =
  | 'google_serp'
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'perplexity';

export interface Source {
  title: string;
  url: string;
}

export interface RankedItem {
  name: string;
  rank: number;
}

/** One single run of one engine for one query. */
export interface EngineResult {
  engine: Engine;
  query: string;
  runId: number;
  timestamp: string;
  brandAppears: boolean;
  position: number | null;
  ranked: RankedItem[];
  competitors: string[];
  sources: Source[];
  reasoning: string;
  notable: string;
  raw: unknown;
  error?: string;
}

/** The input: a business, its brand identifiers, competitors and query set. */
export interface QuerySet {
  business: string;
  /** Name to match for "does the brand appear" in chat answers. */
  brand: string;
  /** Domain to match for "does the brand appear" in Google SERP. */
  brandDomain?: string;
  competitors: string[];
  queries: string[];
}
