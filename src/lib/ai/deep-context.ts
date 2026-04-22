/**
 * Perplexity deep context fetch — firma hakkında zengin analiz.
 *
 * Tek sorguda yetinmez, 2-3 sorgu birden atar:
 *   1. "Firma analizi" — ne yapıyor, nerede, ne öne çıkarıyor
 *   2. "Niş/ayırt edici özellik" — bu firmayı benzerlerden ayıran ne
 *   3. (Yurtdışı için) "Hedef pazar özelinde firma"
 *
 * Çıktı: rich FirmProfile. Yetersizse contextQuality "thin" veya "empty".
 */

import { querySonar } from "./sonar-research";
import type { AnalyzeInput, FirmProfile } from "@/lib/analiz/types";

export async function fetchDeepContext(
  input: AnalyzeInput,
): Promise<FirmProfile> {
  const queries = buildContextQueries(input);

  const results = await Promise.allSettled(queries.map((q) => querySonar(q)));
  const texts = results.map((r) => (r.status === "fulfilled" ? r.value : ""));
  const rawContext = texts.filter(Boolean).join("\n\n---\n\n");

  if (!rawContext || rawContext.length < 200) {
    return emptyProfile(input, rawContext);
  }

  const profile = await extractProfileFromContext(rawContext, input);
  return profile;
}

function strictPreamble(domain: string): string {
  return `KESİN KURALLAR — İHLAL ETME:

1. SADECE "${domain}" alan adındaki sitenin İÇERİĞİNDEN bilgi topla.
2. Benzer isimli farklı işletmelerle KARIŞTIRMA. Örneğin "idavilla.com.tr" için İda Natura, Jippe İda, Ida Bungalov gibi benzer isimli ayrı işletmelerin özelliklerini ASLA bu firmaya atfetme.
3. Bölgedeki diğer işletmelerin özelliklerini bu firmaya KOPYALAMA. "Kazdağları'nda genelde üçgen evler var" gibi genelleme yapıp bu firmaya yükleme.
4. Spekülasyon yapma. "Muhtemelen şu özelliği vardır", "genelde bu firmalar şunu yapar" tarzı çıkarımlarda bulunma.
5. Sitede geçmeyen, site içeriğinde doğrulanamayan bilgileri RAPOR ETME.
6. Eğer sitede net bilgi yoksa, boş bırak. "Bilgi bulunamadı" yaz.

KAYNAK ZORUNLULUĞU: Raporunda geçen her özelliğin hangi site sayfasında/metin bloğunda geçtiğini belirt. Siteden doğrulanamayan özellikleri DAHİL ETME.`;
}

function buildContextQueries(input: AnalyzeInput): string[] {
  if (input.door === "firma") {
    const p = strictPreamble(input.domain ?? "");
    return [
      `${p}\n\nARAŞTIR — ${input.domain}:\n- Firma adı: Sitenin title/header/footer'ında gerçekten nasıl yazılıyor?\n- Sektör: Sitede kendilerini nasıl tanımlıyorlar?\n- Konum: Sitede geçen şehir/ilçe/adres.\n- Ürünler/hizmetler: Sitede SATTIKLARI veya SUNDUKLARI somut şeyler. Navigasyon menüsünde, ürün sayfalarında, hizmet listelerinde geçenler.\n- Hedef kitle: Sitede kendi tanımladıkları müşteri profili.`,
      `${p}\n\nAYIRT EDİCİ ÖZELLİKLER — ${input.domain}:\nSadece sitenin KENDİSİNİN vurguladığı özellikleri listele. Site "biz üçgen ev yapıyoruz" demiyorsa, bu özelliği YAZMA. Başka işletmelerden çıkarım yapma. En fazla 5 madde, her biri için hangi sayfada/metinde geçtiğini belirt.`,
    ];
  }
  if (input.door === "kisi") {
    const q = `${input.fullName} ${input.city ? input.city + "'de" : ""} kim? Uzmanlık alanı, çalıştığı klinik/ofis, eğitimi, öne çıktığı konular neler? Sadece doğrulanmış kaynaklar. Spekülasyon yapma.`;
    return [q];
  }
  if (input.door === "eticaret") {
    const p = strictPreamble(input.domain ?? "");
    return [
      `${p}\n\nARAŞTIR — ${input.domain}:\nHangi ürün kategorilerini satıyor, hangi fiyat segmentinde, hangi marketplace'lerde aktif, marka pozisyonu ne?`,
      `${p}\n\nAYIRT EDİCİ ÖZELLİKLER — ${input.domain}:\nSadece sitenin kendisinin vurguladığı öne çıkan yönler. Ürün yelpazesi, hedef kitle, fiyat pozisyonu. Kaynak zorunlu.`,
    ];
  }
  // yurtdisi
  const p = strictPreamble(input.domain ?? "");
  return [
    `${p}\n\nARAŞTIR — ${input.domain}:\nHangi ürünleri üretiyor, hangi pazarlara ihraç ediyor, ne ile öne çıkıyor?`,
    `${p}\n\n${input.domain} ${input.targetMarket ?? "hedef pazar"} pazarına nasıl konumlanıyor? Sadece sitenin kendi söylediği bilgileri al.`,
  ];
}

