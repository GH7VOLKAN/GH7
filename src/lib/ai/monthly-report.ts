/**
 * GH7.ai — Aylık Derin Rakip Araştırması ve GEO Durum Raporu
 *
 * 1. deepCompetitorResearch: Her rakip için 2 Sonar sorgusu
 * 2. generateMonthlyReport: Opus ile "Aylık GEO Durum Raporu" üretimi
 */

import Anthropic from "@anthropic-ai/sdk";

// ─── Types ─────────────────────────────────────────────

export interface CompetitorResearchResult {
  name: string;
  domain: string;
  /** Sonar Query 1: Genel dijital varlık taraması */
  digitalPresence: string;
  /** Sonar Query 2: Son 1 ayda değişenler */
  recentChanges: string;
}

// ─── Sonar Helper ──────────────────────────────────────

const PERPLEXITY_API = "https://api.perplexity.ai/chat/completions";

async function querySonar(prompt: string): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("Perplexity API key not configured");

  const res = await fetch(PERPLEXITY_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error(`Perplexity API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── Deep Competitor Research ──────────────────────────

/**
 * Deep research each competitor via Sonar (2 queries per competitor).
 * Top 10 competitors only.
 */
export async function deepCompetitorResearch(
  brandId: string,
  competitors: Array<{ name: string; domain: string }>,
  sector: string,
  city: string,
): Promise<CompetitorResearchResult[]> {
  const results: CompetitorResearchResult[] = [];

  // Top 10 only
  const top10 = competitors.slice(0, 10);

  for (const comp of top10) {
    try {
      // Query 1: Genel dijital varlık taraması
      const q1 = `${comp.name} ${sector} ${city} — web sitesi, LinkedIn, Google Business, dizinler, haberler, son gelişmeler?`;
      const digitalPresence = await querySonar(q1);

      // Query 2: Son 1 ayda değişenler
      const q2 = `${comp.name} son 1 ayda değişen bir şey var mı? Yeni içerik, yeni profil, yeni haber?`;
      const recentChanges = await querySonar(q2);

      results.push({
        name: comp.name,
        domain: comp.domain,
        digitalPresence,
        recentChanges,
      });
    } catch (err) {
      console.error(`[monthly-report] Sonar research failed for ${comp.name}:`, err);
      results.push({
        name: comp.name,
        domain: comp.domain,
        digitalPresence: "",
        recentChanges: "",
      });
    }
  }

  return results;
}

// ─── Monthly Report Generator ──────────────────────────

/**
 * Generate monthly GEO status report with Claude Opus.
 * "Aylık GEO Durum Raporu" — "Doktor Abi" kuralları uygulanır.
 */
export async function generateMonthlyReport(
  brand: {
    id: string;
    name: string;
    domain: string;
    type: string;
    sector: string | null;
    city: string | null;
  },
  competitorResearch: CompetitorResearchResult[],
  mentionData: { mentionScore: number; readinessScore: number; platformScores?: Record<string, number> },
  checklistProgress: { completed: number; total: number },
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key not configured");

  const client = new Anthropic({ apiKey });

  // Rakip araştırma özetleri
  const competitorSummaries = competitorResearch
    .map(
      (c) =>
        `### ${c.name} (${c.domain})
**Dijital Varlık:** ${c.digitalPresence || "Bilgi alınamadı."}
**Son 1 Aydaki Değişimler:** ${c.recentChanges || "Bilgi alınamadı."}`,
    )
    .join("\n\n");

  const checklistPct =
    checklistProgress.total > 0
      ? Math.round((checklistProgress.completed / checklistProgress.total) * 100)
      : 0;

  const systemPrompt = `Sen GH7.ai'nin aylık rapor yazarısın. Kullanıcıya her ay düzenli olarak "Aylık GEO Durum Raporu" gönderiyorsun. Amacın: markanın yapay zeka görünürlük durumunu, rakip hareketlerini ve fırsatları anlaşılır şekilde özetlemek.

KURALLAR (Doktor Abi):
- Teknik jargon kullanma. Kullanıcı teknik bilgiye sahip olmayabilir.
- "Schema markup" yerine "arama motorlarının seni tanıması için yapılacak ayarlar" de.
- "Backlink" yerine "sana link veren siteler" de.
- "SEO" yerine "arama motorlarında görünürlük" de.
- Samimi ama profesyonel ol. Abartma, korkutma.
- Somut ve uygulanabilir öneriler ver.
- Her zaman Türkçe yaz.

RAPOR FORMATI:
1. **Genel Durum Özeti** — Markanın bu ayki AI görünürlük durumu (2-3 cümle)
2. **Rakip Hareketleri** — Rakiplerin ne yaptığı, kim öne geçmiş
3. **Kapanan Farklar** — Markanın rakiplere yaklaştığı alanlar
4. **Açılan Farklar** — Markanın geride kaldığı yeni alanlar
5. **Yeni Fırsatlar** — Bu ay keşfedilen yeni fırsatlar
6. **Öncelikli Aksiyonlar** — Bu ay yapılması gereken en önemli 3-5 iş (madde madde)

Her bölüm kısa ve öz olsun. Toplam rapor 800-1200 kelime arasında olmalı.`;

  const userPrompt = `Aşağıdaki verilerle "${brand.name}" için aylık GEO durum raporu oluştur.

MARKA BİLGİLERİ:
- İsim: ${brand.name}
- Tür: ${brand.type === "firma" ? "Firma" : "Kişisel Marka"}
- Sektör: ${brand.sector ?? "Belirtilmedi"}
- Şehir: ${brand.city ?? "Belirtilmedi"}
- Domain: ${brand.domain}

GÜNCEL SKORLAR:
- AI Bahsedilme Skoru: ${mentionData.mentionScore}/100
- AI Hazırlık Skoru: ${mentionData.readinessScore}/100
${mentionData.platformScores ? `- Platform Skorları: ${JSON.stringify(mentionData.platformScores)}` : ""}

GELİŞİM PLANI İLERLEMESİ:
- Tamamlanan: ${checklistProgress.completed}/${checklistProgress.total} (${checklistPct}%)

RAKİP ARAŞTIRMA SONUÇLARI:
${competitorSummaries || "Rakip verisi bulunamadı."}

Lütfen raporu oluştur.`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return text;
  } catch (err) {
    console.error("[monthly-report] Opus report generation failed:", err);
    throw err;
  }
}
