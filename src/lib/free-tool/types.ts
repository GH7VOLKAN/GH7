export type FreeToolMode = "kisisel" | "firma";

export interface FreeToolInput {
  mode: FreeToolMode;
  name: string; // ad-soyad or firma adı
  field: string; // meslek or sektör
  city: string;
}

export type PlatformId = "chatgpt" | "claude" | "gemini" | "perplexity";

export interface PlatformResult {
  platform: PlatformId;
  label: string;
  found: boolean;
  excerpt: string;
}

export interface FreeToolResult {
  input: FreeToolInput;
  platforms: PlatformResult[];
  score: number; // kaç platform buldu (0-4)
  blurredInsights: {
    alternativesTeaser: string;
    whyNotTeaser: string;
    weeklyTrackingTeaser: string;
  };
}
