/**
 * /analiz akışı için tip tanımları (Shazam refactor).
 */

export type Door = "firma" | "kisi" | "eticaret" | "yurtdisi";

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
// Analyze input
// ═══════════════════════════════════════════════════════════

export interface AnalyzeInput {
  door: Door;

  // firma, eticaret, yurtdisi için
  domain?: string;

  // kişi için
  fullName?: string;
  city?: string;

  // yurtdışı için
  targetMarket?: string;
  targetLanguage?: string;

  forceRefresh?: boolean;
}

// ═══════════════════════════════════════════════════════════
// Firm profile (Perplexity deep context'ten çıkar)
// ═══════════════════════════════════════════════════════════

export interface FirmProfile {
  name: string;                 // "İda Villa Bungalov"
  sector: string;               // "Turizm ve Konaklama"
  location: {
    city?: string;
    district?: string;
    country?: string;
  };
  products: string[];           // 3-5, ham ürün/hizmet isimleri
  distinctives: string[];       // 3-5, ayırt edici nişler (pet-friendly, mandalina bahçesi)
  rawContext: string;           // Perplexity'nin tam ham analizi — Opus'a veriliyor
  contextQuality: "rich" | "thin" | "empty";
}

// ═══════════════════════════════════════════════════════════
// Query + Answer
// ═══════════════════════════════════════════════════════════

export interface AIAnswer {
  provider: AIProvider;
  text: string;                 // full markdown, truncate yok
  error?: string;
  latencyMs: number;
  mentionedYou: boolean;
  mentionedCompetitors: string[];
}

export interface AnalysisQuery {
  id: string;                   // q1, q2, ...
  text: string;
  generation: 1 | 2;            // ilk geçiş mi self-heal mi
  answers: AIAnswer[];
}

// ═══════════════════════════════════════════════════════════
// Extraction output
// ═══════════════════════════════════════════════════════════

export interface CandidateCompetitor {
  name: string;
  url: string | null;
  mentionCount: number;
  queryIds: string[];
  providers: AIProvider[];
}

export interface UserBrandMention {
  totalMentions: number;
  byQuery: Record<string, AIProvider[]>;
}

// ═══════════════════════════════════════════════════════════
// Full analyze response
// ═══════════════════════════════════════════════════════════

export interface AnalyzeResult {
  firmProfile: FirmProfile;
  queries: AnalysisQuery[];
  userMentions: UserBrandMention;
  candidateCompetitors: CandidateCompetitor[];
  healingAttempted: boolean;
  commentary: string; // Opus özet analizi, markdown
  generatedAt: string;
  cached: boolean;
}

// ═══════════════════════════════════════════════════════════
// Flow state
// ═══════════════════════════════════════════════════════════

export type FlowPhase = "input" | "verifying" | "analyzing" | "result" | "error";

export type SelectedCompetitor = {
  name: string;
  url: string | null;
  isNew: boolean;               // kullanıcı manuel eklediyse true
};

export interface ProgressStep {
  key: string;
  label: string;
  status: "pending" | "running" | "done" | "failed";
  detail?: string;
}
