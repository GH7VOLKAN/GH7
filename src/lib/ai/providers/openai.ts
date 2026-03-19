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

    const errors: string[] = [];

    // Step 1: Try web search model (best experience)
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-search-preview",
        max_tokens: 2048,
        stream: false,
        messages: [{ role: "user", content: promptText }],
        web_search_options: { search_context_size: "high" },
      } as Parameters<typeof this.client.chat.completions.create>[0]) as ChatCompletion;

      const content = response.choices[0]?.message?.content ?? "";
      if (content.length > 0) {
        return { platform: "chatgpt", content };
      }
      errors.push("gpt-4o-search-preview returned empty content");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[openai-provider] gpt-4o-search-preview failed: ${msg}`);
      errors.push(`gpt-4o-search-preview: ${msg}`);
    }

    // Step 2: Fallback to gpt-4o-mini (no web search, always available)
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 2048,
        temperature: 0.7,
        stream: false,
        messages: [{ role: "user", content: promptText }],
      });

      const content = response.choices[0]?.message?.content ?? "";
      if (content.length > 0) {
        return { platform: "chatgpt", content };
      }
      errors.push("gpt-4o-mini returned empty content");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[openai-provider] gpt-4o-mini fallback failed: ${msg}`);
      errors.push(`gpt-4o-mini: ${msg}`);
    }

    // Step 3: Last resort — gpt-3.5-turbo (cheapest, most reliable)
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        max_tokens: 2048,
        temperature: 0.7,
        stream: false,
        messages: [{ role: "user", content: promptText }],
      });

      const content = response.choices[0]?.message?.content ?? "";
      if (content.length > 0) {
        return { platform: "chatgpt", content };
      }
      errors.push("gpt-3.5-turbo returned empty content");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[openai-provider] gpt-3.5-turbo last-resort failed: ${msg}`);
      errors.push(`gpt-3.5-turbo: ${msg}`);
    }

    console.error(`[openai-provider] All models failed. Errors: ${errors.join(" | ")}`);
    return {
      platform: "chatgpt",
      content: "",
      error: `All ChatGPT models failed: ${errors.join(" | ")}`,
    };
  }
}
