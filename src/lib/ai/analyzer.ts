import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, CompetitorDetail } from "./types";

// Reuse Anthropic client across analysis calls
let _analyzerClient: Anthropic | null = null;
function getAnalyzerClient(apiKey: string): Anthropic {
  if (!_analyzerClient) {
    _analyzerClient = new Anthropic({ apiKey, timeout: 15_000 });
  }
  return _analyzerClient;
}

// ── Turkish character normalization ──────────────────
// Merkezi utility'den re-export. analyzer.test.ts bu dosyadan import ediyor.
import { normalizeTurkish } from "@/lib/utils/turkish";
export { normalizeTurkish };

// ── Regex-based position detection ───────────────────
// Detects numbered lists (1. Brand, 2. Brand) and bold headers (**Brand**)
// More reliable than LLM for position detection
function detectPositionFromText(
  rawText: string,
  brandName: string,
): string | null {
  const normBrand = normalizeTurkish(brandName);
  const lines = rawText.split("\n");

  // Pattern 1: Numbered list — "1. Brand", "1) Brand", "1- Brand"
  for (const line of lines) {
    const normLine = normalizeTurkish(line);
    if (!normLine.includes(normBrand)) continue;

    const numMatch = line.trim().match(/^(\d+)\s*[.):\-–]\s/);
    if (numMatch) {
      const n = parseInt(numMatch[1]);
      if (n === 1) return "1. sıra";
      if (n === 2) return "2. sıra";
      if (n === 3) return "3. sıra";
      return "bahsediliyor";
    }
  }

  // Pattern 2: Bold headers — **Brand** or **Brand:** in a list
  const boldPattern = /\*\*([^*]+)\*\*/g;
  const boldItems: string[] = [];
  let match;
  while ((match = boldPattern.exec(rawText)) !== null) {
    boldItems.push(match[1]);
  }

  for (let i = 0; i < boldItems.length; i++) {
    if (normalizeTurkish(boldItems[i]).includes(normBrand)) {
      if (i === 0) return "1. sıra";
      if (i === 1) return "2. sıra";
      if (i === 2) return "3. sıra";
      return "bahsediliyor";
    }
  }

  // Pattern 3: Comma-separated list after keywords
  // "öne çıkan firmalar: Brand1, Brand2, Brand3"
  const listKeywords =
    /(?:şunlardır|bunlardır|firmalar|şirketler|isimler|önerilerim|tavsiyelerim|arasında)\s*[:\s]+/gi;
  let keyMatch;
  while ((keyMatch = listKeywords.exec(rawText)) !== null) {
    const afterKeyword = rawText.slice(keyMatch.index! + keyMatch[0].length);
    // Get the first sentence/clause
    const clause = afterKeyword.split(/[.!?\n]/)[0] ?? "";
    const items = clause.split(/[,;]/);
    for (let i = 0; i < items.length && i < 3; i++) {
      if (normalizeTurkish(items[i]).includes(normBrand)) {
        if (i === 0) return "1. sıra";
        if (i === 1) return "2. sıra";
        if (i === 2) return "3. sıra";
      }
    }
  }

  return null;
}

const SYSTEM_PROMPT = `Sen bir marka bahsedilme analizcisisin. Bir AI platformunun verdiği yanıtı analiz edip markanın nasıl bahsedildiğini belirle.

JSON formatında yanıt ver (başka bir şey yazma):
{
  "mentioned": boolean,
  "mentionType": "direct" | "indirect" | "none",
  "position": "1. sıra" | "2. sıra" | "3. sıra" | "bahsediliyor" | null,
  "sentiment": "pozitif" | "nötr" | "negatif",
  "excerpt": "en fazla 200 karakter, markanın bahsedildiği kısım",
  "citations": ["url1", "url2"],
  "competitors": [{"name": "rakip adı", "position": "1. sıra|2. sıra|3. sıra|bahsediliyor|null", "sentiment": "pozitif|nötr|negatif"}],
  "citationSources": [{"name": "kaynak adı", "url": "https://...", "type": "website|directory|social|news|review|other"}],
  "mentionContext": "kısa alıntı — kullanıcının nerede ve nasıl bahsedildiğinin özeti",
  "competitorAdvantage": "rakip varsa neden önde bahsedildiğinin kısa analizi"
}

mentionType tanımları:
- "direct": Firma adı yanıtta açıkça geçiyor (büyük-küçük harf veya Türkçe karakter farkı olsa bile)
- "indirect": Firma adı geçmiyor AMA sektör/bölge/hizmet tanımı firma ile eşleşiyor (ör: "Ankara'daki kombi servisleri" firmanın sektörü ve bölgesiyle örtüşüyor)
- "none": Firma hiç bahsedilmiyor, dolaylı eşleşme de yok

Kurallar:
- "1. sıra": Marka yanıtta İLK önerilen, ilk listelenen veya ilk bahsedilen ise. Numaralı liste (1., 2., 3.) veya sıralı bahsetme fark etmez — ilk sırada ise "1. sıra".
- "2. sıra": Yanıtta İKİNCİ sırada önerilen veya bahsedilen
- "3. sıra": Yanıtta ÜÇÜNCÜ sırada önerilen veya bahsedilen
- "bahsediliyor": Listede sırası belirlenemiyorsa ama bir şekilde bahsediliyor
- position null: Hiç bahsedilmiyorsa
- citations: Yanıtta URL varsa listele, yoksa boş array
- competitors: Yanıtta bahsedilen DİĞER firma/kişi adları (takip edilen marka HARİÇ). Her rakip için ad, sıra ve duygu analizi ver. Listelenmiş, önerilen veya karşılaştırılan tüm rakipler.
- citationSources: Yanıttaki URL'lerin yapılandırılmış hali. type: website (kurumsal site), directory (dizin — doktortakvimi, yelp vb.), social (linkedin, instagram), news (haber), review (yorum sitesi), other
- mentionContext: Markanın nasıl bahsedildiğini özetleyen kısa bir cümle. Direkt bahsedilmede alıntı, dolaylı bahsedilmede eşleşme açıklaması.
- competitorAdvantage: Eğer rakip daha üst sırada bahsediliyorsa veya daha olumlu bağlamda geçiyorsa, sebebini kısaca açıkla. Yoksa null.
- ÖNEMLİ: Marka adı büyük-küçük harf veya Türkçe karakter farkıyla yazılmış olabilir (ör: "Isıtmax" = "ISITMAX"). Bu durumlar "direct" mentionType sayılır.
- ÖNEMLİ: Listeleme formatı farklı olabilir: numaralı (1. Marka), madde işaretli (• Marka), kalın (Marka:), virgülle ayrılmış (Marka1, Marka2). Hepsinde sırayı belirle.
- ÖNEMLİ: Dolaylı bahsedilme (indirect) tespitinde dikkatli ol. Sadece sektör + bölge + hizmet üçlüsü net eşleşiyorsa indirect de. Genel sektör bahsi yeterli değil.`;

