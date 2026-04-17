/**
 * 4 kullanıcı tipi için Perplexity Sonar prompt builder'ları.
 *
 * Tüm prompt'lar tek JSON formatı döndürür (DiscoveryResult'a uyumlu).
 * Tipe göre ek alanlar içerir.
 */

import type { DiscoveryInput } from "./discovery-types";

// ═══════════════════════════════════════════════════════════
// FİRMA
// ═══════════════════════════════════════════════════════════

export function buildFirmaPrompt(input: DiscoveryInput): string {
  const url = input.url ?? "";
  const brandName = input.brandName ? `\nMarka Adı: ${input.brandName}` : "";
  const competitorHint = input.competitor
    ? `\nKullanıcının bildiği bir rakip: ${input.competitor}`
    : "";
  const locationHint = input.location ? `\nKonum: ${input.location}` : "";

  return `Aşağıdaki web sitesini detaylıca incele ve kapsamlı bir şirket profili oluştur:

Website: ${url}${brandName}${locationHint}${competitorHint}

GÖREV 1 — ŞİRKET KİMLİĞİ:
1. Bu şirketin sattığı ÜRÜNLERİ listele (max 8, fiziksel ürünler/cihazlar/malzemeler)
2. Bu şirketin sunduğu HİZMETLERİ listele (max 5, proje/danışmanlık/kurulum vb.)
3. Şirketin faaliyet gösterdiği SEKTÖRÜ belirle
4. Şirket hakkında 1 cümlelik açıklama
5. Şirketin KONUMU (il, ilçe)

GÖREV 2 — RAKİP ANALİZİ:
Bu şirketin aynı sektörde, aynı bölgede faaliyet gösteren EN YAKIN 3 RAKİBİNİ bul.
Her rakip için: firma adı, URL, neden rakip (1 cümle).

GÖREV 3 — HEDEF SORGULAR:
Potansiyel müşterilerin AI asistanlarında (ChatGPT, Claude, Perplexity) arayacağı 10-15 adet SORGU üret.

Sorgu tipleri:
- Sektör sorgusu: "en iyi [sektör] [il]"
- Ürün sorgusu: "[ürün] nereden alınır"
- Karşılaştırma: "[ürün] en iyi marka"
- Bilgi: "[ürün/hizmet] nasıl seçilir"
- Tavsiye: "[hizmet] tavsiye edilir mi"

KESİN KURALLAR:
- Sadece GERÇEKTEN sattıkları/sundukları şeyleri listele, tahmin yapma
- HİZMET firması ise "products" BOŞ bırak, sadece "services" doldur
- ÜRÜN satıyorsa "services" boş bırakılabilir
- "Peşin ödeme indirimi" gibi kampanyalar HİZMET DEĞİLDİR — listeye koyma
- Her madde kısa olsun (1-4 kelime)
- Türkçe cevapla
- Bilgi bulamazsan boş array dön

SADECE aşağıdaki JSON formatında cevapla, başka hiçbir metin yazma:

{
  "products": ["ürün 1", "ürün 2"],
  "services": ["hizmet 1", "hizmet 2"],
  "sector": "Sektör Adı",
  "description": "Kısa açıklama.",
  "location": {"city": "İl", "district": "İlçe"},
  "companyType": "firma",
  "competitors": [
    {"name": "Firma", "url": "domain.com", "reason": "Neden rakip"}
  ],
  "targetQueries": [
    {"query": "sorgu 1"},
    {"query": "sorgu 2"}
  ]
}`;
}

// ═══════════════════════════════════════════════════════════
// KİŞİ
// ═══════════════════════════════════════════════════════════

