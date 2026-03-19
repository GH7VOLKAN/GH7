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
      const text = this.parseAIOverviewField(data.ai_overview);
      if (text) return text;
    }

    // 2. Try answer_box field
    if (data.answer_box) {
      const answerBox = data.answer_box as Record<string, unknown>;
      if (typeof answerBox.answer === "string") return answerBox.answer;
      if (typeof answerBox.snippet === "string") return answerBox.snippet;
      if (typeof answerBox.result === "string") return answerBox.result;
      if (typeof answerBox.contents === "string") return answerBox.contents;
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

    // 4. Try organic_results as last resort (extract snippets)
    if (Array.isArray(data.organic_results) && data.organic_results.length > 0) {
      const snippets = (data.organic_results as Record<string, unknown>[])
        .slice(0, 3)
        .map((r) => typeof r.snippet === "string" ? r.snippet : "")
        .filter(Boolean);
      if (snippets.length > 0) return snippets.join("\n\n");
    }

    // No content found — return empty (not an error)
    console.warn("[google-aio-provider] No AI overview content found in SerpAPI response. Keys:", Object.keys(data).join(", "));
    return "";
  }

  /** Recursively extract text from the ai_overview object, which can be deeply nested */
  private parseAIOverviewField(raw: unknown): string {
    // Direct string
    if (typeof raw === "string") return raw;

    // Not an object — skip
    if (!raw || typeof raw !== "object") return "";

    const obj = raw as Record<string, unknown>;

    // If it has a direct "text" string field
    if (typeof obj.text === "string" && obj.text.length > 0) return obj.text;

    // If it has "snippet" string field
    if (typeof obj.snippet === "string" && obj.snippet.length > 0) return obj.snippet;

    // If it has text_blocks array — extract text from each block recursively
    if (Array.isArray(obj.text_blocks)) {
      const texts = obj.text_blocks
        .map((block: unknown) => this.parseAIOverviewBlock(block))
        .filter(Boolean);
      if (texts.length > 0) return texts.join("\n\n");
    }

    // If it has "references" or "list" with items
    if (Array.isArray(obj.references)) {
      const refs = obj.references
        .map((r: unknown) => this.parseAIOverviewBlock(r))
        .filter(Boolean);
      if (refs.length > 0) return refs.join("\n\n");
    }

    // Try "answer" field
    if (typeof obj.answer === "string" && obj.answer.length > 0) return obj.answer;

    // Walk all string values as last resort (but NEVER return raw JSON)
    const allTexts: string[] = [];
    for (const value of Object.values(obj)) {
      if (typeof value === "string" && value.length > 10) {
        allTexts.push(value);
      }
    }
    if (allTexts.length > 0) return allTexts.join("\n\n");

    // Do NOT fall back to JSON.stringify — that's what caused the raw JSON bug
    return "";
  }

  private parseAIOverviewBlock(block: unknown): string {
    if (typeof block === "string") return block;
    if (!block || typeof block !== "object") return "";

    const b = block as Record<string, unknown>;
    if (typeof b.text === "string") return b.text;
    if (typeof b.snippet === "string") return b.snippet;
    if (typeof b.title === "string" && typeof b.snippet === "string") {
      return `${b.title}: ${b.snippet}`;
    }
    if (typeof b.title === "string") return b.title;

    // Handle nested list items
    if (Array.isArray(b.list)) {
      const items = b.list
        .map((item: unknown) => (typeof item === "string" ? item : typeof item === "object" && item ? ((item as Record<string, unknown>).text as string) ?? "" : ""))
        .filter(Boolean);
      if (items.length > 0) return items.join("\n");
    }

    return "";
  }
}
