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

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 2048,
        temperature: 0.7,
        messages: [{ role: "user", content: promptText }],
      });

      const content = response.choices[0]?.message?.content ?? "";

      return { platform: "chatgpt", content };
    } catch (err) {
      return {
        platform: "chatgpt",
        content: "",
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
}