export function buildKisiPrompt(input: DiscoveryInput): string {
  const fullName = input.fullName ?? "";
  const expertise = input.expertise ?? "";
  const location = input.location ? `\nKonum: ${input.location}` : "";
  const url = input.url ? `\nWebsite: ${input.url}` : "";
  const social = input.socialMedia ? `\nSosyal Medya: ${input.socialMedia}` : "";
  const competitorHint = input.competitor
    ? `\nKullanıcının bildiği bir rakip: ${input.competitor}`
    : "";

  return `Aşağıdaki kişiyi internette araştır ve kapsamlı bir profil oluştur:

Kişi: ${fullName}
Uzmanlık Alanı: ${expertise}${location}${url}${social}${competitorHint}

GÖREV 1 — KİŞİ KİMLİĞİ:
1. Bu kişinin UZMANLIK ALANLARI (max 5)
2. Bu kişinin sunduğu HİZMETLER veya yaptığı İŞLER (max 5)
   (muayene, danışmanlık, eğitim, içerik üretimi, koçluk, kitap vb.)
3. Aktif olduğu PLATFORMLAR (website, Instagram, YouTube, LinkedIn,
   Google Business, Doktorsitesi, akademik profil, podcast vb.) — URL'leriyle
4. Faaliyet SEKTÖRÜ
5. Kişi hakkında 1 cümlelik açıklama
6. KONUMU (il, ilçe)

GÖREV 2 — RAKİP ANALİZİ:
Bu kişinin aynı alanda çalışan EN YAKIN 3 RAKİBİNİ bul.
Aynı uzmanlıkta, aynı bölgede veya aynı dijital platformlarda aktif kişiler.
Her rakip için: ad soyad, platform/URL, neden rakip (1 cümle).

GÖREV 3 — HEDEF SORGULAR:
Potansiyel müşterilerin/takipçilerin arayacağı 10-15 adet SORGU üret.

Sorgu tipleri:
- İsim sorgusu: "dr ahmet yılmaz", "ahmet yılmaz kim"
- Hizmet sorgusu: "[konum] [uzmanlık]" — "istanbul diş hekimi"
- Bilgi sorgusu: "[uzmanlık alanı] nasıl yapılır"
- Tavsiye: "en iyi [uzmanlık] [konum]"
- Platform: "[isim] instagram", "[isim] youtube"

KESİN KURALLAR:
- Sadece İNTERNETTE BULDUĞUN gerçek bilgileri yaz, uydurma
- Bulamadığın alanları boş bırak
- Türkçe cevapla

SADECE JSON:

{
  "expertise": ["uzmanlık 1", "uzmanlık 2"],
  "services": ["hizmet 1", "hizmet 2"],
  "products": [],
  "platforms": [
    {"name": "Instagram", "url": "instagram.com/handle", "followers": "tahmini"},
    {"name": "Website", "url": "domain.com"}
  ],
  "sector": "Sektör",
  "description": "Açıklama.",
  "location": {"city": "İl", "district": "İlçe"},
  "companyType": "kisi",
  "competitors": [
    {"name": "Ad Soyad", "url": "platform/url", "reason": "Neden rakip"}
  ],
  "targetQueries": [
    {"query": "sorgu 1"},
    {"query": "sorgu 2"}
  ]
}`;
}

// ═══════════════════════════════════════════════════════════
// E-TİCARET
// ═══════════════════════════════════════════════════════════

export function buildEticaretPrompt(input: DiscoveryInput): string {
  const mode = input.ecommerceMode ?? "website";
  const inputLine =
    mode === "website"
      ? `Website: ${input.url ?? ""}`
      : mode === "marketplace"
        ? `Marketplace Sayfası: ${input.marketplaceUrl ?? ""}`
        : `Marka/Ürün Adı: ${input.brandOrProductName ?? ""}`;
  const category = input.category ? `\nKategori: ${input.category}` : "";
  const competitorHint = input.competitor
    ? `\nKullanıcının bildiği bir rakip: ${input.competitor}`
    : "";

  return `Aşağıdaki e-ticaret markasını/ürününü araştır ve kapsamlı profil oluştur:

${inputLine}${category}${competitorHint}

GÖREV 1 — MARKA KİMLİĞİ:
1. Bu markanın/mağazanın sattığı ÜRÜNLER (max 8)
2. Hangi PLATFORMLARDA satış yapıyor?
   (kendi sitesi, Trendyol, Hepsiburada, Amazon, N11, Çiçeksepeti vb.)
   Her biri URL ile, aktif/pasif belirt
3. Fiyat SEGMENTİ: "ekonomik" / "orta" / "premium" / "luks"
4. Faaliyet SEKTÖRÜ ve alt KATEGORİ
5. Marka hakkında 1 cümlelik açıklama
6. KONUMU (tespit edilebiliyorsa)

GÖREV 2 — RAKİP ANALİZİ:
Bu markanın/ürünün EN YAKIN 3 RAKİBİNİ bul.
Aynı kategoride, benzer fiyat segmentinde, aynı platformlarda satan markalar.
Her rakip için: marka adı, URL, neden rakip (1 cümle).

GÖREV 3 — HEDEF SORGULAR:
Potansiyel alıcıların arayacağı 10-15 sorgu:

Sorgu tipleri:
- Ürün sorgusu: "[ürün] fiyat", "[ürün] satın al"
- Marka sorgusu: "[marka] yorumları", "[marka] güvenilir mi"
- Karşılaştırma: "[ürün] en iyi marka", "[marka] vs [rakip]"
- Bilgi: "[ürün] nasıl seçilir", "[ürün] rehberi"
- Platform: "[ürün] trendyol", "en çok satan [kategori]"

KESİN KURALLAR:
- GERÇEK bilgi yaz, uydurma
- Marketplace URL verildiyse o sayfayı incele
- Marka adı verildiyse internette ara ve bul
- Türkçe cevapla

SADECE JSON:

{
  "products": ["ürün 1", "ürün 2"],
  "services": [],
  "platforms": [
    {"name": "Trendyol", "url": "trendyol.com/...", "active": true},
    {"name": "Hepsiburada", "url": "hepsiburada.com/...", "active": true},
    {"name": "Kendi Sitesi", "url": "domain.com", "active": false}
  ],
  "priceSegment": "orta",
  "sector": "Sektör",
  "category": "Alt Kategori",
  "description": "Açıklama.",
  "location": {"city": "İl", "district": "İlçe"},
  "companyType": "eticaret",
  "competitors": [
    {"name": "Marka", "url": "url", "reason": "Neden rakip"}
  ],
  "targetQueries": [
    {"query": "sorgu 1"},
    {"query": "sorgu 2"}
  ]
}`;
}

