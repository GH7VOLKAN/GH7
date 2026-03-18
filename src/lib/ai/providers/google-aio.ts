import type { AIProvider } from "./base";
import type { AIResponse } from "../types";

export class GoogleAIOProvider implements AIProvider {
  platform = "google_aio" as const;
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.SERPAPI_KEY ?? null;
  }

  isAvailable(): boolean {
    return this.apiKey !== null;
  }

  async sendPrompt(promptText: string): Promise<AIResponse> {
    if (!this.apiKey) {
      return { platform: "google_aio", content: "", error: "SERPAPI_KEY not configured" };
    }

    try {
      const params = new URLSearchParams({
        q: promptText,
        engine: "google",
        hl: "tr",
        gl: "tr",
        api_key: this.apiKey,
      });

      const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
        method: "GET",
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        const msg = `HTTP ${res.status}: ${errText.slice(0, 200)}`;
        console.warn(`[google-aio-provider] SerpAPI request failed: ${msg}`);
        return { platform: "google_aio", content: "", error: msg };
      }

      const data = await res.json();

      // Extract AI Overview content from various possible response fields
      const content = this.extractAIOverview(data);

      return { platform: "google_aio", content };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.warn(`[google-aio-provider] Failed: ${msg}`);
      return { platform: "google_aio", content: "", error: msg };
    }
  }

  private extractAIOverview(data: Record<string, unknown>): string {
    // 1. Try ai_overview field (Google's AI-generated summary)
    if (data.ai_overview) {
      const aiOverview = data.ai_overview as Record<string, unknown>;
      if (typeof aiOverview.text === "string") return aiOverview.text;
      if (typeof aiOverview.text_blocks === "object" && Array.isArray(aiOverview.text_blocks)) {
        const texts = aiOverview.text_blocks
          .map((block: Record<string, unknown>) => {
            if (typeof block.text === "string") return block.text;
            if (typeof block.snippet === "string") return block.snippet;
            return "";
          })
          .filter(Boolean);
        if (texts.length > 0) return texts.join("\n\n");
      }
      // Try stringifying if it's a non-empty object
      const str = JSON.stringify(aiOverview);
      if (str && str !== "{}") return str;
    }

    // 2. Try answer_box field
    if (data.answer_box) {
      const answerBox = data.answer_box as Record<string, unknown>;
      if (typeof answerBox.answer === "string") return answerBox.answer;
      if (typeof answerBox.snippet === "string") return answerBox.snippet;
      if (typeof answerBox.result === "string") return answerBox.result;
      if (typeof answerBox.contents?.toString === "function" && typeof answerBox.contents === "string") {
        return answerBox.contents;
      }
    }

    // 3. Try knowledge_graph field
    if (data.knowledge_graph) {
      const kg = data.knowledge_graph as Record<string, unknown>;
      const parts: string[] = [];
      if (typeof kg.title === "string") parts.push(kg.title);
      if (typeof kg.description === "string") parts.push(kg.description);
      if (typeof kg.snippet === "string") parts.push(kg.snippet);
      if (parts.length > 0) return parts.join("\n\n");
    }

    // No AI overview content found — return empty (not an error)
    return "";
  }
}
