/**
 * Ürün bazlı rakip bulma — Perplexity Sonar prompt builder'ları.
 *
 * 4 kapı, 4 farklı prompt yapısı:
 *   firma    → üretici + kurulum (ikili kategori)
 *   kisi     → il bazlı aynı uzmanlıktaki diğer kişiler
 *   eticaret → aynı ürün kategorisini satan markalar (marketplace farkında)
 *   yurtdisi → Türk kökenli + hedef pazar yerel (çift pazar)
 *
 * Output: JSON array, şema kapıya göre değişir.
 */

export type ProductCompetitorDoor = "firma" | "kisi" | "eticaret" | "yurtdisi";

export interface ProductCompetitorPromptInput {
  door: ProductCompetitorDoor;
  domain: string; // hariç tutulacak (kendisini listelemesin)
  productName: string;
  sector?: string;

  // Firma
  cities?: string[];

  // Kişi
  fullName?: string;
  expertise?: string;
  city?: string;

  // E-ticaret
  priceSegment?: "ekonomik" | "orta" | "premium" | "luks";

  // Yurtdışı
  targetMarket?: string;
}

// ═══════════════════════════════════════════════════════════
// FİRMA — Üretici + Kurulum/Bayi ikili kategorisi
// ═══════════════════════════════════════════════════════════

function buildFirmaPrompt(input: ProductCompetitorPromptInput): string {
  const cityHint = input.cities?.length
    ? `\nÖzellikle ${input.cities.join(", ")} bölgesinde faaliyet gösterenleri öne çıkar.`
    : "";
  const sectorHint = input.sector ? `\nSektör: ${input.sector}` : "";

  return `Türkiye'de "${input.productName}" alanında faaliyet gösteren firmaları 2 kategoride listele.${sectorHint}${cityHint}

1) ÜRETİCİ / MARKA firmalar
   - Bu ürünü kendi markası altında üreten veya Türkiye'ye ithal eden firmalar
   - Öncelik: yerli Türk üreticiler (.com.tr, Türk sermayeli, KOBİ'ler dahil)
   - Sonra: Türkiye'de aktif global markalar (TR distribütörlü)

2) KURULUM / BAYİ / HİZMET firmalar
   - Son kullanıcıya (ev sahibi, müteahhit, mühendis) bu ürünü kurarak/satarak hizmet veren firmalar
   - Büyükşehirlerde (İstanbul, Ankara, İzmir, Bursa) ofisli, proje referansları olan, web sitesi aktif

Her iki kategoriden en az 3'er firma, toplam 8-12.
${input.domain} HARİÇ.

KRİTİK:
- Uydurma. Emin olmadığın firmayı listeleme.
- Her firma için URL (domain.com formatında) zorunlu. URL bulamadıysan o firmayı atla.
- category mutlaka "producer" VEYA "installer" olmalı.

SADECE JSON array dön, başka hiçbir metin yazma:
[{"name": "Firma Adı", "url": "domain.com", "category": "producer", "reason": "Neden rakip, 1 cümle"}]`;
}

// ═══════════════════════════════════════════════════════════
// KİŞİ — İl bazlı aynı uzmanlıktaki diğer kişiler
// ═══════════════════════════════════════════════════════════

function buildKisiPrompt(input: ProductCompetitorPromptInput): string {
  const cityLine = input.city ? `${input.city}'de ` : "";
  const personExclusion = input.fullName ? `\n${input.fullName} HARİÇ.` : "";

  return `${cityLine}"${input.expertise ?? input.productName}" alanında çalışan diğer uzmanları listele.

Rakip kriterleri:
- Aynı il/bölge + aynı uzmanlık alt-alanı
- Aktif dijital varlığı olan (kişisel web sitesi, Instagram, Doktorsitesi, LinkedIn, YouTube)
- Farklı kişiler — aynı klinikten/ofisten 2 kişi ÇIKARMA
- Muayenehanede/ofiste aktif çalışan, emekli veya pasif olanları listeleme

En az 5, en fazla 10 uzman.${personExclusion}

KRİTİK:
- Uydurma. Emin olmadığın ismi listeleme.
- Her kişi için url (profil veya web) zorunlu. URL bulamadıysan atla.
- platform alanı: "LinkedIn" | "Website" | "Instagram" | "Doktorsitesi" | "YouTube" | "Other"

SADECE JSON array:
[{"name": "Ad Soyad", "url": "url veya domain.com", "platform": "LinkedIn", "reason": "Aynı uzmanlık, 1 cümle"}]`;
}

