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
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(promptText);
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