// ═══════════════════════════════════════════════════════════
// YURTDIŞI (Export)
// ═══════════════════════════════════════════════════════════

export function buildYurtdisiPrompt(input: DiscoveryInput): string {
  const url = input.url ?? "";
  const brandName = input.brandName ? `\nFirma Adı: ${input.brandName}` : "";
  const targetMarkets = input.targetMarkets
    ? `\nHedef Pazarlar: ${input.targetMarkets}`
    : "";
  const siteLanguage = input.siteLanguage
    ? `\nSite Dili: ${input.siteLanguage}`
    : "";
  const competitorHint = input.competitor
    ? `\nKullanıcının bildiği bir rakip: ${input.competitor}`
    : "";

  return `Aşağıdaki şirketi uluslararası pazarda analiz et:

Website: ${url}${brandName}${targetMarkets}${siteLanguage}${competitorHint}

GÖREV 1 — ŞİRKET KİMLİĞİ:
1. ÜRÜNLERİ (max 8)
2. HİZMETLERİ (max 5)
3. Faaliyet SEKTÖRÜ
4. 1 cümlelik açıklama
5. Merkez KONUMU (Türkiye — il, ilçe)
6. Hangi ÜLKELERİ hedefliyor? (siteden tespit et: dil seçenekleri, para birimi, shipping hedefleri)
7. Site DİLLERİ (hangi dillerde içerik var — "tr", "en", "de", "ar" vb.)

GÖREV 2 — RAKİP ANALİZİ:
Bu şirketin HEM TÜRKİYE'DEKİ hem de HEDEF PAZARDAKİ rakiplerini bul.
Türkiye'den 2 rakip + hedef pazardan 2 rakip = toplam 3-4 rakip.
Her rakip için: firma adı, URL, pazar ("Türkiye"/"ABD"/...), neden rakip.

GÖREV 3 — HEDEF SORGULAR:
10-15 sorgu üret — HEM TÜRKÇE HEM İNGİLİZCE (veya hedef pazar dili):

Sorgu tipleri:
- Türkçe: "[ürün] ihracat", "[ürün] üreticisi türkiye"
- İngilizce: "[product] manufacturer turkey", "[product] supplier"
- Hedef pazar dili (varsa): "[produkt] hersteller türkei" (Almanca)
- Marka: "[brand name]", "[brand] reviews"

KESİN KURALLAR:
- Sadece siteden tespit ettiğini yaz, tahmin yapma
- targetQueries array'inde her sorguya "language" alanı ekle ("tr", "en", "de" vb.)
- Bilgi bulamadıysan boş array

SADECE JSON:

{
  "products": ["ürün 1"],
  "services": ["hizmet 1"],
  "sector": "Sektör",
  "description": "Açıklama.",
  "location": {"city": "İl", "district": "İlçe", "country": "Türkiye"},
  "companyType": "yurtdisi",
  "targetCountries": ["ABD", "Almanya"],
  "siteLanguages": ["tr", "en", "de"],
  "competitors": [
    {"name": "Firma", "url": "url", "market": "Türkiye", "reason": "..."},
    {"name": "Firma", "url": "url", "market": "ABD", "reason": "..."}
  ],
  "targetQueries": [
    {"query": "heating cable manufacturer turkey", "language": "en"},
    {"query": "ısıtma kablosu ihracat", "language": "tr"}
  ]
}`;
}

// ═══════════════════════════════════════════════════════════
// Dispatcher
// ═══════════════════════════════════════════════════════════

export function buildPromptByType(input: DiscoveryInput): string {
  switch (input.companyType) {
    case "firma":
      return buildFirmaPrompt(input);
    case "kisi":
      return buildKisiPrompt(input);
    case "eticaret":
      return buildEticaretPrompt(input);
    case "yurtdisi":
      return buildYurtdisiPrompt(input);
    default:
      return buildFirmaPrompt(input);
  }
}
