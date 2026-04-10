/**
 * Qwen Client — Alibaba Cloud Model Studio (Frankfurt EU)
 *
 * Free kullanıcılar için maliyet optimizasyonu.
 * Workspace-specific endpoint, OpenAI SDK uyumlu.
 * Maliyet: Sonnet'in ~%10'u
 */

import OpenAI from "openai";

let _client: OpenAI | null = null;

function getQwenClient(): OpenAI | null {
  if (_client) return _client;

  const apiKey = process.env.DASHSCOPE_API_KEY;
  const baseURL = process.env.DASHSCOPE_BASE_URL;

  if (!apiKey || !baseURL) return null;

  _client = new OpenAI({
    apiKey,
    baseURL,
    timeout: 30_000,
  });
  return _client;
}

export async function callQwen(params: {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  const client = getQwenClient();
  if (!client) return null;

  const model = process.env.DASHSCOPE_MODEL || "qwen-plus";

  try {
    const response = await client.chat.completions.create({
      model,
      max_tokens: params.maxTokens ?? 2048,
      temperature: params.temperature ?? 0.7,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userMessage },
      ],
    });

    return response.choices[0]?.message?.content ?? null;
  } catch (error) {
    console.error("[qwen] API error:", error);
    return null;
  }
}

export function isQwenAvailable(): boolean {
  return !!(process.env.DASHSCOPE_API_KEY && process.env.DASHSCOPE_BASE_URL);
}
