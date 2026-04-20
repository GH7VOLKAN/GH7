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

4. Her sorguda EN AZ BİR somut ürün/hizmet/uzmanlık adı geçmeli,
   genel kategori yerine dar niş kullanılmalı.

5. Sorgular POTANSİYEL MÜŞTERİ PERSPEKTİFİNDEN olmalı — "müşteri bir
   ürün/hizmet arıyor" niyeti. Marka adını açıkça SORMA. Müşteri zaten
   markayı bilmiyor olabilir; yeni bir firma/rakip arıyor. Markayı sorgu
   içinde anmak yerine, AI'ın cevabında markadan bahsedip bahsetmediğini
   ölç (bu işi analyzer yapar — sorgu içeriğinde marka adı geçmemeli).

   ❌ YASAK: "[marka] hakkında ne biliyorsun"
   ❌ YASAK: "[marka] güvenilir mi"
   ❌ YASAK: "[kişi adı] kimdir"
   ✅ DOĞRU: "balıkesir'de en iyi diş hekimi kim, isim ver"
   (AI cevabında [kişi adı] geçerse → bahsedildi olarak sayılır)

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

GÖREV 2 — ÜRÜN/HİZMET BAZLI RAKİP ANALİZİ (ÇOK ÖNEMLİ):

⚠️ ÖNEMLİ: "Aynı sektör" YETMEZ. Aynı SPESİFİK ürün/hizmeti sunan firmalar bul.

🔤 TÜRKÇE KARAKTER KURALI:
- Marka isimlerini kullanıcının yazdığı ŞEKİLDE koru: "İdavilla" (büyük noktalı İ),
  "Işıkhan" gibi. "Idavilla" (noktasız I) farklı bir marka olarak ele alınabilir.
- Arama yaparken hem "İ" hem "I" versiyonunu dene ama ÇIKTIDA orijinal yazımı koru.
- ş/s, ğ/g, ı/i, ö/o, ü/u, ç/c farklarını karıştırma.

⛔ UYDURMA DOMAIN YASAĞI (kritik):
- Her "url" alanı GERÇEK, Google'da bulunabilen bir domain olmalı.
- EMİN DEĞİLSEN url'yi BOŞ ("") bırak, uydurmaktansa boş ver.
- Yazım emin değilsen firma adını listele ama url alanını "" yap.
- Domain yazımından şüphe duyduğun hallerde: açmayan hayali site yazmak
  sistemi bozuyor — boş bırak, kullanıcı elle ekler.

AŞAMALI YAKLAŞIM:
1. Önce Görev 1'de tespit ettiğin ÜRÜNLERİ/HİZMETLERİ listele
2. Her ürün/hizmet için Türkiye pazarında bu ürünü üreten/satan firmalara ara
3. En sık tekrar eden, ürün kategorisi bire bir eşleşen firmalar → rakip

🇹🇷 ÖNCELİK SIRASI (Türkiye ağırlıklı):
  1. YERLİ TÜRK FİRMALARI (en az 3-4 tane)
     Türk sermayeli, .com.tr uzantılı, Türkiye'de üretim yapan.
     KOBİ veya orta boy markalar da dahil — sadece büyük markaları listeleme.
  2. TÜRKİYE OFİSLİ/DISTRIBÜTÖRLÜ GLOBAL MARKALAR (2-3 tane)
     Türkiye'de aktif satış yapan, Türkçe web sitesi veya distribütörü olan.
  3. SADECE GLOBAL MARKALAR (en fazla 1-2 tane, son çare)
     Türkiye'de temsilcisi yok ama müşteri bilgi amaçlı rakip sayabilir.

KURAL: Rakibin TESPİT ETTİĞİN ürün/hizmetleriyle bire bir örtüşmeli.
- Örn: "heat tracing kablo" yapıyorsan rakip: Nexans TR, Elektro Dizayn, Thermopads
- YANLIŞ rakip: "yerden ısıtma" firması (heat tracing ile farklı kategori)
- YANLIŞ rakip: sadece ısıtma sistemi dediği için Vaillant, Bosch

EN AZ 6, EN FAZLA 10 RAKİP bul. Kullanıcı bu listeden 3 tane seçecek.
Kalite > sayı: Uydurma firma ekleme, emin olmadığını atla.

Her rakip için: firma adı, URL (domain.com), neden rakip (1 cümle — HANGİ ürün eşleşiyor söyle).

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

ÖRNEK — Firma (Balıkesir/İstanbul/İzmir bölgesi, konaklama sektörü):
  "edremit güre bölgesinde bungalov konaklama tesisleri listele"
  "kazdağları eteklerinde doğayla iç içe konaklama yerleri öner"
  "balıkesir edremit'te termal otel ve bungalov tesisleri hangileri"
  "ailece kazdağlarında hafta sonu tatili için 5 yer öner"
  "istanbul'dan kazdağlarına tatil için bungalov tesis öner"
  "izmir'den edremit körfezine konaklama önerilerin neler"
  "güre akçay'da mandalina bahçesinde bungalov hangi tesisler"
  "adana'dan güre'ye hafta sonu bungalov tatili için tesis öner"
  "balıkesir edremit'te evcil hayvan kabul eden bungalov tesisleri"

