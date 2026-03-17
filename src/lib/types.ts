export type PlatformKey = "chatgpt" | "claude" | "gemini" | "perplexity" | "groq";
export type SourceType = "kurumsal" | "dizin" | "ugc" | "referans" | "medya";
export type CheckStatus = "pass" | "fail" | "partial";
export type Priority = "high" | "medium" | "low";
export type Sentiment = "pozitif" | "nötr" | "negatif";

export const platformLabels: Record<PlatformKey, { name: string; company: string }> = {
  chatgpt: { name: "ChatGPT", company: "OpenAI" },
  claude: { name: "Claude", company: "Anthropic" },
  gemini: { name: "Gemini", company: "Google" },
  perplexity: { name: "Perplexity", company: "Perplexity AI" },
  groq: { name: "Groq (Llama)", company: "Meta / Groq" },
};

export const sourceTypeLabels: Record<SourceType, string> = {
  kurumsal: "Kurumsal",
  dizin: "Dizin",
  ugc: "UGC",
  referans: "Referans",
  medya: "Medya",
};
