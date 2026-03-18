import OpenAI from "openai";
import type { AIProvider } from "./base";
import type { AIResponse } from "../types";

export class OpenAIProvider implements AIProvider {
  platform = "chatgpt" as const;
  private client: OpenAI | null;

  constructor() {
    const key = process.env.OPENAI_API_KEY;
    this.client = key ? new OpenAI({ apiKey: key, timeout: 30_000 }) : null;
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async sendPrompt(promptText: string): Promise<AIResponse> {
    if (!this.client) {
      return { platform: "chatgpt", content: "", error: "API key not configured" };
    }

    // Try web search model first (like real ChatGPT experience), then fallback
    const models = [
      { name: "gpt-4o-search-preview", webSearch: true },
      { name: "gpt-4o-mini", webSearch: false },
    ];

    for (const model of models) {
      try {
        const params: Record<string, unknown> = {
          model: model.name,
          max_tokens: 2048,
          messages: [{ role: "user", content: promptText }],
        };

        // Web search model doesn't support temperature but supports web_search_options
        if (model.webSearch) {
          params.web_search_options = { search_context_size: "medium" };
        } else {
          params.temperature = 0.7;
        }

        const response = await this.client.chat.completions.create(
          params as Parameters<typeof this.client.chat.completions.create>[0],
        );

        const content = response.choices[0]?.message?.content ?? "";

        if (content.length > 0) {
          return { platform: "chatgpt", content };
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.warn(`[openai-provider] ${model.name} failed: ${msg}`);
        continue;
      }
    }

    return {
      platform: "chatgpt",
      content: "",
      error: "All ChatGPT models failed",
    };
  }
}