KRİTİK: Sorgularda MARKA ADINI KULLANMA. Müşteri yeni bir firma arıyor,
marka adını bilmiyor olabilir. Sorgular "potansiyel müşteri bakış açısı"
ile yazılmalı — sen hizmet arıyormuş gibi.

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

GÖREV 2 — UZMANLIK/HİZMET BAZLI RAKİP ANALİZİ:

⚠️ "Aynı meslek" YETMEZ. Aynı SPESİFİK uzmanlık alt-alanını paylaşan kişiler.

AŞAMALI YAKLAŞIM:
1. Önce kişinin SPESİFİK uzmanlık alanlarını/hizmet konularını tespit et
2. Her uzmanlık için "bu alanda çalışan Türkiye'deki kişiler" ara
3. Aynı il/bölgede → aynı alanda → aktif dijital varlığa sahip olanlar rakip

🇹🇷 ÖNCELİK SIRASI:
  1. AYNI İL/BÖLGE + AYNI UZMANLIK (en az 3 kişi)
  2. DİĞER İLLERDE aynı uzmanlık (2-3 kişi)
  3. BENZER/KOMŞU uzmanlık (son çare, en fazla 1-2)

KURAL: Rakibin TESPİT ETTİĞİN uzmanlıkla bire bir örtüşmeli.
- Örn: Ortodonti uzmanı diş hekimi → rakip: Ortodonti uzmanı hekimler
- YANLIŞ rakip: Genel diş hekimi (alt uzmanlık yok)
- YANLIŞ rakip: Muhasebeci, Avukat (başka meslek)
- Örn: Aile hukuku avukatı → rakip: Aile hukuku avukatları
- YANLIŞ rakip: Ceza hukuku avukatı (farklı alt-alan)

EN AZ 6, EN FAZLA 10 kişi bul. Kullanıcı bu listeden 3 tane seçecek.
Her rakip için: ad soyad, platform/URL (LinkedIn/kişisel site), pazar (il),
neden rakip (HANGİ uzmanlık eşleşiyor, 1 cümle).

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

ÖRNEK — Kişi (Balıkesir bölgesi, diş hekimliği):
  "balıkesir'de en iyi diş hekimlerini listele"
  "edremit'te implant yapan diş hekimi öner"
  "balıkesir'de zirkonyum diş kaplama yapan doktorlar hangileri"
  "bandırma'da çocuk diş hekimi tavsiye et"
  "balıkesir diş hekimleri arasında hangisini önerirsin, karşılaştır"
  "gömülü yirmilik diş çekimi için balıkesir'de uzman doktor kim"
  "balıkesir merkez'de estetik diş hekimliği yapan kliniği öner"

KRİTİK: Sorgularda KİŞİ ADINI KULLANMA. Potansiyel hasta yeni bir
diş hekimi arıyor, kişinin adını bilmiyor. Sorgular "arayan müşteri
perspektifi" — uzmanlık + il + spesifik ihtiyaç içermeli.

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

GÖREV 2 — ÜRÜN KATEGORİSİ BAZLI RAKİP ANALİZİ:

⚠️ "Aynı sektör" YETMEZ (kozmetik, giyim). Aynı SPESİFİK ürün alt-kategorisi.

AŞAMALI YAKLAŞIM:
1. Önce markanın SPESİFİK ürünlerini tespit et (alt kategori, fiyat segmenti)
2. Her ürün için "bu ürünü satan Türk e-ticaret markaları" ara
3. Marketplace'te (Trendyol, Hepsiburada) aynı kategori altında satan markalar → rakip

🇹🇷 ÖNCELİK SIRASI:
  1. TÜRK E-TİCARET MARKALARI (en az 3-4 tane)
     Kendi sitesi olan + Trendyol/Hepsiburada'da mağaza açmış Türk markalar
  2. TÜRKİYE'DE SATIŞI OLAN GLOBAL MARKALAR (2-3 tane)
     Turkcell/Amazon.com.tr'de satılan, Türkçe sitesi olan global markalar
  3. SADECE GLOBAL MARKALAR (en fazla 1-2 tane, son çare)
     Türkiye'de olmayan ama kullanıcı karşılaştırma yapabilir

KURAL: Rakibin TESPİT ETTİĞİN ürün kategorisiyle bire bir örtüşmeli.
- Örn: Organik bebek maması → rakip: Hipp Organik, Bebelac Organik, Milupa Bio
- YANLIŞ rakip: Konvansiyonel bebek maması (organik değil)
- YANLIŞ rakip: Yetişkin vitamin (bebek değil)
- Örn: El dokuması halı → rakip: Hereke, İpek Kilim, Sümerhalı (Türk markalar)
- YANLIŞ rakip: Makine halısı (el dokuması değil)