export async function analyzeResponse(
  rawResponse: string,
  brandName: string,
  _promptText: string,
): Promise<AnalysisResult> {
  // Stage 1: Quick regex pre-check with Turkish normalization
  const normalizedResponse = normalizeTurkish(rawResponse);
  const normalizedBrand = normalizeTurkish(brandName);

  if (!normalizedResponse.includes(normalizedBrand)) {
    return {
      mentioned: false,
      mentionType: "none",
      position: null,
      sentiment: null,
      excerpt: null,
      citations: extractUrls(rawResponse),
      competitors: [],
      citationSources: [],
      mentionContext: null,
      competitorAdvantage: null,
    };
  }

  // Stage 1.5: Regex-based position detection (more reliable than LLM for this)
  const regexPosition = detectPositionFromText(rawResponse, brandName);

  // Stage 2: Use Claude Haiku for detailed analysis
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const excerpt = extractExcerpt(rawResponse, brandName);
    return {
      mentioned: true,
      mentionType: "direct",
      position: regexPosition ?? "bahsediliyor",
      sentiment: "nötr",
      excerpt,
      citations: extractUrls(rawResponse),
      competitors: [],
      citationSources: [],
      mentionContext: null,
      competitorAdvantage: null,
    };
  }

  try {
    const client = getAnalyzerClient(apiKey);
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      temperature: 0.7,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" }, // 5dk cache — batch'te %90 tasarruf
        },
      ],
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

    // Use regex position if Sonnet defaults to "bahsediliyor" but regex found a clear position
    let finalPosition = parsed.position ?? "bahsediliyor";
    if (
      (finalPosition === "bahsediliyor" || finalPosition === null) &&
      regexPosition
    ) {
      finalPosition = regexPosition;
    }

    // Normalize competitors: support both old string[] and new CompetitorDetail[] format
    const rawCompetitors = parsed.competitors ?? [];
    const normalizedCompetitors: CompetitorDetail[] = rawCompetitors.map(
      (c: string | CompetitorDetail) =>
        typeof c === "string"
          ? { name: c, position: null, sentiment: "nötr" }
          : c,
    );

    return {
      mentioned: parsed.mentioned ?? true,
      mentionType: parsed.mentionType ?? "direct",
      position: finalPosition,
      sentiment: parsed.sentiment ?? "nötr",
      excerpt:
        parsed.excerpt?.slice(0, 200) ??
        extractExcerpt(rawResponse, brandName),
      citations: [
        ...new Set([
          ...(parsed.citations ?? []),
          ...extractUrls(rawResponse),
        ]),
      ],
      competitors: normalizedCompetitors,
      citationSources: parsed.citationSources ?? [],
      mentionContext: parsed.mentionContext ?? null,
      competitorAdvantage: parsed.competitorAdvantage ?? null,
    };
  } catch {
    // Fallback if analysis fails
    return {
      mentioned: true,
      mentionType: "direct",
      position: regexPosition ?? "bahsediliyor",
      sentiment: "nötr",
      excerpt: extractExcerpt(rawResponse, brandName),
      citations: extractUrls(rawResponse),
      competitors: [],
      citationSources: [],
      mentionContext: null,
      competitorAdvantage: null,
    };
  }
}

function extractExcerpt(text: string, brandName: string): string {
  // Use Turkish-normalized search to find the brand mention
  const normalizedText = normalizeTurkish(text);
  const normalizedName = normalizeTurkish(brandName);
  const idx = normalizedText.indexOf(normalizedName);
  if (idx === -1) return text.slice(0, 400);
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + brandName.length + 300);
  return (
    (start > 0 ? "..." : "") +
    text.slice(start, end) +
    (end < text.length ? "..." : "")
  );
}

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s)>"'\]]+/g;
  return [...new Set(text.match(urlRegex) ?? [])];
}
