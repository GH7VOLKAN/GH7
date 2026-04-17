/**
 * 4 kullanıcı tipi için Perplexity Sonar prompt builder'ları.
 *
 * Tüm prompt'lar tek JSON formatı döndürür (DiscoveryResult'a uyumlu).
 * Tipe göre ek alanlar içerir.
 */

import type { DiscoveryInput } from "./discovery-types";

// ═══════════════════════════════════════════════════════════
// ORTAK TARGET QUERY KURALLARI — TÜM TİPLER
// ═══════════════════════════════════════════════════════════
// Bu kurallar her prompt'ın GÖREV 3 bölümüne eklenir.
// Amaç: AI platformlarını SOMUT İSİM VERMEYE zorlayan sorgular üretmek.

const COMMON_QUERY_RULES = `
ZORLAYICI KURALLAR (TARGET QUERIES için) — AI'ı somut isim vermeye zorla:

1. Her sorgu şu aksiyon kelimelerinden EN AZ BİRİNİ içermeli:
   "öner", "listele", "hangileri", "karşılaştır", "sırala",
   "tavsiye et", "isim ver", "en iyi 5", "en popüler", "nerede bulabilirim"

2. Her sorgu SPESİFİK olmalı — genel kategori DEĞİL, dar niş:
   ❌ KÖTÜ: "en iyi otel"
   ✅ İYİ: "edremit güre bölgesinde termal otel ve bungalov tesisleri öner"
   ❌ KÖTÜ: "yerden ısıtma"
   ✅ İYİ: "villa banyosu için elektrikli yerden ısıtma kablosu hangi markalar iyi"

3. Her sorgu FARKLI bir arama niyeti için olmalı — karışım zorunlu:
   - Doğrudan öneri: "[niş] yapan firma öner"
   - Karşılaştırma: "A mı B mi daha iyi"
   - Liste: "en iyi 5 [niş] listele"
   - Spesifik soru: "[niş] hizmeti veren yerler nereler"
   - Marka tanınırlığı: "[marka/kişi adı] hakkında ne biliyorsun"

4. Her sorguda EN AZ BİR somut ürün/hizmet/uzmanlık adı geçmeli,
   genel kategori yerine dar niş kullanılmalı.

5. BONUS — Marka/Kişi tanınırlık sorguları (2-3 adet ZORUNLU):
   "[marka adı] hakkında ne biliyorsun"
   "[marka adı] nasıl bir firma, güvenilir mi"
   "[kişi adı] kimdir" (kişi tipi için)
   Bu sorgular AI'ın markayı/kişiyi tanıyıp tanımadığını test eder.

6. Minimum 10, maksimum 15 sorgu üret. Tekrara düşme, her sorgu benzersiz olmalı.
`.trim();

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

GÖREV 3 — HEDEF SORGULAR (SPESİFİK ve İSİM ZORLAYICI):
Potansiyel müşterilerin AI asistanlarında (ChatGPT, Claude, Perplexity) arayacağı 10-15 adet SORGU üret.

${COMMON_QUERY_RULES}

FİRMA İÇİN 5 SORGU KATEGORİSİ (her kategoriden 2-3 sorgu):

a) Doğrudan firma öneri (il bazlı):
   "[il]'de [hizmet] yapan firmaları listele"
   "[il] [sektör] firmaları hangileri, sırala"
   "[il]'de en iyi 5 [hizmet] firması öner"

b) Ürün/hizmet bazlı:
   "[ürün] satın alabileceğim firmaları öner"
   "[hizmet] yaptırmak istiyorum, hangi firmaları tavsiye edersin"
   "türkiye'de [ürün] üreten firmalar hangileri"

c) Karşılaştırma:
   "[sektör]'de en iyi firmalar hangileri, karşılaştır"
   "[ürün] alırken hangi marka daha iyi"

d) Bilgi + öneri karışık:
   "[hizmet] nasıl yapılır ve bunu yapan güvenilir firmalar hangileri"
   "[il]'de [hizmet] yaptıracağım, nereden teklif almalıyım"

e) Marka tanınırlığı (ZORUNLU 2-3 adet):
   "[marka adı] hakkında ne biliyorsun"
   "[marka adı] nasıl bir firma, güvenilir mi"
   "[marka adı] [ürün/hizmet] konusunda iyi mi"

ÖRNEK — İdavilla (Balıkesir, İstanbul, İzmir):
  "edremit güre bölgesinde bungalov konaklama tesisleri listele"
  "kazdağları eteklerinde doğayla iç içe konaklama yerleri öner"
  "balıkesir edremit'te termal otel ve bungalov tesisleri hangileri"
  "ailece kazdağlarında hafta sonu tatili için 5 yer öner"
  "istanbul'dan kazdağlarına tatil için bungalov tesis öner"
  "izmir'den edremit körfezine konaklama önerilerin neler"
  "idavilla hakkında ne biliyorsun"
  "idavilla bungalov tavsiye eder misin"

KESİN KURALLAR (ÜRÜN/HİZMET çıkarımı için):
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

GÖREV 3 — HEDEF SORGULAR (SPESİFİK ve İSİM ZORLAYICI):
Potansiyel müşterilerin/takipçilerin AI asistanlarında arayacağı 10-15 adet SORGU üret.

${COMMON_QUERY_RULES}

KİŞİ İÇİN 4 SORGU KATEGORİSİ:

a) Doğrudan kişi öneri:
   "[il]'de [uzmanlık] öner"
   "[il] [ilçe]'de en iyi [uzmanlık] kim, isim ver"
   "[uzmanlık] arıyorum, [il]'de kimi önerirsin"