Fiyat segmenti de yakın olmalı — premium el dokuması ile ucuz makine halısı karışmaz.

EN AZ 6, EN FAZLA 10 rakip bul. Kullanıcı bu listeden 3 tane seçecek.
Her rakip için: marka adı, URL, neden rakip (HANGİ ürün kategorisi + fiyat segmenti eşleşiyor).

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

ÖRNEK — E-ticaret (yerden ısıtma kablosu kategorisi, Türkiye):
  "elektrikli yerden ısıtma kablosu satın almak istiyorum, en iyi markaları listele"
  "villa banyosu için yerden ısıtma kablosu hangi marka iyi öner"
  "yerden ısıtma kablosu alırken hangi marka daha güvenilir, karşılaştır"
  "türkiye'de yerden ısıtma kablosu üreten firmalar hangileri"
  "trendyol'da yerden ısıtma kablosu en iyi markalar listele"
  "hepsiburada yerden ısıtma kablosu hangi markaları var"
  "karbon film ısıtıcı vs rezistans kablo hangisini seçmeli, marka önerin"

KRİTİK: Sorgularda MARKA ADINI KULLANMA. Potansiyel alıcı yeni bir marka
arıyor. Sorgular marka-agnostik olmalı — kategori + ürün + marketplace +
karşılaştırma içermeli.

Marketplace vurgusu: sorguların bir kısmına "trendyol'da", "hepsiburada'da",
"amazon'da" gibi platform adları ekle — alıcı niyetini yansıtsın.

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

GÖREV 2 — ÜRÜN/HİZMET BAZLI ÇİFT PAZAR RAKİP ANALİZİ:

⚠️ Yurtdışı firma iki pazarda rekabet eder: TR (menşei) + Hedef pazar (müşteri).
Her ikisinde de rakip olmalı. Tek pazarda değil.

AŞAMALI YAKLAŞIM:
1. Önce firmanın SPESİFİK ürün/hizmetlerini tespit et
2. Türkiye'deki aynı ürünü ihraç eden firmaları ara (en az 4)
3. Hedef pazarda aynı ürünü satan yerel firmaları ara (en az 2)
4. Müşterinin karar aşamasında karşılaştıracağı markalar → rakip

PAZAR DAĞILIMI (ÇIFT ODAKLı):
  🇹🇷 TÜRKİYE'DEN 4-6 firma:
     Aynı ürünü ihraç eden Türk firmaları.
     Kapasite, kalite, fiyat benzer olmalı.
  🌐 HEDEF PAZARDAN 2-4 firma:
     Hedef pazarda yerel üretici/dağıtıcı firmalar.
     Müşteri kolaylıkla karşılaştırabileceği yerel alternatifler.

KURAL: Rakibin TESPİT ETTİĞİN ürün/hizmetlerle bire bir örtüşmeli.
- Örn: Türkiye'den ABD'ye organik kuruyemiş ihracatı yapıyorsan:
  - TR rakipler: Aksu Kuruyemiş, Tadım, Peyman (ABD'ye satan Türk markalar)
  - ABD rakipler: Sun-Maid, Sunsweet (yerel ABD kuruyemiş markaları)
- YANLIŞ rakip: Yerel Türkiye pazarında satan Türk markalar (ihracat yok)
- YANLIŞ rakip: ABD'deki start-up'lar (segment uymaz)

EN AZ 6, EN FAZLA 10 rakip bul. Kullanıcı bu listeden 3 tane seçecek.
Her rakip için: firma adı, URL, pazar ("Türkiye"/"ABD"/"Almanya"/vb.),
neden rakip (HANGİ ürün + HANGİ pazar eşleşiyor).

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

ÖRNEK — Yurtdışı ihracatçı (yerden ısıtma kablosu, hedef: Almanya + Körfez):
  "best heating cable manufacturers in turkey, list them"
  "reliable electric floor heating cable suppliers from turkey"
  "which turkish companies export underfloor heating to germany"
  "beste fußbodenheizung kabel hersteller aus der türkei"
  "turkish heating cable brands for wholesale, compare"
  "ısıtma kablosu ihracatı yapan türk firmaları listele"
  "top floor heating cable exporters from turkey to middle east"
  "which turkish heating cable manufacturer is best for large projects"

KRİTİK: Sorgularda MARKA ADINI KULLANMA (ne İngilizce ne Türkçe). Yabancı
alıcı yeni bir tedarikçi arıyor — spesifik marka adını bilmiyor. Sorgular
"manufacturer / supplier / exporter / wholesale" niyeti ile yazılmalı.

Dil dağılımı: ~60% hedef pazar dili (en/de/ar), ~40% Türkçe. Hedef pazar
dili birden fazlaysa karışık kullan.

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
