import type { AIProvider } from "./base";
import type { AIResponse } from "../types";

export class GoogleProvider implements AIProvider {
  platform = "gemini" as const;

  isAvailable(): boolean {
    return !!process.env.GOOGLE_AI_API_KEY;
  }

  async sendPrompt(_promptText: string): Promise<AIResponse> {
    return {
      platform: "gemini",
      content: "",
      error: "Google AI API key not configured",
    };
  }
}
