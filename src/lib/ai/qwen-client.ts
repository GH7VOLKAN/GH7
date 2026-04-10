/**
 * Qwen2.5 Client — DashScope (Alibaba Cloud) OpenAI-compatible API
 *
 * Free kullanıcılar için maliyet optimizasyonu.
 * DashScope doğrudan Qwen API'si — aracı yok, en düşük maliyet.
 * OpenAI SDK ile %100 uyumlu — sadece baseURL ve model adı farklı.
 *
 * Maliyet: ~$0.0003/1K input, ~$0.0008/1K output (Sonnet'in ~%10'u)
 */

import OpenAI from "openai";

// DashScope (Alibaba Cloud) — Qwen'in kendi API'si
const DASHSCOPE_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const DASHSCOPE_MODEL = "qwen-plus"; // Qwen-Plus: iyi kalite, düşük maliyet

// Together.ai alternatif
const TOGETHER_BASE_URL = "https://api.together.xyz/v1";
const TOGETHER_MODEL = "Qwen/Qwen2.5-72B-Instruct-Turbo";

let _client: OpenAI | null = null;

function getQwenClient(): OpenAI | null {
  if (_client) return _client;

  // DashScope öncelikli (doğrudan Qwen API)
  const dashscopeKey = process.env.DASHSCOPE_API_KEY;
  if (dashscopeKey) {
    _client = new OpenAI({
      apiKey: dashscopeKey,
      baseURL: DASHSCOPE_BASE_URL,
      timeout: 30_000,
    });
    return _client;
  }

  // Together.ai fallback
  const togetherKey = process.env.TOGETHER_API_KEY;
  if (togetherKey) {
    _client = new OpenAI({
      apiKey: togetherKey,
      baseURL: TOGETHER_BASE_URL,
      timeout: 30_000,
    });
    return _client;
  }

  return null;
}

function getModelName(): string {
  if (process.env.DASHSCOPE_API_KEY) return DASHSCOPE_MODEL;
  if (process.env.TOGETHER_API_KEY) return TOGETHER_MODEL;
  return DASHSCOPE_MODEL;
}

/**
 * Qwen ile metin üret.
 * Claude ile aynı interface — system prompt + user message → text response.
 * Qwen yoksa null döner (caller Claude'a fallback yapmalı).
 */
export async function callQwen(params: {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  const client = getQwenClient();
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model: getModelName(),
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

/**
 * Qwen mevcut mu kontrol et.
 */
export function isQwenAvailable(): boolean {
  return !!(process.env.DASHSCOPE_API_KEY || process.env.TOGETHER_API_KEY);
}
