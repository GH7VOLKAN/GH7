import type { AIProvider } from "./base";
import type { AIResponse } from "../types";

export class OpenAIProvider implements AIProvider {
  platform = "chatgpt" as const;

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async sendPrompt(_promptText: string): Promise<AIResponse> {
    return {
      platform: "chatgpt",
      content: "",
      error: "OpenAI API key not configured",
    };
  }
}
