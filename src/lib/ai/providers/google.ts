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

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
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
      return {
        platform: "gemini",
        content: "",
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
}
