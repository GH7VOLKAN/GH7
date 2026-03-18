export type PlatformKey = "chatgpt" | "claude" | "gemini" | "perplexity" | "google_aio";
export type SourceType = "kurumsal" | "dizin" | "ugc" | "referans" | "medya";
export type CheckStatus = "pass" | "fail" | "partial";
export type Priority = "high" | "medium" | "low";
export type Sentiment = "pozitif" | "nötr" | "negatif";

export const platformLabels: Record<PlatformKey, { name: string; company: string }> = {
  chatgpt: { name: "ChatGPT", company: "OpenAI" },
  claude: { name: "Claude", company: "Anthropic" },
  gemini: { name: "Gemini", company: "Google" },
  perplexity: { name: "Perplexity", company: "Perplexity AI" },
  google_aio: { name: "Google AIO", company: "Google" },
};

export const sourceTypeLabels: Record<SourceType, string> = {
  kurumsal: "Kurumsal",
  dizin: "Dizin",
  ugc: "UGC",
  referans: "Referans",
  medya: "Medya",
};
