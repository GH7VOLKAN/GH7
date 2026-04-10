/**
 * Qwen2.5-72B Client — OpenAI-compatible API
 *
 * Free kullanıcılar için maliyet optimizasyonu.
 * Together.ai veya Fireworks.ai üzerinden Qwen2.5-72B-Instruct kullanır.
 * OpenAI SDK ile %100 uyumlu — sadece baseURL ve model adı farklı.
 *
 * Maliyet: ~$0.0003/1K input, ~$0.0008/1K output (Sonnet'in ~%10'u)
 */

import OpenAI from "openai";

// Together.ai Qwen2.5-72B
const TOGETHER_BASE_URL = "https://api.together.xyz/v1";
const TOGETHER_MODEL = "Qwen/Qwen2.5-72B-Instruct-Turbo";

// Fireworks.ai alternatif
const FIREWORKS_BASE_URL = "https://api.fireworks.ai/inference/v1";
const FIREWORKS_MODEL = "accounts/fireworks/models/qwen2p5-72b-instruct";

let _client: OpenAI | null = null;

function getQwenClient(): OpenAI | null {
  if (_client) return _client;

  // Together.ai öncelikli
  const togetherKey = process.env.TOGETHER_API_KEY;
  if (togetherKey) {
    _client = new OpenAI({
      apiKey: togetherKey,
      baseURL: TOGETHER_BASE_URL,
      timeout: 30_000,
    });
    return _client;
  }

  // Fireworks.ai fallback
  const fireworksKey = process.env.FIREWORKS_API_KEY;
  if (fireworksKey) {
    _client = new OpenAI({
      apiKey: fireworksKey,
      baseURL: FIREWORKS_BASE_URL,
      timeout: 30_000,
    });
    return _client;
  }

  return null;
}

function getModelName(): string {
  if (process.env.TOGETHER_API_KEY) return TOGETHER_MODEL;
  if (process.env.FIREWORKS_API_KEY) return FIREWORKS_MODEL;
  return TOGETHER_MODEL;
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
  if (!client) return null; // Qwen yapılandırılmamış — Claude'a fallback

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
    return null; // Hata durumunda null dön — Claude'a fallback
  }
}

/**
 * Qwen mevcut mu kontrol et.
 */
export function isQwenAvailable(): boolean {
  return !!(process.env.TOGETHER_API_KEY || process.env.FIREWORKS_API_KEY);
}
