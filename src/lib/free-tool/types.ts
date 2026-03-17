export type FreeToolMode = "kisisel" | "firma";

export interface FreeToolInput {
  mode: FreeToolMode;
  name: string;
  field: string;
  city: string;
}

export type PlatformId = "chatgpt" | "claude" | "gemini" | "perplexity" | "groq";

export interface PlatformResult {
  platform: PlatformId;
  label: string;
  found: boolean;
  excerpt: string; // cleaned, no markdown
  fullResponse: string; // full cleaned response for evidence display
  sentiment: "pozitif" | "nötr" | "negatif";
  position: string; // "İlk yanıtta", "2. sırada", "Detaylarda", "Bahsedilmiyor"
  positionRaw: string | null; // "1. sıra", "2. sıra", etc.
  visibilityScore: number; // 0-100
  citations: string[]; // source URLs
}

export interface CompetitorPreview {
  name: string;
  score: number;
  platforms?: string[]; // which platforms mentioned this competitor
}

export interface FreeToolResult {
  input: FreeToolInput;
  platforms: PlatformResult[];
  promptUsed: string; // the actual prompt sent to AI platforms
  score: number; // kaç platform buldu (0-4)
  overallScore: number; // 0-100 genel AI görünürlük skoru
  scoreLabel: string; // "Düşük" | "Orta" | "İyi" | "Mükemmel"
  sectorAverage: number; // sektör ortalaması
  freeInsights: string[]; // 3 ücretsiz içgörü
  competitors: CompetitorPreview[]; // up to 10 competitors
  whyNotFound: string[]; // neden tanınmıyor nedenleri
  actionItems: string[]; // aksiyon planı maddeleri
}
