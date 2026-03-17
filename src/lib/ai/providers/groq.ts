import type { AIProvider } from "./base";
import type { AIResponse } from "../types";

export class GroqProvider implements AIProvider {
  platform = "groq" as const;
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY ?? null;
  }

  isAvailable(): boolean {
    return this.apiKey !== null;
  }

  async sendPrompt(promptText: string): Promise<AIResponse> {
    if (!this.apiKey) {
      return { platform: "groq", content: "", error: "API key not configured" };
    }

    // Groq uses OpenAI-compatible API
    const models = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile"];

    for (const model of models) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: promptText }],
            max_tokens: 2048,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(30_000),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          const msg = `HTTP ${res.status}: ${errText.slice(0, 200)}`;
          console.warn(`[groq-provider] ${model} failed: ${msg}`);
          // Rate limit or model not found → try next model
          if (res.status === 429 || res.status === 404) continue;
          return { platform: "groq", content: "", error: msg };
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content ?? "";

        return { platform: "groq", content };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.warn(`[groq-provider] ${model} failed: ${msg}`);
        continue;
      }
    }

    return {
      platform: "groq",
      content: "",
      error: "All Groq models failed",
    };
  }
}