// ═══════════════════════════════════════════════════════════
// E-TİCARET — Aynı ürün kategorisini satan markalar
// ═══════════════════════════════════════════════════════════

function buildEticaretPrompt(input: ProductCompetitorPromptInput): string {
  const segmentHint = input.priceSegment
    ? `\nFiyat segmenti: ${input.priceSegment}. Aynı segmenti hedefleyen markalara odaklan.`
    : "";

  return `"${input.productName}" ürün kategorisinde Türkiye'de aktif satış yapan e-ticaret markalarını listele.${segmentHint}

Rakip kriterleri:
- Bu ürünü satan (üreten veya re-seller)
- Aktif satış kanalları: kendi sitesi, Trendyol, Hepsiburada, Amazon.com.tr, N11
- Türkçe ürün sayfası olan, Türkiye'ye kargo yapan

En az 6, en fazla 10 marka.
${input.domain} HARİÇ.

KRİTİK:
- Uydurma. Gerçekten sattığını bildiğin markaları listele.
- Her marka için url (kendi sitesi veya marketplace sayfası) zorunlu.
- platforms alanı: hangi kanallarda satıyor? Array olarak: ["Kendi sitesi", "Trendyol"] gibi.

SADECE JSON array:
[{"name": "Marka Adı", "url": "domain.com", "platforms": ["Kendi sitesi", "Trendyol"], "reason": "Aynı ürünü satıyor, 1 cümle"}]`;
}

// ═══════════════════════════════════════════════════════════
// YURTDIŞI — Türk kökenli + Hedef pazar yerel (çift pazar)
// ═══════════════════════════════════════════════════════════

function buildYurtdisiPrompt(input: ProductCompetitorPromptInput): string {
  const target = input.targetMarket ?? "hedef pazar";

  return `Türkiye kökenli bir firma, "${input.productName}" ürününü ${target} pazarına ihraç ediyor.

${target}'teki müşterilerin karar verirken karşılaştıracağı firmaları 2 kategoride listele:

1) TÜRKİYE KÖKENLİ firmalar — ${target}'e aktif ihraç yapan Türk markaları (3-5 firma)
2) ${target} YEREL firmalar — ${target}'te aktif yerel üreticiler veya global markalar (3-5 firma)

Toplam 6-10 rakip.
${input.domain} HARİÇ.

KRİTİK:
- Uydurma. İhracat/satış yaptığından emin olduğun firmaları listele.
- Her firma için url (kendi sitesi) zorunlu.
- market alanı: "Türkiye" VEYA "${target}" (hedef pazar adı).

SADECE JSON array:
[{"name": "Firma Adı", "url": "domain.com", "market": "Türkiye", "reason": "Neden rakip, 1 cümle"}]`;
}

// ═══════════════════════════════════════════════════════════
// Dispatcher
// ═══════════════════════════════════════════════════════════

export function buildProductCompetitorPrompt(
  input: ProductCompetitorPromptInput,
): string {
  switch (input.door) {
    case "firma":
      return buildFirmaPrompt(input);
    case "kisi":
      return buildKisiPrompt(input);
    case "eticaret":
      return buildEticaretPrompt(input);
    case "yurtdisi":
      return buildYurtdisiPrompt(input);
  }
}
