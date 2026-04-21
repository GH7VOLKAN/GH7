/**
 * /analiz akışı için tip tanımları.
 *
 * v2 eklemeleri:
 * - RunResult (yeni ana shape)
 * - CandidateCompetitor (Opus'un çıkardığı adaylar)
 * - UserBrandMention (kendi marka skorlama)
 */

export type Door = "firma" | "kisi" | "eticaret" | "export";

export type AIProvider =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "perplexity"
  | "google_aio";

export const AI_PROVIDERS: AIProvider[] = [
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
  "google_aio",
];

export const AI_PROVIDER_LABELS: Record<AIProvider, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "Google AIO",
};

// ═══════════════════════════════════════════════════════════
// Detect (Aşama 2)
// ═══════════════════════════════════════════════════════════

export type Product = {
  id: string;
  name: string;
  subcatCount: number;
};

export type CompetitorMentions = Partial<Record<AIProvider, number>>;

export type Competitor = {
  id: string;
  domain: string;
  mentions: CompetitorMentions;
};

export type DetectResult = {
  domain: string;
  sector: string;
  products: Product[];
  competitorsByProductId: Record<string, Competitor[]>;
};

// ═══════════════════════════════════════════════════════════
// Run (Aşama 5 — yeni)
// ═══════════════════════════════════════════════════════════

export interface QueryAnswer {
  provider: AIProvider;
  text: string;
  error?: string;
  latencyMs: number;
  mentionedYou: boolean;
  mentionedCompetitors: string[]; // hangi rakipler bu cevapta geçti
}

export interface QueryResult {
  id: string;          // q1, q2, ...
  text: string;
  answers: QueryAnswer[];
}

export interface CandidateCompetitor {
  name: string;
  mentionCount: number;
  queryIds: string[];
  providers: AIProvider[];
  isNew?: boolean; // kullanıcı manuel eklediyse true — "bu hafta istatistik yok" badge
}

export interface UserBrandMention {
  totalMentions: number;
  byQuery: Record<string, AIProvider[]>;
}

export interface RunResult {
  yourDomain: string;
  yourBrandName: string;
  queries: QueryResult[];
  userMentions: UserBrandMention;
  candidateCompetitors: CandidateCompetitor[]; // frekans sıralı, 20 max
  generatedAt: string;
  cached: boolean;
}

// ═══════════════════════════════════════════════════════════
// Eski tipler (scoreboard mock için kullanılıyordu, backward compat)
// ═══════════════════════════════════════════════════════════

export type Answer = {
  provider: AIProvider;
  mentionedYou: boolean;
  mentionedThem: boolean;
  yourRank: number | null;
  text: string;
};

export type Query = {
  id: string;
  text: string;
  answers: Answer[];
};

export type AuditImpact = "high" | "medium" | "low";
export type AuditStatus = "yes" | "partial" | "no";

export type AuditItem = {
  id: string;
  title: string;
  group: string;
  impact: AuditImpact;
  you: AuditStatus;
  them: AuditStatus;
};

export type AnalysisResult = {
  yourDomain: string;
  yourBrandName: string;
  productName: string;
  competitorDomain: string;
  competitorBrandName: string;
  queries: Query[];
  audit: AuditItem[];
  cached: boolean;
  generatedAt: string;
};

// ═══════════════════════════════════════════════════════════
// Flow state
// ═══════════════════════════════════════════════════════════

export type FlowPhase =
  | "detecting"
  | "product-pick"
  | "cities-pick"
  | "running"
  | "competitor-pick"
  | "done"
  | "error";

export type ProgressStep = {
  key: string;
  label: string;
  status: "pending" | "running" | "done";
  detail?: string;
};
