import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider } from "./base";
import type { AIResponse } from "../types";

export class AnthropicProvider implements AIProvider {
  platform = "claude" as const;
  private client: Anthropic | null;

  constructor() {
    // Use GH7_ANTHROPIC_API_KEY first (avoids clash with Claude Code's own env),
    // then fall back to ANTHROPIC_API_KEY if it has a real value.
    const key = process.env.GH7_ANTHROPIC_API_KEY
      || (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 0
        ? process.env.ANTHROPIC_API_KEY
        : undefined);
    this.client = key ? new Anthropic({ apiKey: key, timeout: 30_000 }) : null;
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async sendPrompt(promptText: string): Promise<AIResponse> {
    if (!this.client) {
      return { platform: "claude", content: "", error: "API key not configured" };
    }

    const errors: string[] = [];
    const model = "claude-haiku-4-5-20251001";

    // Step 1: Try with web_search tool for real-time results
    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: 2048,
        temperature: 0.7,
        tools: [
          {
            type: "web_search_20250305" as never,
            name: "web_search",
            max_uses: 3,
          } as never,
        ],
        messages: [{ role: "user", content: promptText }],
      });

      const text = this.extractTextContent(response);
      if (text) {
        return { platform: "claude", content: text };
      }
      errors.push(`${model} with web_search returned empty`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[anthropic-provider] ${model} with web_search failed: ${msg}`);
      errors.push(`${model}+web_search: ${msg}`);
    }

    // Step 2: Fallback WITHOUT web_search tool (must work if API key is valid)
    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: 2048,
        temperature: 0.7,
        messages: [{ role: "user", content: promptText }],
      });

      const text = this.extractTextContent(response);
      if (text) {
        return { platform: "claude", content: text };
      }
      errors.push(`${model} without web_search returned empty`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[anthropic-provider] ${model} fallback (no web_search) failed: ${msg}`);
      errors.push(`${model}: ${msg}`);
    }

    console.error(`[anthropic-provider] All attempts failed. Errors: ${errors.join(" | ")}`);
    return {
      platform: "claude",
      content: "",
      error: `All Claude models failed: ${errors.join(" | ")}`,
    };
  }

  private extractTextContent(response: Anthropic.Message): string {
    // Extract text from both regular text blocks and web_search result blocks
    const parts: string[] = [];

    for (const block of response.content) {
      if (block.type === "text") {
        parts.push(block.text);
      }
      // web_search tool results may produce text blocks already,
      // but handle any other content block types gracefully
    }

    return parts.join("\n");
  }
}
