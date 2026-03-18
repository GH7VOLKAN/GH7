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

    // Try models in order — fall back if one fails
    const models = ["claude-sonnet-4-20250514", "claude-haiku-4-5-20251001"];

    for (const model of models) {
      try {
        const response = await this.client.messages.create({
          model,
          max_tokens: 2048,
          temperature: 0.7,
          messages: [{ role: "user", content: promptText }],
        });

        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n");

        return { platform: "claude", content: text };
      } catch (err) {
        console.warn(`[anthropic-provider] ${model} failed:`, err instanceof Error ? err.message : err);
        // Try next model
        continue;
      }
    }

    return {
      platform: "claude",
      content: "",
      error: "All Claude models failed",
    };
  }
}
