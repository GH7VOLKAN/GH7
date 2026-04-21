/**
 * Opus sorgu üreticisi — Perplexity'nin ham bağlamını okur, firma-spesifik
 * 5 sorgu üretir. İki mod:
 *   "first-pass": İlk geçiş, bağlamdan doğal sorgu üret
 *   "heal": Self-heal — firma cevaplarda çıkmadı, farklı açıdan dene
 */

import Anthropic from "@anthropic-ai/sdk";
import type { FirmProfile, AnalyzeInput } from "@/lib/analiz/types";

const MODEL = "claude-sonnet-4-20250514";

export type QueryGenMode = "first-pass" | "heal";

export async function generateQueries(
  input: AnalyzeInput,
  profile: FirmProfile,
  mode: QueryGenMode,
): Promise<string[]> {
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key missing");

  const client = new Anthropic({ apiKey });
  const prompt = buildPrompt(input, profile, mode);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: mode === "heal" ? 0.9 : 0.7,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  const text = block?.type === "text" ? block.text : "";
  const cleaned = text.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) return [];

  try {
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((q): q is string => typeof q === "string")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);
  } catch {
    return [];
  }
}

function buildPrompt(
  input: AnalyzeInput,
  profile: FirmProfile,
  mode: QueryGenMode,
): string {
  const modeHint =
    mode === "heal"
      ? `
BU BİR YENİDEN DENEMEDİR.
İlk 5 sorgumuzda bu firma hiçbir AI cevabında çıkmadı. Farklı açılardan, daha spesifik, daha niş sorgular üret. Firmanın ayırt edici özelliklerini (distinctives) daha agresif kullan. Konum/niş kombinasyonlarını dene.`
      : "";

  if (input.door === "firma" || input.door === "eticaret") {
    return `Sen GH7.ai sorgu stratejistisin. ${modeHint}

FİRMA PROFİLİ:
- İsim: ${profile.name}
- Sektör: ${profile.sector}
- Konum: ${[profile.location.district, profile.location.city].filter(Boolean).join(", ") || "belirtilmedi"}
- Ürünler/Hizmetler: ${profile.products.join(", ") || "belirtilmedi"}
- Ayırt edici özellikler: ${profile.distinctives.join(", ") || "belirtilmedi"}

PERPLEXITY HAM ANALİZİ:
${profile.rawContext.slice(0, 4000)}

GÖREV: Potansiyel müşterilerin ChatGPT, Claude, Gemini, Perplexity gibi AI'lara bu tarz bir firma arayışında soracağı 5 GERÇEKÇİ sorgu üret.

KURALLAR:
- Firma adı ASLA geçmesin
- Her sorgu spesifik olsun — ayırt edici özelliklerden yararlan
- Aksiyon kelimesi olsun: "öner", "tavsiye et", "hangileri", "listele", "karşılaştır"
- Türkçe dilbilgisine uy — cümle büyük harfle başlasın, "kurulumu yapan" gibi anlamsız ekler yapma
- Ürün isimlerini ham kopyalama — anlamlı cümle kur
- 5 sorgu 2-3 farklı açıdan dağılsın (ürün bazlı, konum bazlı, niş bazlı)

ÖRNEK ÇIKTI (idavilla.com.tr bungalov örneği):
["Edremit Güre'de pet-friendly bungalov tesisleri öner",
 "Balıkesir kıyılarında mandalina bahçesinde konaklama yapan yerler hangileri",
 "Kuzey Ege'de ailecek 12 ay açık butik bungalov tatil köyleri tavsiye et",
 "Edremit Akçay Güre bölgesinde ahşap bungalov konaklama listele",
 "Kazdağları yakınında evcil hayvan dostu konaklama için hangi bungalov tesislerini öneriyorsun"]

SADECE JSON array dön, başka hiçbir şey yazma:
["sorgu 1", "sorgu 2", "sorgu 3", "sorgu 4", "sorgu 5"]`;
  }

  if (input.door === "kisi") {
    return `Sen GH7.ai sorgu stratejistisin. ${modeHint}

KİŞİ PROFİLİ:
- İsim: ${profile.name}
- Uzmanlık alanı: ${profile.sector}
- Şehir: ${input.city ?? profile.location.city ?? "belirtilmedi"}
- Ayırt edici özellikler: ${profile.distinctives.join(", ") || "belirtilmedi"}
- Ürün/hizmetler: ${profile.products.join(", ") || "belirtilmedi"}

PERPLEXITY HAM ANALİZİ:
${profile.rawContext.slice(0, 4000)}

GÖREV: Potansiyel hasta/müşterilerin AI'lara bu uzman arayışında soracağı 5 gerçekçi sorgu üret.

KURALLAR:
- Kişi adı ASLA geçmesin
- Her sorgu şehir + uzmanlık alt-alanı bazlı spesifik olsun
- Aksiyon kelimesi (öner, listele, tavsiye et, karşılaştır)
- Türkçe dilbilgisi — büyük harfle başla
- Hasta/müşteri perspektifinde olsun

SADECE JSON array dön:
["sorgu 1", ..., "sorgu 5"]`;
  }

  // yurtdisi
  const target = input.targetMarket ?? "hedef pazar";
  const lang = input.targetLanguage ?? "en";
  const langName = lang === "en" ? "İngilizce" : lang === "de" ? "Almanca" : lang === "ar" ? "Arapça" : lang === "fr" ? "Fransızca" : lang;

  return `Sen GH7.ai sorgu stratejistisin. ${modeHint}

FİRMA PROFİLİ (Türkiye'den ihracat):
- İsim: ${profile.name}
- Sektör: ${profile.sector}
- Ürünler: ${profile.products.join(", ")}
- Ayırt edici: ${profile.distinctives.join(", ")}
- Hedef pazar: ${target}
- Sorgu dili: ${langName}

PERPLEXITY HAM ANALİZİ:
${profile.rawContext.slice(0, 4000)}

GÖREV: ${target} pazarındaki potansiyel alıcıların AI'lara Türk tedarikçi/üretici arayışında soracağı 5 gerçekçi sorgu üret.

KURALLAR:
- Marka adı ASLA geçmesin
- 5 sorgunun en az 3'ü ${langName}, kalan 2'si Türkçe olabilir
- "Türkiye'den" / "from turkey" / "aus der türkei" gibi ihracat vurgusu
- Ayırt edici özelliklere göre niş
- Aksiyon kelimesi

SADECE JSON array dön.`;
}
