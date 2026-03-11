import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult } from "./types";

const SYSTEM_PROMPT = `Sen bir marka bahsedilme analizcisisin. Bir AI platformunun verdiği yanıtı analiz edip markanın nasıl bahsedildiğini belirle.

JSON formatında yanıt ver (başka bir şey yazma):
{
  "mentioned": boolean,
  "position": "1. sıra" | "2. sıra" | "3. sıra" | "bahsediliyor" | null,
  "sentiment": "pozitif" | "nötr" | "negatif",
  "excerpt": "en fazla 200 karakter, markanın bahsedildiği kısım",
  "citations": ["url1", "url2"]
}

Kurallar:
- "1. sıra": Marka ilk önerilen veya ilk bahsedilen
- "2. sıra": İkinci sırada
- "3. sıra": Üçüncü sırada
- "bahsediliyor": Sıralı listede değil ama bahsediliyor
- position null: Hiç bahsedilmiyorsa
- citations: Yanıtta URL varsa listele, yoksa boş array`;

export async function analyzeResponse(
  rawResponse: string,
  brandName: string,
  _promptText: string,
): Promise<AnalysisResult> {
  // Stage 1: Quick regex pre-check
  const lowerResponse = rawResponse.toLowerCase();
  const lowerBrand = brandName.toLowerCase();

  if (!lowerResponse.includes(lowerBrand)) {
    return {
      mentioned: false,
      position: null,
      sentiment: null,
      excerpt: null,
      citations: extractUrls(rawResponse),
    };
  }

  // Stage 2: Use Claude Haiku for detailed analysis
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback: brand name found but no API key for analysis
    const excerpt = extractExcerpt(rawResponse, brandName);
    return {
      mentioned: true,
      position: "bahsediliyor",
      sentiment: "nötr",
      excerpt,
      citations: extractUrls(rawResponse),
    };
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Marka: "${brandName}"\n\nAI Platformunun Yanıtı:\n${rawResponse.slice(0, 3000)}`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = JSON.parse(text) as AnalysisResult;

    return {
      mentioned: parsed.mentioned ?? true,
      position: parsed.position ?? "bahsediliyor",
      sentiment: parsed.sentiment ?? "nötr",
      excerpt: parsed.excerpt?.slice(0, 200) ?? extractExcerpt(rawResponse, brandName),
      citations: [
        ...new Set([
          ...(parsed.citations ?? []),
          ...extractUrls(rawResponse),
        ]),
      ],
    };
  } catch {
    // Fallback if analysis fails
    return {
      mentioned: true,
      position: "bahsediliyor",
      sentiment: "nötr",
      excerpt: extractExcerpt(rawResponse, brandName),
      citations: extractUrls(rawResponse),
    };
  }
}

function extractExcerpt(text: string, brandName: string): string {
  const idx = text.toLowerCase().indexOf(brandName.toLowerCase());
  if (idx === -1) return text.slice(0, 200);
  const start = Math.max(0, idx - 50);
  const end = Math.min(text.length, idx + brandName.length + 150);
  return (start > 0 ? "..." : "") + text.slice(start, end) + (end < text.length ? "..." : "");
}

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s)>"'\]]+/g;
  return [...new Set(text.match(urlRegex) ?? [])];
}
