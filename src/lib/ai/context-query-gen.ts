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
    const coreProducts = profile.products.slice(0, 3);
    const coreProductsLabel = coreProducts.length > 0
      ? coreProducts.join(" veya ")
      : profile.sector || "firma";

    return `Sen bir Türk tüketicisin. AI asistanlarından firma önerisi ararken GERÇEKÇİ, SAMİMİ, doğal Türkçeyle soru soruyorsun.${modeHint}

FİRMA HAKKINDA (Perplexity analizi):
- İsim: ${profile.name}
- Sektör: ${profile.sector}
- Konum: ${[profile.location.district, profile.location.city].filter(Boolean).join(", ") || "belirtilmedi"}
- ÇEKİRDEK ÜRÜNLER/HİZMETLER: ${coreProducts.join(", ") || "belirtilmedi"}
- Ayırt edici özellikler (opsiyonel zenginleştirici): ${profile.distinctives.join(", ") || "yok"}

PERPLEXITY HAM ANALİZİ:
${profile.rawContext.slice(0, 4000)}

GÖREV: Yukarıdaki firmanın ÇEKİRDEK ÜRÜN/HİZMETLERİNDEN birini (${coreProductsLabel}) arayan bir müşterinin AI'a soracağı 5 GERÇEKÇİ sorgu üret.

═══════════════════════════════════════════════════════
MUTLAK KURAL — ÇEKİRDEK ÜRÜN HER SORGUDA OLMALI
═══════════════════════════════════════════════════════

Her sorgunun konusu bu ürün/hizmetlerden BİRİ olmalı:
${coreProducts.map((p, i) => `  ${i + 1}. ${p}`).join("\n")}

5 sorgunun HEPSİ bu listeden bir ürün/hizmet içerecek. Asla BAŞKA bir ürün/hizmet hakkında sorgu üretme.

Ayırt edici özellikler (distinctives) SADECE çekirdek ürünü ZENGİNLEŞTİRMEK için. Tek başına sorgu konusu olamaz.

─── DOĞRU ÖRNEKLER (idavilla / bungalov konaklama) ───

✓ "Balıkesir'de doğa içinde bungalov konaklama yapabileceğim yerleri önerir misin"
  (çekirdek: bungalov konaklama ✓, zenginleştirici: doğa içinde)

✓ "Edremit körfezinde ailecek kalabileceğim bungalov tesisleri hangisi daha iyi"
  (çekirdek: bungalov tesisleri ✓, zenginleştirici: Edremit + ailecek)

✓ "Kazdağları çevresinde huzurlu bungalov tatil köyleri arıyorum, nereleri tavsiye edersin"
  (çekirdek: bungalov tatil köyleri ✓, zenginleştirici: Kazdağları + huzurlu)

─── YANLIŞ ÖRNEKLER (YAPMA) ───

✗ "Türkiye'de mitoloji temalı konseptli oteller var mı, listeler misin"
  (çekirdek ürün BUNGALOV konaklama EKSİK — "mitoloji" distinctives'ten uydurulmuş)

✗ "Mandalina bahçesi içinde konaklama imkanı olan yerler arıyorum"
  (çekirdek ürün BUNGALOV eksik — "mandalina bahçesi" zenginleştiriciyi ana konu yapmış)

✗ "Pet-friendly seçenek hangileri"
  (çekirdek ürün eksik, sadece distinctive)

─── KULLANIM KALIBI ───

SORGU = ÇEKİRDEK ÜRÜN + (opsiyonel: lokasyon) + (opsiyonel: 1 distinctive) + AKSIYON

Aksiyon kelimesi zorunlu: öner, tavsiye et, listele, hangisi, karşılaştır, nereleri

─── 5 SORGUNUN DAĞILIMI ───

1-2 sorgu: çekirdek ürün + lokasyon (ör. "Balıkesir'de X")
1-2 sorgu: çekirdek ürün + 1 distinctive (ör. "pet-friendly X")
1 sorgu: çekirdek ürün + karşılaştırma (ör. "X'in en iyisi hangi")

KURALLAR:
- Firma adı ASLA geçmesin
- Her sorguda çekirdek ürünün adı veya çok yakın bir varyasyonu geçmeli
- "Bungalov" yazıyorsa bungalov sorusu olmalı — "otel", "tatil köyü", "konaklama" kabul (aynı kategori varyantları)
- Konu geçişi YASAK: bungalov sorusunda "spa", "restoran", "mitoloji" ana konu olamaz
- İnsan gibi konuş — "ihtiyacım var", "yaptıracağım", "bakmak istiyorum", "arıyorum"
- Büyük harfle başla, Türkçe dilbilgisi düzgün

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
