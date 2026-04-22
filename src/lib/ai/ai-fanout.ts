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

  // Responses API — yeni nesil OpenAI endpoint'i, built-in web_search tool destekli.
  // Eski chat.completions + gpt-4o-search-preview modeli deprecated yolu;
  // chatgpt.com'daki search kalitesine ulaşmak için bu gerekli.
  const response = await client.responses.create({
    model: "gpt-4.1",
    input: query,
    tools: [{ type: "web_search_preview" } as unknown as OpenAI.Responses.Tool],
  });

  // Responses API çıktısı: output_text kısayolu veya output[] dizisi.
  if (typeof response.output_text === "string" && response.output_text.length > 0) {
    return response.output_text;
  }

  const debugShape = {
    hasOutput: Array.isArray((response as unknown as { output?: unknown[] }).output),
    outputTextType: typeof response.output_text,
    outputTextLen: typeof response.output_text === "string" ? response.output_text.length : 0,
    status: (response as unknown as { status?: string }).status,
    incomplete: (response as unknown as { incomplete_details?: unknown }).incomplete_details,
  };
  console.warn("[fanout] ChatGPT output_text empty:", JSON.stringify(debugShape));

  // Fallback: output dizisinden text block'ları topla
  const output = (response as unknown as { output?: Array<unknown> }).output;
  if (Array.isArray(output)) {
    const texts: string[] = [];
    for (const item of output) {
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;
      if (obj.type === "message" && Array.isArray(obj.content)) {
        for (const c of obj.content) {
          if (c && typeof c === "object" && (c as { type?: string }).type === "output_text") {
            const txt = (c as { text?: string }).text;
            if (typeof txt === "string") texts.push(txt);
          }
        }
      }
    }
    return texts.join("\n\n");
  }

  return "";
}

async function callClaude(query: string): Promise<string> {
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: query }],
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5,
      } as unknown as Anthropic.Tool,
    ],
  });

  // Tool-use cevaplarında text block'ları topla
  const textBlocks = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n\n");

  return textBlocks;
}

async function callGemini(query: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const client = new GoogleGenerativeAI(apiKey);

  // gemini-1.5+ için yeni grounding spec: googleSearch (retrieval DEĞİL).
  // Önce yeni spec'i dene; başarısız olursa eski googleSearchRetrieval'a düş.
  try {
    const model = client.getGenerativeModel({
      model: "gemini-flash-latest",
      tools: [{ googleSearch: {} } as unknown as object],
    });
    const result = await model.generateContent(query);
    return result.response.text();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[fanout] Gemini googleSearch failed, trying googleSearchRetrieval:", msg.slice(0, 150));

    try {
      const fallbackModel = client.getGenerativeModel({
        model: "gemini-flash-latest",
        tools: [{ googleSearchRetrieval: {} } as unknown as object],
      });
      const result = await fallbackModel.generateContent(query);
      return result.response.text();
    } catch {
      console.warn("[fanout] Gemini grounding tamamen başarısız, plain call yapılıyor");
      const plainModel = client.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await plainModel.generateContent(query);
      return result.response.text();
    }
  }
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
