export type FreeToolMode = "kisisel" | "firma";

export interface FreeToolInput {
  mode: FreeToolMode;
  name: string;
  field: string;
  city: string;
}

export type PlatformId = "chatgpt" | "claude" | "gemini" | "perplexity";

export interface PlatformResult {
  platform: PlatformId;
  label: string;
  found: boolean;
  excerpt: string;
  sentiment: "pozitif" | "nötr" | "negatif";
  position: string; // "İlk yanıtta", "2. sırada", "Detaylarda", "Bahsedilmiyor"
  visibilityScore: number; // 0-100
}

export interface CompetitorPreview {
  name: string;
  score: number;
}

export interface FreeToolResult {
  input: FreeToolInput;
  platforms: PlatformResult[];
  score: number; // kaç platform buldu (0-4)
  overallScore: number; // 0-100 genel AI görünürlük skoru
  scoreLabel: string; // "Düşük" | "Orta" | "İyi" | "Mükemmel"
  sectorAverage: number; // sektör ortalaması
  freeInsights: string[]; // 3 ücretsiz içgörü
  competitors: CompetitorPreview[]; // 3 rakip (blur'lu gösterilecek)
}
