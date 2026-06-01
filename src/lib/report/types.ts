/**
 * Generic, product-agnostic Report model ("ambalaj").
 * Every product/engine emits this exact shape; the renderer maps
 * section.type -> component and never knows which product produced it.
 */

export type Lang = "tr" | "en";

export type SourceClass = "own" | "comp" | "neutral";

export interface Source {
  domain: string;
  count: number;
  klass: SourceClass;
}

export interface EngineVisibility {
  /** Display label, e.g. "ChatGPT", "Google" */
  name: string;
  /** 0-100 visibility percentage */
  pct: number;
  /** Average rank when it appears; null if it never appears */
  avgPos: number | null;
  note?: string;
}

export interface CompetitorRow {
  name: string;
  /** Where it beats the brand, e.g. "Claude, Perplexity" */
  where: string;
  note?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface GapItem {
  query: string;
  diagnosis: string;
  contentGap: string[];
  faq: FaqItem[];
  /** Ready-to-paste JSON-LD (a full <script> block or raw JSON string) */
  jsonLd: string;
  actions: string[];
}

export type Section =
  | { type: "summary"; title: string; body: string }
  | { type: "visibility"; title: string; engines: EngineVisibility[] }
  | { type: "competitors"; title: string; rows: CompetitorRow[] }
  | { type: "sourceMap"; title: string; sources: Source[] }
  | { type: "gaps"; title: string; items: GapItem[] };

export type SectionType = Section["type"];

export interface Report {
  brand: string;
  /** White-label logo; defaults to GH7 branding when absent */
  logoUrl?: string;
  product: string;
  /** ISO date string */
  date: string;
  lang: Lang;
  sections: Section[];
}
