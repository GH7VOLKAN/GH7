/**
 * Canlı AI Savaşı — SSE Streaming Endpoint
 *
 * Sends the user's question to 5 AI platforms simultaneously and streams
 * responses back via Server-Sent Events. Each chunk includes the platform
 * name and text fragment for real-time display.
 */

import { NextRequest } from "next/server";
import {
  streamOpenAI,
  streamAnthropic,
  streamGemini,
  streamPerplexity,
  fetchGoogleAIO,
} from "@/lib/ai/providers/streaming";

export const runtime = "nodejs";
export const maxDuration = 60;

import { normalizeTurkish } from "@/lib/utils/turkish";

type PlatformKey = "chatgpt" | "claude" | "gemini" | "perplexity" | "google_aio";

export async function POST(request: NextRequest) {
  let body: { question?: string; brandName?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { question, brandName } = body;
  if (!question || !brandName) {
    return new Response("question and brandName required", { status: 400 });
  }

  // Sanitize inputs
  const cleanQuestion = question.slice(0, 500).trim();
  const cleanBrand = brandName.slice(0, 100).trim();
  const normalizedBrand = normalizeTurkish(cleanBrand);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      const platforms: { key: PlatformKey; label: string }[] = [
        { key: "chatgpt", label: "ChatGPT" },
        { key: "claude", label: "Claude" },
        { key: "gemini", label: "Gemini" },
        { key: "perplexity", label: "Perplexity" },
        { key: "google_aio", label: "Google AIO" },
      ];

      // Send start events
      for (const p of platforms) {
        send({ type: "start", platform: p.key });
      }

      const scores: Record<string, boolean> = {};

      // Run all platforms in parallel
      const tasks = platforms.map(async (p) => {
        let fullResponse = "";

        try {
          if (p.key === "google_aio") {
            // Google AIO doesn't support streaming
            const response = await fetchGoogleAIO(cleanQuestion);
            fullResponse = response;
            send({ type: "chunk", platform: p.key, text: response });
          } else {
            // Streaming providers
            const streamFn = {
              chatgpt: streamOpenAI,
              claude: streamAnthropic,
              gemini: streamGemini,
              perplexity: streamPerplexity,
            }[p.key];

            if (!streamFn) return;

            for await (const chunk of streamFn(cleanQuestion)) {
              fullResponse += chunk;
              send({ type: "chunk", platform: p.key, text: chunk });
            }
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Hata oluştu";
          console.error(`[canli-savas] ${p.key} error:`, errorMsg);
          if (!fullResponse) {
            fullResponse = `[${p.label} yanıt veremedi: ${errorMsg}]`;
            send({ type: "chunk", platform: p.key, text: fullResponse });
          }
        }

        // Detect brand mention (simple regex, no Claude analysis for speed)
        const mentioned = normalizedBrand.length > 0 &&
          normalizeTurkish(fullResponse).includes(normalizedBrand);
        scores[p.key] = mentioned;

        send({
          type: "done",
          platform: p.key,
          mentioned,
          fullResponse: fullResponse.slice(0, 3000),
        });
      });

      await Promise.allSettled(tasks);

      // Send final scores
      send({ type: "complete", scores });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
