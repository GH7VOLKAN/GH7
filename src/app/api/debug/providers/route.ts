import { NextResponse } from "next/server";

/**
 * GET /api/debug/providers
 * Quick diagnostic — shows which AI providers are available and tests each one.
 * DELETE THIS FILE AFTER DEBUGGING.
 */
export async function GET() {
  const envCheck = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    GOOGLE_AI_API_KEY: !!process.env.GOOGLE_AI_API_KEY,
    PERPLEXITY_API_KEY: !!process.env.PERPLEXITY_API_KEY,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
  };

  // Quick live test: send a tiny prompt to each available provider
  const tests: Record<string, { ok: boolean; chars?: number; error?: string; ms: number }> = {};

  // Test OpenAI
  if (process.env.OPENAI_API_KEY) {
    const start = Date.now();
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Merhaba, 1+1=?" }],
          max_tokens: 20,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok) {
        tests.chatgpt = { ok: false, error: `HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`, ms: Date.now() - start };
      } else {
        const content = data.choices?.[0]?.message?.content ?? "";
        tests.chatgpt = { ok: true, chars: content.length, ms: Date.now() - start };
      }
    } catch (err) {
      tests.chatgpt = { ok: false, error: err instanceof Error ? err.message : "Unknown", ms: Date.now() - start };
    }
  } else {
    tests.chatgpt = { ok: false, error: "OPENAI_API_KEY not set", ms: 0 };
  }

  // Test Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    const start = Date.now();
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2024-10-22",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          messages: [{ role: "user", content: "Merhaba, 1+1=?" }],
          max_tokens: 20,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok) {
        tests.claude = { ok: false, error: `HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`, ms: Date.now() - start };
      } else {
        const content = data.content?.[0]?.text ?? "";
        tests.claude = { ok: true, chars: content.length, ms: Date.now() - start };
      }
    } catch (err) {
      tests.claude = { ok: false, error: err instanceof Error ? err.message : "Unknown", ms: Date.now() - start };
    }
  } else {
    tests.claude = { ok: false, error: "ANTHROPIC_API_KEY not set", ms: 0 };
  }

  // Test Google Gemini
  if (process.env.GOOGLE_AI_API_KEY) {
    const start = Date.now();
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Merhaba, 1+1=?" }] }],
            generationConfig: { maxOutputTokens: 20 },
          }),
          signal: AbortSignal.timeout(15000),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        tests.gemini = { ok: false, error: `HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`, ms: Date.now() - start };
      } else {
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        tests.gemini = { ok: true, chars: content.length, ms: Date.now() - start };
      }
    } catch (err) {
      tests.gemini = { ok: false, error: err instanceof Error ? err.message : "Unknown", ms: Date.now() - start };
    }
  } else {
    tests.gemini = { ok: false, error: "GOOGLE_AI_API_KEY not set", ms: 0 };
  }

  // Test Perplexity
  if (process.env.PERPLEXITY_API_KEY) {
    const start = Date.now();
    try {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [{ role: "user", content: "Merhaba, 1+1=?" }],
          max_tokens: 20,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok) {
        tests.perplexity = { ok: false, error: `HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`, ms: Date.now() - start };
      } else {
        const content = data.choices?.[0]?.message?.content ?? "";
        tests.perplexity = { ok: true, chars: content.length, ms: Date.now() - start };
      }
    } catch (err) {
      tests.perplexity = { ok: false, error: err instanceof Error ? err.message : "Unknown", ms: Date.now() - start };
    }
  } else {
    tests.perplexity = { ok: false, error: "PERPLEXITY_API_KEY not set", ms: 0 };
  }

  // Test Groq
  if (process.env.GROQ_API_KEY) {
    const start = Date.now();
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: "Merhaba, 1+1=?" }],
          max_tokens: 20,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok) {
        tests.groq = { ok: false, error: `HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`, ms: Date.now() - start };
      } else {
        const content = data.choices?.[0]?.message?.content ?? "";
        tests.groq = { ok: true, chars: content.length, ms: Date.now() - start };
      }
    } catch (err) {
      tests.groq = { ok: false, error: err instanceof Error ? err.message : "Unknown", ms: Date.now() - start };
    }
  } else {
    tests.groq = { ok: false, error: "GROQ_API_KEY not set", ms: 0 };
  }

  const allOk = Object.values(tests).every((t) => t.ok);

  return NextResponse.json({
    status: allOk ? "ALL_OK" : "SOME_FAILED",
    envVars: envCheck,
    liveTests: tests,
    timestamp: new Date().toISOString(),
  });
}
