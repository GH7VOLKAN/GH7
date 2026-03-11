import type { AIProvider } from "./base";
import type { AIResponse } from "../types";

interface PerplexityChoice {
  message: { content: string };
}

interface PerplexityResponse {
  choices: PerplexityChoice[];
  citations?: string[];
}

export class PerplexityProvider implements AIProvider {
  platform = "perplexity" as const;
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY ?? null;
  }

  isAvailable(): boolean {
    return this.apiKey !== null;
  }

  async sendPrompt(promptText: string): Promise<AIResponse> {
    if (!this.apiKey) {
      return { platform: "perplexity", content: "", error: "API key not configured" };
    }

    try {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [{ role: "user", content: promptText }],
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return { platform: "perplexity", content: "", error: `HTTP ${res.status}: ${errText}` };
      }

      const data = (await res.json()) as PerplexityResponse;
      const content = data.choices?.[0]?.message?.content ?? "";
      const citations = data.citations ?? [];

      return { platform: "perplexity", content, citations };
    } catch (err) {
      return {
        platform: "perplexity",
        content: "",
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
}
