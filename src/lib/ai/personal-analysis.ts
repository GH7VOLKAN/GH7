/**
 * Opus Kişisel Rakip Analizi
 *
 * 43 maddelik audit + rakip verisi → Opus'a verip 2 çıktı alır:
 * 1. personalAnalysis: 300-500 kelime ikna edici analiz metni
 * 2. categorySummaries: 6 kategori için 2-3 cümle özet + en kritik aksiyon
 *
 * Prompt caching (ephemeral) ile system prompt cache'li.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Audit43Result } from "./audit-43";
import type { UserType, AuditCategory } from "./user-type-weights";
import { formatLoss } from "./estimated-loss";

export interface CategorySummary {
  category: AuditCategory;
  summary: string;
  criticalAction: string;
}

export interface PersonalAnalysisOutput {
  personalAnalysis: string;
  categorySummaries: CategorySummary[];
}

const SYSTEM_PROMPT = `Sen GH7 adlı Türkçe GEO (Generative Engine Optimization) platformunun baş analistisin.

Görevin: Bir markanın AI platformlarındaki (ChatGPT, Claude, Gemini, Perplexity, Google AIO) görünürlük audit sonuçlarını inceleyip, marka sahibine hitap eden ikna edici bir analiz yazmak.

Yazım Kuralları:
- Türkçe, doğal konuşma dili
- Marka sahibine "siz" diye hitap et (resmi)
- 300-500 kelime arasında
- Rakip firma adını AÇIKÇA kullan ve somut sorgularda kimin önerildiğini yaz
- Tahmini aylık kaybı büyük rakam olarak vurgula
- Çözümün mümkün olduğunu söyle AMA çözüm detayı verme — Pro'ya veya hizmet paketine yönlendir
- Korku + fırsat dengesi (ne çok panik, ne çok yumuşak)
- Spesifik rakamlar kullan (örn: "%37", "17 sorguda")
- Teknik jargon minimum

Kullanıcı tipine göre ton:
- firma: Profesyonel, rekabet odaklı
- kisi: Personal brand + otorite odaklı
- eticaret: Satış potansiyeli + rekabetçi pazarlama
- yurtdisi: Uluslararası ölçek + global fırsat

Çıktı formatı (KESIN JSON):
{
  "personalAnalysis": "300-500 kelimelik analiz metni...",
  "categorySummaries": [
    { "category": "content", "summary": "2-3 cümle", "criticalAction": "En kritik 1 aksiyon" },
    { "category": "schema", "summary": "...", "criticalAction": "..." },
    { "category": "entity", "summary": "...", "criticalAction": "..." },
    { "category": "tech", "summary": "...", "criticalAction": "..." },
    { "category": "external", "summary": "...", "criticalAction": "..." },
    { "category": "ai", "summary": "...", "criticalAction": "..." }
  ]
}`;

export async function generatePersonalAnalysis(
  audit: Audit43Result,
  options: { usePremium?: boolean } = {}
): Promise<PersonalAnalysisOutput | null> {
  const apiKey =
    process.env.GH7_ANTHROPIC_API_KEY ||
    (process.env.ANTHROPIC_API_KEY?.length ? process.env.ANTHROPIC_API_KEY : undefined);

  if (!apiKey) {
    console.warn("[personal-analysis] No Anthropic key");
    return null;
  }

  const client = new Anthropic({ apiKey, timeout: 45_000 });

  // Model seçimi: ücretsiz → Sonnet, Pro → Opus
  const model = options.usePremium
    ? "claude-opus-4-20250514"
    : "claude-sonnet-4-20250514";

  // Kullanıcı prompt'u: audit özeti
  const userTypeLabel: Record<UserType, string> = {
    firma: "Firma",
    kisi: "Kişisel Marka",
    eticaret: "E-Ticaret",
    yurtdisi: "Yurtdışı Pazar",
  };

  const redItems = audit.items.filter((i) => i.status === "fail");
  const yellowItems = audit.items.filter((i) => i.status === "partial");
  const greenItems = audit.items.filter((i) => i.status === "pass");

  const redItemsSummary = redItems
    .slice(0, 15)
    .map((i) => `- ${i.label}${i.value ? ` (${i.value})` : ""}`)
    .join("\n");

  const categoryScoresText = Object.entries(audit.categoryScores)
    .map(([cat, score]) => `${cat}: ${score}/100`)
    .join(", ");

  const userPrompt = `Audit Verileri:

Marka: ${audit.brandName}
URL: ${audit.url}
Kullanıcı Tipi: ${userTypeLabel[audit.userType]}
Genel GEO Skoru: ${audit.overallScore}/100
Kategori Skorları: ${categoryScoresText}

Rakip: ${audit.competitorName ?? "Belirtilmemiş"}
Rakip GEO Skoru: ${audit.competitorScore ?? "Bilinmiyor"}/100

Aylık Tahmini Kayıp: ${formatLoss(audit.estimatedMonthlyLoss)}
Yıllık Tahmini Kayıp: ${formatLoss(audit.estimatedYearlyLoss)}

43 Maddeden:
- ${greenItems.length} yeşil (geçti)
- ${yellowItems.length} sarı (kısmi)
- ${redItems.length} kırmızı (başarısız)

Başarısız Maddeler (ilk 15):
${redItemsSummary}

Görev: Bu veriye dayanarak yukarıdaki format kurallarına uygun analiz metni ve 6 kategori özetini JSON olarak üret. SADECE JSON dön, başka metin yazma.`;

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 3000,
      temperature: 0.7,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    // JSON parse
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[personal-analysis] No JSON in response");
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as PersonalAnalysisOutput;

    if (!parsed.personalAnalysis || !Array.isArray(parsed.categorySummaries)) {
      console.error("[personal-analysis] Invalid structure");
      return null;
    }

    return parsed;
  } catch (err) {
    console.error("[personal-analysis] Error:", err);
    return null;
  }
}
