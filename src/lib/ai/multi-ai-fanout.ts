/**
 * Multi-AI fanout — aynı sorguyu 5 AI'a paralel sorar, cevapları toplar.
 *
 * Platformlar:
 *   - ChatGPT (gpt-4o-search-preview) — web search ile
 *   - Claude (sonnet-4) — native
 *   - Gemini (1.5-flash) — native
 *   - Perplexity Sonar — sonar-research.ts üstünden
 *   - Google AI Overviews — SerpAPI üstünden (env var gerekli)
 *
 * Paralelizm: N query × 5 AI = 5N call, Promise.allSettled.
 * Hata toleransı: tek AI fail olsa flag'lenip cevap döner.
 * Latency hedefi: ~15-25sn (en yavaş AI).
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { querySonar } from "./sonar-research";

export type AIProvider =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "perplexity"
  | "google_aio";

export const AI_PROVIDERS: AIProvider[] = [
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
  "google_aio",
];

export interface AIAnswer {
  provider: AIProvider;
  text: string;
  error?: string;
  latencyMs: number;
}

export interface QueryWithAnswers {
  queryId: string;
  queryText: string;
  answers: AIAnswer[];
}

// ═══════════════════════════════════════════════════════════
// Public
// ═══════════════════════════════════════════════════════════

export async function fanoutQueries(
  queries: string[],
): Promise<QueryWithAnswers[]> {
  const tasks: Array<Promise<{ queryId: string; answer: AIAnswer }>> = [];

  queries.forEach((qText, i) => {
    const queryId = `q${i + 1}`;
    for (const provider of AI_PROVIDERS) {
      tasks.push(
        callProvider(provider, qText).then((answer) => ({ queryId, answer })),
      );
    }
  });

  const settled = await Promise.allSettled(tasks);

  // Gruplama: queryId → answers[]
  const byQuery = new Map<string, AIAnswer[]>();
  for (const result of settled) {
    if (result.status === "fulfilled") {
      const { queryId, answer } = result.value;
      if (!byQuery.has(queryId)) byQuery.set(queryId, []);
      byQuery.get(queryId)!.push(answer);
    }
    // rejected zaten callProvider içinde error field'a dönüşüyor
  }

  return queries.map((qText, i) => {
    const queryId = `q${i + 1}`;
    return {
      queryId,
      queryText: qText,
      answers: byQuery.get(queryId) ?? [],
    };
  });
}

// ═══════════════════════════════════════════════════════════
// Per-provider callers
// ═══════════════════════════════════════════════════════════

async function callProvider(
  provider: AIProvider,
  query: string,
): Promise<AIAnswer> {
  const start = Date.now();
  try {
    let text = "";
    switch (provider) {
      case "chatgpt":
        text = await callChatGPT(query);
        break;
      case "claude":
        text = await callClaude(query);
        break;
      case "gemini":
        text = await callGemini(query);
        break;
      case "perplexity":
        text = await callPerplexity(query);
        break;
      case "google_aio":
        text = await callGoogleAIO(query);
        break;
    }
    return { provider, text, latencyMs: Date.now() - start };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[fanout] ${provider} failed for "${query.slice(0, 40)}...":`, msg);
    return {
      provider,
      text: "",
      error: msg,
      latencyMs: Date.now() - start,
    };
  }
}

// ─── ChatGPT (with web search) ─────────────────────────────

async function callChatGPT(query: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const client = new OpenAI({ apiKey });

  // gpt-4o-search-preview ile web arama destekli cevap
  const response = await client.chat.completions.create({
    model: "gpt-4o-search-preview",
    messages: [{ role: "user", content: query }],
    max_tokens: 800,
  });

  return response.choices[0]?.message?.content ?? "";
}

// ─── Claude Sonnet ─────────────────────────────────────────

async function callClaude(query: string): Promise<string> {
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [{ role: "user", content: query }],
  });

  const block = response.content[0];
  return block?.type === "text" ? block.text : "";
}

// ─── Gemini Flash ──────────────────────────────────────────

async function callGemini(query: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(query);
  return result.response.text();
}

// ─── Perplexity Sonar ──────────────────────────────────────

async function callPerplexity(query: string): Promise<string> {
  // Mevcut querySonar wrapper'ını kullan — aynı API key, aynı retry
  return querySonar(query);
}

// ─── Google AI Overviews (SerpAPI) ─────────────────────────

async function callGoogleAIO(query: string): Promise<string> {
  const apiKey = process.env.SERPAPI_KEY || process.env.SERP_API_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_KEY not configured (Google AI Overviews skipped)");
  }

  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", "tr");
  url.searchParams.set("gl", "tr");
  url.searchParams.set("api_key", apiKey);

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`SerpAPI error: ${res.status}`);
  }

  const data = await res.json();

  // AI Overview text
  if (data.ai_overview?.text_blocks) {
    const blocks = data.ai_overview.text_blocks as Array<{ snippet?: string }>;
    return blocks.map((b) => b.snippet ?? "").filter(Boolean).join("\n\n");
  }

  // Fallback: answer_box veya knowledge_graph'taki metin
  if (data.answer_box?.answer) return String(data.answer_box.answer);
  if (data.answer_box?.snippet) return String(data.answer_box.snippet);
  if (data.knowledge_graph?.description)
    return String(data.knowledge_graph.description);

  // Son çare: ilk organik sonuçların snippet'i (AI Overview yoksa)
  const organics = Array.isArray(data.organic_results)
    ? (data.organic_results as Array<{ title?: string; snippet?: string }>).slice(0, 3)
    : [];
  return organics.map((o) => `${o.title ?? ""}: ${o.snippet ?? ""}`).join("\n");
}
