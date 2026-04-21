/**
 * /analiz akışı için tip tanımları.
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

export type FlowPhase =
  | "detecting"
  | "picking"
  | "analyzing"
  | "done"
  | "error";

export type ProgressStep = {
  key: string;
  label: string;
  status: "pending" | "running" | "done";
  detail?: string;
};
