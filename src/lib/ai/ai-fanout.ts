/**
 * 5 AI paralel sorgulama. Mevcut multi-ai-fanout'un sadeleşmiş hali.
 * Her provider ayrı try/catch, Promise.allSettled, tek bir AI fail olsa diğerleri döner.
 *
 * Provider'lar:
 *   - chatgpt: OpenAI gpt-4o-search-preview
 *   - claude: Anthropic sonnet-4
 *   - gemini: Google gemini-1.5-flash
 *   - perplexity: Sonar
 *   - google_aio: SerpAPI (env yoksa skip, error döner)
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { querySonar } from "./sonar-research";
import type { AIAnswer, AIProvider } from "@/lib/analiz/types";
import { AI_PROVIDERS } from "@/lib/analiz/types";

export interface FanoutQueryResult {
  queryId: string;
  queryText: string;
  answers: Array<Omit<AIAnswer, "mentionedYou" | "mentionedCompetitors">>;
}

export async function fanoutQueries(
  queries: Array<{ id: string; text: string }>,
): Promise<FanoutQueryResult[]> {
  const tasks = queries.flatMap((q) =>
    AI_PROVIDERS.map((provider) =>
      callProvider(provider, q.text).then((answer) => ({ queryId: q.id, answer })),
    ),
  );

  const settled = await Promise.allSettled(tasks);
  const byQuery = new Map<string, FanoutQueryResult["answers"]>();

  for (const r of settled) {
    if (r.status === "fulfilled") {
      const { queryId, answer } = r.value;
      if (!byQuery.has(queryId)) byQuery.set(queryId, []);
      byQuery.get(queryId)!.push(answer);
    }
  }

  return queries.map((q) => ({
    queryId: q.id,
    queryText: q.text,
    answers: byQuery.get(q.id) ?? [],
  }));
}

async function callProvider(
  provider: AIProvider,
  query: string,
): Promise<Omit<AIAnswer, "mentionedYou" | "mentionedCompetitors">> {
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
        text = await querySonar(query);
        break;
      case "google_aio":
        text = await callGoogleAIO(query);
        break;
    }
    return { provider, text, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      provider,
      text: "",
      error: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - start,
    };
  }
}

async function callChatGPT(query: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: "gpt-4o-search-preview",
    messages: [{ role: "user", content: query }],
    max_tokens: 800,
  });
  return response.choices[0]?.message?.content ?? "";
}

async function callClaude(query: string): Promise<string> {
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [{ role: "user", content: query }],
  });
  const block = response.content[0];
  return block?.type === "text" ? block.text : "";
}

async function callGemini(query: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(query);
  return result.response.text();
}

async function callGoogleAIO(query: string): Promise<string> {
  const apiKey = process.env.SERPAPI_KEY || process.env.SERP_API_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY missing");
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", "tr");
  url.searchParams.set("gl", "tr");
  url.searchParams.set("api_key", apiKey);
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`SerpAPI ${res.status}`);
  const data = await res.json();
  if (data.ai_overview?.text_blocks) {
    return (data.ai_overview.text_blocks as Array<{ snippet?: string }>)
      .map((b) => b.snippet ?? "")
      .filter(Boolean)
      .join("\n\n");
  }
  if (data.answer_box?.snippet) return String(data.answer_box.snippet);
  if (data.knowledge_graph?.description) return String(data.knowledge_graph.description);
  const organics = Array.isArray(data.organic_results)
    ? (data.organic_results as Array<{ title?: string; snippet?: string }>).slice(0, 3)
    : [];
  return organics.map((o) => `${o.title ?? ""}: ${o.snippet ?? ""}`).join("\n");
}
