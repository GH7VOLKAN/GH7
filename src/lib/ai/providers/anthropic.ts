import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider } from "./base";
import type { AIResponse } from "../types";

export class AnthropicProvider implements AIProvider {
  platform = "claude" as const;
  private client: Anthropic | null;

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY;
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
    const models = ["claude-3-5-haiku-20241022", "claude-3-haiku-20240307"];

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
