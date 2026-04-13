/**
 * Platform traffic benchmarks: estimated monthly visits per mention.
 *
 * These are rough industry estimates for how many visits a single mention
 * on each AI platform can drive. Based on platform user base size and
 * click-through behavior patterns.
 *
 * Configurable — can be refined with real Google Analytics data in the future.
 */
export const PLATFORM_TRAFFIC: Record<string, number> = {
  chatgpt: 50,     // Largest user base, highest mention value
  claude: 20,      // Growing but smaller user base
  gemini: 35,      // Google integration gives broader reach
  perplexity: 30,  // Search-focused, high intent users
  google_aio: 40,  // Direct Google Search integration
};

export const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "Google AIO",
};
