import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider } from "./base";
import type { AIResponse } from "../types";

export class GoogleProvider implements AIProvider {
  platform = "gemini" as const;
  private genAI: GoogleGenerativeAI | null;

  constructor() {
    const key = process.env.GOOGLE_AI_API_KEY;
    this.genAI = key ? new GoogleGenerativeAI(key) : null;
  }

  isAvailable(): boolean {
    return this.genAI !== null;
  }

  async sendPrompt(promptText: string): Promise<AIResponse> {
    if (!this.genAI) {
      return { platform: "gemini", content: "", error: "API key not configured" };
    }

    // Try models in order — fall back on quota/rate limit errors
    const models = ["gemini-2.5-flash", "gemini-2.0-flash-lite"];

    for (const modelName of models) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
        });

        // Wrap with timeout since Google SDK doesn't have built-in timeout
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API timeout (30s)")), 30_000)
        );

        const result = await Promise.race([
          model.generateContent(promptText),
          timeoutPromise,
        ]);

        const content = result.response.text();

        return { platform: "gemini", content };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.warn(`[gemini-provider] ${modelName} failed: ${msg}`);
        // If rate limited (429), try next model
        if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
          continue;
        }
        // Other errors — don't retry
        return { platform: "gemini", content: "", error: msg };
      }
    }

    return {
      platform: "gemini",
      content: "",
      error: "All Gemini models failed (quota exceeded — check Google AI billing)",
    };
  }
}
