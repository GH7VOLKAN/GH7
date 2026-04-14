/**
 * Streaming wrappers for each AI provider.
 * Used by the Canlı AI Savaşı feature for real-time response display.
 *
 * Each function returns an AsyncGenerator that yields text chunks as they arrive.
 * Google AIO (SerpAPI) doesn't support streaming — returns full response at once.
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── OpenAI (ChatGPT) ────────────────────────────────────

export async function* streamOpenAI(question: string): AsyncGenerator<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not configured");

  const client = new OpenAI({ apiKey: key, timeout: 30_000 });

  // Use gpt-4o-mini for streaming (gpt-4o-search-preview doesn't support streaming well)
  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1500,
    temperature: 0.7,
    stream: true,
    messages: [{ role: "user", content: question }],
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}

// ── Anthropic (Claude) ──────────────────────────────────

export async function* streamAnthropic(question: string): AsyncGenerator<string> {
  const key =
    process.env.GH7_ANTHROPIC_API_KEY ||
    (process.env.ANTHROPIC_API_KEY?.length ? process.env.ANTHROPIC_API_KEY : undefined);
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");

  const client = new Anthropic({ apiKey: key, timeout: 30_000 });

  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    temperature: 0.7,
    messages: [{ role: "user", content: question }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

// ── Google (Gemini) ─────────────────────────────────────

export async function* streamGemini(question: string): AsyncGenerator<string> {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error("GOOGLE_AI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
  });

  const result = await model.generateContentStream(question);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

// ── Perplexity ──────────────────────────────────────────

export async function* streamPerplexity(question: string): AsyncGenerator<string> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error("PERPLEXITY_API_KEY not configured");

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: question }],
      max_tokens: 1500,
      temperature: 0.7,
      stream: true,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Perplexity HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        // Skip malformed JSON
      }
    }
  }
}

// ── Google AIO (SerpAPI) — No streaming ─────────────────

export async function fetchGoogleAIO(question: string): Promise<string> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return "[Google AIO API anahtarı yapılandırılmamış]";

  const params = new URLSearchParams({
    engine: "google",
    q: question,
    api_key: key,
    hl: "tr",
    gl: "tr",
  });

  const res = await fetch(`https://serpapi.com/search.json?${params}`, {
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return "[Google AIO yanıt vermedi]";

  const data = await res.json();

  // Extract AI overview or answer box
  if (data.ai_overview?.text_blocks) {
    return data.ai_overview.text_blocks
      .map((b: { snippet?: string; text?: string }) => b.snippet || b.text || "")
      .filter(Boolean)
      .join(" ");
  }

  if (data.answer_box?.snippet) return data.answer_box.snippet;
  if (data.answer_box?.answer) return data.answer_box.answer;

  if (data.knowledge_graph?.description) return data.knowledge_graph.description;

  // Fallback: first 3 organic results
  if (data.organic_results?.length) {
    return data.organic_results
      .slice(0, 3)
      .map((r: { snippet?: string }) => r.snippet ?? "")
      .filter(Boolean)
      .join(" ");
  }

  return "[Google AIO sonuç bulunamadı]";
}
