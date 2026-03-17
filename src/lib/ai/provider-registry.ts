import type { PlatformKey } from "@/lib/types";
import type { AIProvider } from "./providers/base";
import { AnthropicProvider } from "./providers/anthropic";
import { PerplexityProvider } from "./providers/perplexity";
import { OpenAIProvider } from "./providers/openai";
import { GoogleProvider } from "./providers/google";

const allProviders: AIProvider[] = [
  new OpenAIProvider(),
  new AnthropicProvider(),
  new GoogleProvider(),
  new PerplexityProvider(),
];

export function getAvailableProviders(): AIProvider[] {
  const available = allProviders.filter((p) => p.isAvailable());
  const unavailable = allProviders.filter((p) => !p.isAvailable());

  if (unavailable.length > 0) {
    console.warn(
      `[provider-registry] UNAVAILABLE providers (missing API keys): ${unavailable.map((p) => p.platform).join(", ")}`,
    );
    console.warn(
      `[provider-registry] Check env vars: OPENAI_API_KEY=${!!process.env.OPENAI_API_KEY}, ANTHROPIC_API_KEY=${!!process.env.ANTHROPIC_API_KEY}, GOOGLE_AI_API_KEY=${!!process.env.GOOGLE_AI_API_KEY}, PERPLEXITY_API_KEY=${!!process.env.PERPLEXITY_API_KEY}`,
    );
  }
  console.log(
    `[provider-registry] Available: ${available.map((p) => p.platform).join(", ")} (${available.length}/${allProviders.length})`,
  );

  return available;
}

export function getAvailablePlatforms(): PlatformKey[] {
  return getAvailableProviders().map((p) => p.platform);
}