b) Spesifik hizmet:
   "[il]'de [spesifik işlem/tedavi] yapan [uzmanlık] listele"
   "[spesifik işlem] için en iyi [uzmanlık] kim, [il]'de"

c) Güven/tavsiye:
   "[il]'de iyi bir [uzmanlık] nasıl bulurum, tavsiye et"
   "[uzmanlık] seçerken nelere bakmalıyım ve [il]'de kimleri önerirsin"

d) Kişi tanınırlığı (ZORUNLU 2-3 adet):
   "[ad soyad] kimdir"
   "[ad soyad] [uzmanlık] olarak nasıl"
   "[ad soyad] hakkında yorumlar"

ÖRNEK — Dr. Ayşe Kaya (Diş Hekimi, Balıkesir):
  "balıkesir'de en iyi diş hekimlerini listele"
  "edremit'te implant yapan diş hekimi öner"
  "balıkesir'de zirkonyum diş kaplama yapan doktorlar hangileri"
  "bandırma'da çocuk diş hekimi tavsiye et"
  "balıkesir diş hekimleri arasında hangisini önerirsin, karşılaştır"
  "dr ayşe kaya diş hekimi hakkında ne biliyorsun"
  "dr ayşe kaya balıkesir tavsiye eder misin"

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

GÖREV 3 — HEDEF SORGULAR (SPESİFİK ve İSİM ZORLAYICI):
Potansiyel alıcıların AI asistanlarında arayacağı 10-15 adet SORGU üret.

${COMMON_QUERY_RULES}

E-TİCARET İÇİN 4 SORGU KATEGORİSİ:

a) Ürün/marka öneri:
   "[ürün] satın almak istiyorum, en iyi markaları listele"
   "[kategori] için hangi markaları tavsiye edersin"
   "[ürün] alacağım, hangi markalar güvenilir öner"

b) Karşılaştırma:
   "[ürün] alırken hangi marka daha iyi, karşılaştır"
   "[marka A] vs [marka B] hangisi daha iyi"
   "[kategori]'de en iyi 5 marka listele"

c) Bilgi + öneri karışık:
   "[ürün] nasıl seçilir ve hangi markalar kaliteli"
   "[ürün] alırken nelere dikkat etmeli, hangi markalar güvenilir"
   "trendyol'da / hepsiburada'da en iyi [kategori] markaları hangileri"

d) Marka tanınırlığı (ZORUNLU 2-3 adet):
   "[marka adı] hakkında ne biliyorsun"
   "[marka adı] güvenilir mi, yorumları nasıl"
   "[marka adı] [ürün] konusunda iyi mi"

ÖRNEK — ISITMAX (yerden ısıtma kablosu markası, Türkiye):
  "elektrikli yerden ısıtma kablosu satın almak istiyorum, en iyi markaları listele"
  "villa banyosu için yerden ısıtma kablosu hangi marka iyi öner"
  "yerden ısıtma kablosu alırken hangi marka daha güvenilir, karşılaştır"
  "türkiye'de yerden ısıtma kablosu üreten firmalar hangileri"
  "trendyol'da yerden ısıtma kablosu en iyi markalar listele"
  "isıtmax yerden ısıtma kablosu yorumları nasıl"
  "isıtmax markası güvenilir mi, hakkında ne biliyorsun"

Marketplace vurgusu: sorguların bir kısmına "trendyol'da", "hepsiburada'da", "amazon'da" gibi platform adları ekle — alıcı niyetini yansıtsın.

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

GÖREV 3 — HEDEF SORGULAR (SPESİFİK ve İSİM ZORLAYICI):
10-15 sorgu üret — HEM TÜRKÇE HEM HEDEF PAZAR DİLİNDE (İngilizce, Almanca, Arapça vb.)

${COMMON_QUERY_RULES}

YURTDIŞI İÇİN 4 SORGU KATEGORİSİ (her kategoriden hem TR hem EN/hedef dil):

a) Supplier / Manufacturer sorguları:
   EN: "best [product] manufacturers from turkey, list them"
   EN: "top [product] suppliers in turkey, recommend"
   TR: "[ürün] üreten en iyi türk firmaları listele"
   DE: "beste [produkt] hersteller in der türkei auflisten"

b) Export / B2B / Wholesale:
   EN: "which turkish companies export [product] to europe"
   EN: "[product] wholesale suppliers turkey, compare"
   TR: "[ürün] ihracatı yapan türk firmaları hangileri"

c) Karşılaştırma / Kalite:
   EN: "turkish [product] vs chinese [product], which brand is better"
   EN: "most reliable [product] brands from turkey"
   TR: "türk [ürün] markaları avrupa pazarında kimler"

d) Marka tanınırlığı (ZORUNLU 2-3 adet, hedef dilde):
   EN: "what do you know about [brand name]"
   EN: "is [brand name] a reliable [product] manufacturer"
   DE: "was wissen sie über [markenname]"

ÖRNEK — ISITMAX (yerden ısıtma kablosu ihracatçısı, hedef: Almanya + Körfez):
  "best heating cable manufacturers in turkey, list them"
  "reliable electric floor heating cable suppliers from turkey"
  "which turkish companies export underfloor heating to germany"
  "beste fußbodenheizung kabel hersteller aus der türkei"
  "turkish heating cable brands for wholesale, compare"
  "ısıtma kablosu ihracatı yapan türk firmaları listele"
  "what do you know about isitmax heating cables"
  "is isitmax a reliable heating cable manufacturer"

Dil dağılımı: ~60% hedef pazar dili (en/de/ar), ~40% Türkçe. Hedef pazar dili birden fazlaysa karışık kullan.

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
