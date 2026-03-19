import { GoogleGenerativeAI, DynamicRetrievalMode } from "@google/generative-ai";
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

    const errors: string[] = [];

    // Step 1: Try gemini-2.0-flash with Google Search grounding
    try {
      const content = await this.tryModel("gemini-2.0-flash", promptText, true);
      if (content.length > 0) {
        return { platform: "gemini", content };
      }
      errors.push("gemini-2.0-flash with grounding returned empty");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[gemini-provider] gemini-2.0-flash with grounding failed: ${msg}`);
      errors.push(`gemini-2.0-flash+grounding: ${msg}`);
    }

    // Step 2: Try gemini-2.0-flash WITHOUT grounding (in case grounding causes error)
    try {
      const content = await this.tryModel("gemini-2.0-flash", promptText, false);
      if (content.length > 0) {
        return { platform: "gemini", content };
      }
      errors.push("gemini-2.0-flash without grounding returned empty");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[gemini-provider] gemini-2.0-flash without grounding failed: ${msg}`);
      errors.push(`gemini-2.0-flash: ${msg}`);
    }

    // Step 3: Fallback to gemini-1.5-flash (stable, no grounding)
    try {
      const content = await this.tryModel("gemini-1.5-flash", promptText, false);
      if (content.length > 0) {
        return { platform: "gemini", content };
      }
      errors.push("gemini-1.5-flash returned empty");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[gemini-provider] gemini-1.5-flash fallback failed: ${msg}`);
      errors.push(`gemini-1.5-flash: ${msg}`);
    }

    console.error(`[gemini-provider] All models failed. Errors: ${errors.join(" | ")}`);
    return {
      platform: "gemini",
      content: "",
      error: `All Gemini models failed: ${errors.join(" | ")}`,
    };
  }

  private async tryModel(modelName: string, promptText: string, useGrounding: boolean): Promise<string> {
    if (!this.genAI) throw new Error("genAI not initialized");

    const modelOptions: Record<string, unknown> = {
      model: modelName,
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
    };

    if (useGrounding) {
      modelOptions.tools = [
        {
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: DynamicRetrievalMode.MODE_DYNAMIC,
              dynamicThreshold: 0.3,
            },
          },
        },
      ];
    }

    const model = this.genAI.getGenerativeModel(
      modelOptions as unknown as Parameters<typeof this.genAI.getGenerativeModel>[0],
    );

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini API timeout (30s) for ${modelName}`)), 30_000)
    );

    const result = await Promise.race([
      model.generateContent(promptText),
      timeoutPromise,
    ]);

    return result.response.text();
  }
}
