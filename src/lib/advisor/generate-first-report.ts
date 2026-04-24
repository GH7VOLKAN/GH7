/**
 * Advisor — Qwen ile ilk kişisel rapor üretimi (Brief H-ext Aşama 5).
 *
 * Kullanım: Onboarding sonrası on-demand çağrılır. En son scan + audit
 * verisinden marka-özel bir 30 günlük yol haritası üretir.
 *
 * Çıktı: Markdown-friendly düz metin (Türkçe). Section başlıkları `## ` ile.
 */

import OpenAI from "openai";

const QWEN_MODEL =
  process.env.QWEN_MODEL ?? process.env.DASHSCOPE_MODEL ?? "qwen3.6-max-preview";
const QWEN_BASE_URL =
  process.env.QWEN_BASE_URL ??
  process.env.DASHSCOPE_BASE_URL ??
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

const QWEN_PRICING: Record<string, { input: number; output: number }> = {
  "qwen3.6-plus": { input: 0.5, output: 3.0 },
  "qwen3.6-max-preview": { input: 1.3, output: 7.8 },
  "qwen-plus": { input: 0.4, output: 1.2 },
  "qwen-max": { input: 2.4, output: 9.6 },
};

function qwenClient(): OpenAI {
  const apiKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("QWEN_API_KEY / DASHSCOPE_API_KEY env missing");
  return new OpenAI({ apiKey, baseURL: QWEN_BASE_URL });
}

const CJK_RE = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/;
const containsCJK = (s: string) => CJK_RE.test(s);

export type AdvisorInputSnapshot = {
  brand: {
    name: string;
    domain: string;
    sector?: string | null;
    city?: string | null;
  };
  scan: {
    score: number | null;
    scoreTotal: number | null;
    totalQueries: number | null;
    totalMentions: number | null;
    measuredAt: string | null;
    platformBreakdown: Array<{ platform: string; mentioned: number; total: number }>;
    topQueries: Array<{ text: string; mentioned: number; total: number }>;
    weakQueries: Array<{ text: string; mentioned: number; total: number }>;
  } | null;
  audit: {
    totalScore: number | null;
    passedCount: number | null;
    warningCount: number | null;
    criticalCount: number | null;
    criticalItems: Array<{ code: string; title: string }>;
  } | null;
  competitors: Array<{ name: string; isPrimary: boolean }>;
};

export type AdvisorUsage = {
  input_tokens: number;
  output_tokens: number;
};

export type AdvisorGenerationResult = {
  content: string;
  usage: AdvisorUsage;
  costUsd: number;
};

const SYSTEM_PROMPT = `Sen bir Türk AI görünürlük (GEO) danışmanısın. Markaya özel, samimi ama profesyonel, aksiyon odaklı bir danışman raporu yazıyorsun.

Tonun: Sıcak, güven veren, doğrudan ikinci tekil şahıs ("sen"). Genel geçer öğütler YASAK — her önerin verilen veriye dayanmalı.

Türkçen doğal ve akıcı. Çeviri hissi verme. Teknik terimler için gerektiğinde parantezde orijinalini belirt (örn: "yapılandırılmış veri (structured data)").

ÇIKTI FORMATI — düz Türkçe metin, Markdown başlıklarıyla. Aşağıdaki 5 bölümün hepsi bulunmalı:

## Hoşgeldin
Kısa (1 paragraf, 3-4 cümle) samimi giriş. Markayı ismiyle selamla, bu raporun ne için hazırlandığını özetle.

## Mevcut Durum
1-2 paragraf. Skorunu, platform dağılımını, güçlü/zayıf tarafları VERİLEN rakamlara dayanarak özetle. Yuvarlama yapma.

## Güçlü Yönler
Tam 3 madde (- ile başlayan bullet). Her biri marka-özel, veriye bağlı (örn: hangi platformda ne kadar güçlü, hangi sorguda tam skor).

## İyileştirme Alanları
Tam 3 madde (- ile). Öncelik sırasına göre. Her biri: (1) sorun (2) neden önemli (3) somut ilk adım.

## 30 Günlük Yol Haritası
4 hafta, her hafta için başlık ve 2-3 aksiyon. Format:

**1. Hafta — [Tema]**
- Aksiyon 1
- Aksiyon 2

**2. Hafta — [Tema]**
...

Aksiyonlar uygulanabilir, ölçülebilir, bu haftaki veriye göre önceliklendirilmiş olmalı.

KURALLAR:
- Hiçbir bölümü atla
- Markdown başlıkları dışında süsleme yok
- Türkçe dışı karakter (Çince/Japonca) YASAK
- Generic "SEO yapın" tipi öğüt YASAK — her öneri veriyle gerekçeli`;

