import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider } from "./base";
import type { AIResponse } from "../types";

export class AnthropicProvider implements AIProvider {
  platform = "claude" as const;
  private client: Anthropic | null;

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY;
    this.client = key ? new Anthropic({ apiKey: key }) : null;
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async sendPrompt(promptText: string): Promise<AIResponse> {
    if (!this.client) {
      return { platform: "claude", content: "", error: "API key not configured" };
    }

    try {
      const response = await this.client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [{ role: "user", content: promptText }],
      });

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");

      return { platform: "claude", content: text };
    } catch (err) {
      return {
        platform: "claude",
        content: "",
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
}
