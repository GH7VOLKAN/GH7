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
  return allProviders.filter((p) => p.isAvailable());
}

export function getAvailablePlatforms(): PlatformKey[] {
  return getAvailableProviders().map((p) => p.platform);
}