async function extractProfileFromContext(
  rawContext: string,
  input: AnalyzeInput,
): Promise<FirmProfile> {
  // Opus ile yapılandırılmış extraction
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key missing");

  const client = new Anthropic({ apiKey });
  const prompt = `Aşağıda Perplexity'nin bir firma/kişi hakkında verdiği analiz var. Bundan yapılandırılmış bir profil çıkar.

GİRİŞ:
${rawContext.slice(0, 8000)}

GÖREV: Aşağıdaki JSON şemasına göre yanıt ver. SADECE JSON dön, başka hiçbir metin yazma.

{
  "name": "Firma/kişi adı (standart yazım)",
  "sector": "Sektör (ör: 'Turizm ve Konaklama', 'Diş Hekimliği', 'Endüstriyel Isıtma')",
  "city": "Şehir veya null",
  "district": "İlçe veya null",
  "country": "Ülke (Türkiye değilse doldur)",
  "products": ["3-5 ana ürün/hizmet. Özel isim ve parantez KULLANMA. 'Kafe & restoran hizmeti (Limoncello)' değil 'Restoran hizmeti'. Kısa net isimler."],
  "distinctives": ["3-5 ayırt edici özellik. Bu firmayı benzerlerden ayıran nişler. 'Pet-friendly konaklama', 'Edremit Güre lokasyon', 'Mandalina bahçesi', '12 ay açık' gibi."]
}

KRİTİK:
- products listesinde özel isim (markaya ait restoran adı, ürün modeli) YASAK
- distinctives asla jenerik olmasın ("kaliteli hizmet" YASAK, "deniz kenarı konum" OK)

═══════════════════════════════════════════════════════
KESIN GUARD — HALLUCINATION ÖNLEME
═══════════════════════════════════════════════════════

Aşağıdakileri profile EKLEME:
- Perplexity metninde "muhtemelen", "genelde", "büyük ihtimalle", "olabilir" gibi spekülasyon işareti olan özellikler
- Sitede doğrudan doğrulanmayan, başka işletmelerle benzetme yoluyla çıkarılmış özellikler
- Coğrafi bölgeye atfedilen ama spesifik olarak bu firmaya bağlanmamış özellikler (örneğin "Kazdağları'nda çoğu yer doğa temalı" → bu firma için "doğa temalı" yazma, net doğrulanmadıkça)
- Tematik yorum gerektiren özellikler (örneğin firma adında "İda" varsa → "Yunan mitolojisi temalı" çıkarımında bulunma, sitede açıkça belirtilmedikçe)

Şunları profile EKLE:
- Site içeriğinde doğrudan geçen firma adı, sektör, konum, ürün/hizmet isimleri
- Sitenin kendisinin öne çıkardığı özellikler (hakkımızda sayfasındaki iddialar, başlıklar)
- Sayısal bilgiler (kuruluş yılı, çalışan sayısı, proje sayısı) net verilmişse

ŞÜPHEDE KALDIYSAN: Özelliği profile EKLEME. Boş kalmak, yanlış olmaktan iyidir.

distinctives dizisine 0-5 arası özellik konabilir. 0 da kabul.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  const text = block?.type === "text" ? block.text : "";
  const cleaned = text.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);

  if (!match) {
    return emptyProfile(input, rawContext);
  }

  try {
    const parsed = JSON.parse(match[0]) as {
      name?: string;
      sector?: string;
      city?: string | null;
      district?: string | null;
      country?: string | null;
      products?: string[];
      distinctives?: string[];
    };

    const products = (parsed.products ?? [])
      .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      .map((p) => stripParensAndSpecialNames(p))
      .slice(0, 5);

    const distinctives = (parsed.distinctives ?? [])
      .filter((d): d is string => typeof d === "string" && d.trim().length > 0)
      .slice(0, 5);

    const hasEnoughData = products.length >= 2 && parsed.name;

    return {
      name: parsed.name ?? deriveNameFromInput(input),
      sector: parsed.sector ?? "",
      location: {
        city: parsed.city ?? undefined,
        district: parsed.district ?? undefined,
        country: parsed.country ?? undefined,
      },
      products,
      distinctives,
      rawContext,
      contextQuality: hasEnoughData ? "rich" : "thin",
    };
  } catch {
    return emptyProfile(input, rawContext);
  }
}

function stripParensAndSpecialNames(product: string): string {
  // "Kafe & restoran hizmeti (Limoncello Cafe)" → "Kafe & restoran hizmeti"
  return product
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function deriveNameFromInput(input: AnalyzeInput): string {
  if (input.fullName) return input.fullName;
  if (input.domain) {
    return input.domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split(".")[0]
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }
  return "Bilinmiyor";
}

function emptyProfile(input: AnalyzeInput, rawContext: string): FirmProfile {
  return {
    name: deriveNameFromInput(input),
    sector: "",
    location: {},
    products: [],
    distinctives: [],
    rawContext,
    contextQuality: rawContext.length < 50 ? "empty" : "thin",
  };
}
