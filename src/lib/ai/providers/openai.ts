import OpenAI from "openai";
import type { ChatCompletion } from "openai/resources/chat/completions";
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
        let response: ChatCompletion;

        if (model.webSearch) {
          // Web search model: no temperature, add web_search_options
          response = await this.client.chat.completions.create({
            model: model.name,
            max_tokens: 2048,
            stream: false,
            messages: [{ role: "user", content: promptText }],
            web_search_options: { search_context_size: "high" },
          } as Parameters<typeof this.client.chat.completions.create>[0]) as ChatCompletion;
        } else {
          // Standard model
          response = await this.client.chat.completions.create({
            model: model.name,
            max_tokens: 2048,
            temperature: 0.7,
            stream: false,
            messages: [{ role: "user", content: promptText }],
          });
        }

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
