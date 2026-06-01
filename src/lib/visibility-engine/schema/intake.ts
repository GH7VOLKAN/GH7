export type BusinessModel =
  | 'local_service' // serves a city/region, location matters in queries
  | 'national_product' // sells products across the country, geo-agnostic
  | 'national_b2b' // project/B2B across the country
  | 'mixed';

export type GeographyMode = 'local' | 'national' | 'global';

export type Audience = 'b2c' | 'b2b';

/**
 * Structured understanding of a business, auto-derived from its website.
 * businessModel + geographyMode are MANDATORY and drive query geography —
 * this is the guard against generating wrong-scope queries.
 */
export interface Intake {
  businessName: string;
  brand: string;
  brandDomain: string;
  summary: string;
  categories: string[];
  useCases: string[];
  channels: string[];
  audiences: Audience[];
  businessModel: BusinessModel;
  geographyMode: GeographyMode;
  /** Cities/regions if local; country/region if national. */
  locations: string[];
  language: string;
  /** e.g. "first in Turkey", "#1 manufacturer" — AEO authority signals. */
  authorityClaims: string[];
  /** AI-guessed competitors to VERIFY — never treated as confirmed. */
  candidateCompetitors: string[];
  confidence: 'high' | 'medium' | 'low';
  uncertaintyNotes: string;
}

/**
 * A single query, value-tagged. Every query must be one a real near-buyer
 * would actually type to an AI assistant, AND one whose natural answer would
 * name a vendor/product/solution (so visibility is measurable + sale-linked).
 */
export interface QueryItem {
  query: string;
  /** decision (B2C buying) | sourcing (B2B vendor) | comparison | reputation */
  intent: 'decision' | 'sourcing' | 'comparison' | 'reputation';
  /** Which product/project line a win here would sell. */
  revenueLine: string;
}

export interface QueryPlan {
  /** The business goal these queries serve (e.g. "product + project sales"). */
  goal: string;
  queries: QueryItem[];
}