function buildUserMessage(input: AdvisorInputSnapshot): string {
  const { brand, scan, audit, competitors } = input;
  const lines: string[] = [];

  lines.push(`Marka: ${brand.name}`);
  lines.push(`Domain: ${brand.domain}`);
  if (brand.sector) lines.push(`Sektör: ${brand.sector}`);
  if (brand.city) lines.push(`Lokasyon: ${brand.city}`);
  lines.push("");

  if (scan) {
    lines.push("=== SCAN (AI görünürlük taraması) ===");
    lines.push(
      `Skor: ${scan.score ?? "—"} / ${scan.scoreTotal ?? "—"}` +
        (scan.measuredAt ? ` (${scan.measuredAt})` : ""),
    );
    lines.push(
      `Toplam sorgu: ${scan.totalQueries ?? "—"}, toplam mention: ${scan.totalMentions ?? "—"}`,
    );
    lines.push("Platform dağılımı:");
    for (const p of scan.platformBreakdown) {
      lines.push(`  - ${p.platform}: ${p.mentioned}/${p.total}`);
    }
    if (scan.topQueries.length > 0) {
      lines.push("En güçlü sorgular:");
      for (const q of scan.topQueries.slice(0, 5)) {
        lines.push(`  - "${q.text}" → ${q.mentioned}/${q.total}`);
      }
    }
    if (scan.weakQueries.length > 0) {
      lines.push("En zayıf sorgular:");
      for (const q of scan.weakQueries.slice(0, 5)) {
        lines.push(`  - "${q.text}" → ${q.mentioned}/${q.total}`);
      }
    }
    lines.push("");
  } else {
    lines.push("=== SCAN === (Henüz tamamlanmış tarama yok)");
    lines.push("");
  }

  if (audit) {
    lines.push("=== AUDIT (43 madde site denetimi) ===");
    lines.push(`Toplam skor: ${audit.totalScore ?? "—"}`);
    lines.push(
      `Geçen: ${audit.passedCount ?? 0}, Uyarı: ${audit.warningCount ?? 0}, Kritik: ${audit.criticalCount ?? 0}`,
    );
    if (audit.criticalItems.length > 0) {
      lines.push("Kritik maddeler:");
      for (const it of audit.criticalItems.slice(0, 10)) {
        lines.push(`  - ${it.code}: ${it.title}`);
      }
    }
    lines.push("");
  } else {
    lines.push("=== AUDIT === (Henüz denetim yok)");
    lines.push("");
  }

  if (competitors.length > 0) {
    lines.push("=== RAKİPLER ===");
    for (const c of competitors.slice(0, 5)) {
      lines.push(`  - ${c.name}${c.isPrimary ? " (birincil)" : ""}`);
    }
    lines.push("");
  }

  lines.push(
    "Yukarıdaki verilere dayanarak 5 bölümlü ilk danışman raporunu yaz. Sadece Türkçe, Markdown başlıklarla.",
  );

  return lines.join("\n");
}

function calculateCost(usage: AdvisorUsage): number {
  const p = QWEN_PRICING[QWEN_MODEL] ?? QWEN_PRICING["qwen3.6-max-preview"];
  return (usage.input_tokens / 1e6) * p.input + (usage.output_tokens / 1e6) * p.output;
}

export async function generateFirstAdvisorReport(
  input: AdvisorInputSnapshot,
): Promise<AdvisorGenerationResult> {
  const userMessage = buildUserMessage(input);

  const attempt = async (retry = 0): Promise<{ content: string; usage: AdvisorUsage }> => {
    const response = await qwenClient().chat.completions.create({
      model: QWEN_MODEL,
      max_tokens: 4000,
      temperature: 0.5,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const text = response.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error("Qwen advisor — empty response");

    if (containsCJK(text) && retry === 0) {
      console.warn("[advisor] CJK detected, retrying…");
      return attempt(retry + 1);
    }

    return {
      content: text.trim(),
      usage: {
        input_tokens: response.usage?.prompt_tokens ?? 0,
        output_tokens: response.usage?.completion_tokens ?? 0,
      },
    };
  };

  const { content, usage } = await attempt();
  return { content, usage, costUsd: calculateCost(usage) };
}
