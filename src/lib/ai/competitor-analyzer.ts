/**
 * GH7.ai — "Neden Önde?" Rakip Analiz Motoru
 *
 * Bir rakibin neden yapay zekalarda daha çok önerildiğini analiz eder.
 * Claude ile yapılandırılmış bir analiz döndürür:
 *   - Özet
 *   - Güçlü yanları
 *   - Zayıf noktaları
 *   - Size öneriler
 */

import Anthropic from "@anthropic-ai/sdk";

// ─── Types ───────────────────────────────────────────

export interface CompetitorAnalysis {
  summary: string; // 2-3 cümlelik özet
  strengths: string[]; // 3-5 rakibin güçlü yanı
  weaknesses: string[]; // 2-3 zayıf noktası
  recommendations: string[]; // 3-5 kullanıcıya özel öneri
}

interface PromptAppearanceInput {
  promptText: string;
  platform: string;
  excerpt: string;
}

// ─── Main Export ─────────────────────────────────────

export async function analyzeWhyCompetitorAhead(
  brandName: string,
  competitorName: string,
  brandScore: number,
  competitorScore: number,
  promptAppearances: PromptAppearanceInput[],
  competitorOnlySources: string[],
): Promise<CompetitorAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key not configured");

  const client = new Anthropic({ apiKey, timeout: 60_000 });

  // Prompt appearances summary (limit to avoid token overflow)
  const appearancesText = promptAppearances
    .slice(0, 15)
    .map(
      (a, i) =>
        `${i + 1}. [${a.platform}] Soru: "${a.promptText}"\n   Cevap özeti: ${a.excerpt.slice(0, 300)}`,
    )
    .join("\n\n");

  const sourcesText =
    competitorOnlySources.length > 0
      ? competitorOnlySources.join(", ")
      : "Bilgi yok";

  const prompt = `Sen GH7.ai'nin rakip analiz uzmanısın. Bir markanın rakibinin neden yapay zekalarda daha çok önerildiğini analiz edeceksin.

MARKA: ${brandName} (Bahsedilme Skoru: %${brandScore})
RAKİP: ${competitorName} (Bahsedilme Skoru: %${competitorScore})

Rakip, markadan ${competitorScore - brandScore} puan daha yüksek skora sahip.

RAKİBİN YAPAY ZEKA YANITLARINDA GÖRÜNDÜGü YERLER:
${appearancesText || "Henüz detaylı veri yok."}

RAKİBİN KULLANDIĞI AMA MARKANIN KULLANMADIĞI KAYNAKLAR:
${sourcesText}

GÖREV:
Bu verileri analiz ederek şunları belirle:
1. Rakibin neden daha çok önerildiğinin kısa özeti (2-3 cümle)
2. Rakibin güçlü yanları — yapay zekaların onu neden önerdiği (3-5 madde)
3. Rakibin zayıf noktaları — hangi alanlarda eksik (2-3 madde)
4. Markaya öneriler — rakibi geçmek için ne yapmalı (3-5 madde, somut ve uygulanabilir)

ÖNEMLİ KURALLAR:
- Teknik jargon KULLANMA. Bir doktor abi gibi sade ve anlaşılır yaz.
- Her madde 1-2 cümle olsun, kısa ve öz.
- Öneriler somut olsun: "SEO yapın" yerine "Blog yazıları yazarak Google'da görünürlüğünüzü artırın" gibi.
- Türkçe yaz.

SADECE JSON döndür — başka hiçbir şey yazma:
{
  "summary": "2-3 cümlelik özet",
  "strengths": ["güçlü yan 1", "güçlü yan 2", "güçlü yan 3"],
  "weaknesses": ["zayıf nokta 1", "zayıf nokta 2"],
  "recommendations": ["öneri 1", "öneri 2", "öneri 3"]
}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response (might be wrapped in ```json blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        "[competitor-analyzer] Could not extract JSON from Claude response",
      );
      return fallbackAnalysis(competitorName);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      summary: String(parsed.summary ?? ""),
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.map(String).slice(0, 5)
        : [],
      weaknesses: Array.isArray(parsed.weaknesses)
        ? parsed.weaknesses.map(String).slice(0, 3)
        : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.map(String).slice(0, 5)
        : [],
    };
  } catch (err) {
    console.error("[competitor-analyzer] Claude analysis failed:", err);
    return fallbackAnalysis(competitorName);
  }
}

function fallbackAnalysis(competitorName: string): CompetitorAnalysis {
  return {
    summary: `${competitorName} şu an yapay zekalarda daha sık öneriliyor. Detaylı analiz için yeterli veri toplanıyor.`,
    strengths: [
      "Yapay zeka yanıtlarında daha sık yer alıyor",
      "Daha fazla kaynakta referans gösteriliyor",
    ],
    weaknesses: [
      "Detaylı analiz için daha fazla veri gerekiyor",
    ],
    recommendations: [
      "Markanızın online görünürlüğünü artırın",
      "Sektörünüzle ilgili içerikler üreterek yapay zekaların sizi tanımasını sağlayın",
      "Rakibinizin göründüğü platformlarda aktif olun",
    ],
  };
}
