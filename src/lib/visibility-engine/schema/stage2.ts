export type SourceClass = 'own' | 'competitor' | 'neutral';

export interface ClassifiedSource {
  domain: string;
  count: number;
  klass: SourceClass;
}

/** Per-query read of where the brand stands across engines. */
export interface QueryVerdict {
  query: string;
  enginesAppeared: string[];
  enginesLost: string[];
  avgPosition: number | null;
  /** Competitor URLs that AI cited for this query (the out-content targets). */
  citedCompetitorUrls: string[];
  /** Severity score for prioritization (lost engines + competitor citations). */
  severity: number;
}

/** Concrete, page-specific content gap + ready-to-use assets for one query. */
export interface QueryGap {
  query: string;
  diagnosis: string;
  contentGap: string[];
  faq: { q: string; a: string }[];
  jsonLd: string;
  pageActions: string[];
}

export interface Stage2Overview {
  summary: string;
  citedVsRecommended: string;
  sourceReading: { own: string; competitor: string; neutral: string };
  mainLever: string;
  neutralSourcePlan: string[];
}
