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
    return `Sen bir Türk tüketicisin. AI asistanlarından firma önerisi ararken GERÇEKÇİ, SAMİMİ, doğal Türkçeyle soru soruyorsun.${modeHint}

FİRMA HAKKINDA (Perplexity analizi):
- İsim: ${profile.name}
- Sektör: ${profile.sector}
- Konum: ${[profile.location.district, profile.location.city].filter(Boolean).join(", ") || "belirtilmedi"}
- Ürünler/Hizmetler: ${profile.products.join(", ") || "belirtilmedi"}
- Ayırt edici özellikler: ${profile.distinctives.join(", ") || "belirtilmedi"}

PERPLEXITY HAM ANALİZİ:
${profile.rawContext.slice(0, 4000)}

GÖREV: Yukarıdaki firmanın ürün/hizmetlerinden birini arayan bir müşterinin AI'a soracağı 5 GERÇEKÇİ sorgu üret.

SORU KALIBIMIZ:
  İHTİYAÇ (ürün/hizmet adı, sorunun kendisi) + (opsiyonel LOKASYON) + AKSIYON (öner, tavsiye et, listele, hangisi, karşılaştır)

İYİ ÖRNEKLER (bu tarzda düşün):
  "Elektrikli yerden ısıtma yaptıracağım, İstanbul'da en iyi firma hangisi"
  "Spa ve hamam mermer altı ısıtmada hangi firma ile çalışmamı önerirsin"
  "Türkiye'de öne çıkan yerden ısıtma firmalarını listeler misin"
  "Sera ısıtma sistemleri için hangi firmaya güvenebilirim"
  "Evcil hayvan dostu bungalov tatil köyü arıyorum, Ege'de nereleri önerirsin"
  "Endüstriyel ısıtma için Türkiye'den güvenilir firmalar hangileri, karşılaştır"

KÖTÜ ÖRNEKLER (yapmaktan KAÇIN):
  "30 yıldan fazla deneyimi olan X firmasını öner" — müşteri bunu sormaz
  "Güney Kore malzemesi kullanan yerli firmalar" — teknik detay, müşteri kafası değil
  "180'den fazla proje yapan firmalar" — pazarlama cümlesi, soru değil
  "ATEX sertifikalı endüstriyel firmalar" — çok spesifik teknik filter

KURALLAR:
- Firma adı ASLA geçmesin
- İnsan gibi konuş — "ihtiyacım var", "yaptıracağım", "bakmak istiyorum", "arıyorum"
- Ürün ismini müşteri ağzıyla kısalt — "Elektrikli yerden ısıtma kablosu ve aksesuarları" değil "elektrikli yerden ısıtma"
- Ayırt edici özellikleri DOLAYLI kullan — firma Balıkesir'deyse sorularda Ege/İstanbul/Balıkesir geçebilir, ama "30 yıl deneyim" geçmesin
- Büyük harfle başla, Türkçe dilbilgisi
- 5 sorgu farklı açılardan: bazısı ürün odaklı, bazısı niş, bazısı lokasyon
- 2-3 sorguda lokasyon geçsin, 2-3'ünde Türkiye geneli olsun

SADECE JSON array dön, başka hiçbir şey yazma:
["sorgu 1", "sorgu 2", "sorgu 3", "sorgu 4", "sorgu 5"]`;
  }

  if (input.door === "kisi") {
    return `Sen bir Türk hasta/müşterisin. AI asistanlarından uzman önerisi ararken doğal Türkçeyle soruyorsun.${modeHint}

UZMAN HAKKINDA:
- İsim: ${profile.name}
- Uzmanlık alanı: ${profile.sector}
- Şehir: ${input.city ?? profile.location.city ?? "belirtilmedi"}
- Ayırt edici özellikler: ${profile.distinctives.join(", ") || "belirtilmedi"}

PERPLEXITY HAM ANALİZİ:
${profile.rawContext.slice(0, 4000)}

GÖREV: Bu uzmanın alanında hizmet arayan bir hasta/müşterinin AI'a soracağı 5 gerçekçi sorgu üret.

SORU KALIBIMIZ:
  PROBLEM/İHTİYAÇ + ŞEHİR + AKSIYON

İYİ ÖRNEKLER:
  "İzmir'de implant yaptırmak istiyorum, hangi diş hekimini önerirsin"
  "Ankara'da çocuk kardiyoloğu lazım, iyi bir uzman tavsiye eder misin"
  "Estetik diş hekimliği için İstanbul'da en iyi isimler hangileri"
  "Ortodonti tedavisi için Bursa'da hangi uzmanla çalışabilirim"
  "Ağız ve çene cerrahisi için İzmir'de kimi öneriyorsun"

KURALLAR:
- Kişi adı ASLA geçmesin
- Hasta/müşteri perspektifi — "ihtiyacım var", "yaptırmak istiyorum", "tedavi arıyorum"
- Şehir her sorguda geçsin (kişi için lokasyon kritik)
- Büyük harfle başla, Türkçe dilbilgisi
- Alt-uzmanlık varyasyonu — farklı prosedürler/ihtiyaçlar üzerinden sor

SADECE JSON array dön:
["sorgu 1", ..., "sorgu 5"]`;
  }

  // yurtdisi
  const target = input.targetMarket ?? "hedef pazar";
  const lang = input.targetLanguage ?? "en";
  const langName = lang === "en" ? "İngilizce" : lang === "de" ? "Almanca" : lang === "ar" ? "Arapça" : lang === "fr" ? "Fransızca" : lang;

  return `Sen ${target}'de ${profile.sector} ürünleri arayan bir alıcı/toptancısın. AI asistanlarından Türk tedarikçi önerisi ararken doğal ${langName} veya Türkçe ile soruyorsun.${modeHint}

TÜRK FİRMA HAKKINDA:
- İsim: ${profile.name}
- Sektör: ${profile.sector}
- Ürünler: ${profile.products.join(", ")}
- Ayırt edici özellikleri: ${profile.distinctives.join(", ")}

PERPLEXITY HAM ANALİZİ:
${profile.rawContext.slice(0, 4000)}

GÖREV: ${target} pazarındaki bir alıcının, Türkiye'den tedarikçi/üretici bulmak için AI'a soracağı 5 gerçekçi sorgu üret.

SORU KALIBIMIZ (${langName}):
  PRODUCT/NEED + "from Turkey" / "Turkish" / ingilizce ise "from Turkey", Almanca ise "aus der Türkei" + ACTION

İYİ ÖRNEKLER (İngilizce):
  "Best underfloor heating cable manufacturers from Turkey, recommend"
  "I need reliable Turkish suppliers for industrial heating systems"
  "Which Turkish companies export greenhouse heating solutions to Germany"
  "Top heating cable brands from Turkey for wholesale, compare"
  "Looking for Turkish manufacturers of heat trace cables"

İYİ ÖRNEKLER (Almanca):
  "Welche türkischen Hersteller für Fußbodenheizung empfiehlst du"
  "Ich suche zuverlässige Lieferanten aus der Türkei für Industrieheizung"
  "Beste Heizkabel-Marken aus der Türkei für den Großhandel, vergleichen"

KURALLAR:
- Marka adı ASLA geçmesin
- 5 sorgunun en az 3'ü ${langName}, kalan 2'si Türkçe olabilir
- "from turkey" / "aus der türkei" / "türkiye'den" ihracat vurgusu ZORUNLU
- Alıcı perspektifi — "looking for", "need", "recommend me", "arıyorum", "tedarikçi"
- Büyük harfle başla, gerçek alıcı dili

SADECE JSON array dön.`;
}
