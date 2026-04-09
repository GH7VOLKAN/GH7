# GH7.ai — Dashboard MVP Build Prompt

Bu prompt, GH7.ai Türkçe GEO (Generative Engine Optimization) platformunun dashboard MVP'sini tek seferde oluşturmak için yazılmıştır. Claude Code veya Cursor'da kullanılacaktır.

---

## PROJE TANIMI

GH7.ai, Türkiye'nin ilk ve tek Türkçe Generative Engine Optimization (GEO) platformudur. Firmaların ChatGPT, Claude, Gemini, Perplexity ve Google AI Overview gibi yapay zeka motorlarındaki görünürlüğünü takip eder, analiz eder ve iyileştirir.

Referans platform: Sellm.io — global bir GEO monitoring SaaS'ı. GH7 onun Türkiye'ye yerelleştirilmiş, ajans-entegrasyonlu, il bazlı versiyonudur.

---

## TEKNİK STACK

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI:** shadcn/ui (siyah/beyaz monokrom tema)
- **Font:** Inter (body) — display başlıklar için font-weight farkı yeterli
- **Auth:** Supabase Auth (email + Google + magic link)
- **Database:** Supabase (PostgreSQL)
- **Deploy:** Vercel
- **Harita:** React Simple Maps veya custom SVG (Türkiye 81 il)
- **Charts:** Recharts
- **Icons:** Lucide React (minimal kullanım)
- **Dil:** Tamamı Türkçe (arayüz, metrikler, hata mesajları, placeholder'lar)

---

## TASARIM SİSTEMİ

### Renkler
```
Arka plan: #FFFFFF (beyaz)
Yüzeyler: #FAFAFA (kartlar), #F5F5F5 (hover)
Metin birincil: #0A0A0A (neredeyse siyah)
Metin ikincil: #6B7280 (gri)
Metin üçüncül: #9CA3AF (açık gri)
Aksan: #18181B (siyah buton/badge)
Başarı: #22C55E (yeşil — iyi skor)
Uyarı: #F59E0B (sarı — orta skor)
Tehlike: #EF4444 (kırmızı — düşük skor)
Border: #E5E7EB
Divider: #F3F4F6
```

### Tasarım Kuralları
- İkon kullanımı minimal — sadece sidebar ve kritik aksiyonlarda
- Tipografi hiyerarşisi yeterli, dekoratif eleman yok
- Bol beyaz alan, sıkışık olmayan layout
- Kartlar: border border-gray-200, rounded-xl, p-6
- Butonlar: siyah arka plan beyaz yazı (primary), beyaz arka plan siyah border (secondary)
- 65 yaşındaki bir yönetici 3 saniyede her ekranı anlamalı
- Mobil öncelikli responsive tasarım

---

## VERİ MODELİ (Demo/Seed Data — ISITMAX Gerçek Verileri)

Aşağıdaki veriler ISITMAX.com'un Sellm.io üzerindeki gerçek GEO analiz sonuçlarından alınmıştır. Dashboard'da demo/showcase olarak kullanılacaktır.

```typescript
// src/data/demo-data.ts

export const DEMO_BRAND = {
  name: "ISITMAX",
  domain: "isitmax.com",
  sector: "Isıtma Sistemleri",
  logo: "/demo/isitmax-logo.png", // favicon fetch ile otomatik
};

export const DEMO_METRICS = {
  geoScore: 74, // 0-100 birleşik skor (SoV + Coverage + Position + Sentiment)
  shareOfVoice: 26, // %
  coverage: 100, // %
  avgPosition: 1.4,
  sentiment: 0.64, // 0-1
  // Haftalık değişimler
  changes: {
    geoScore: +3,
    shareOfVoice: +2,
    coverage: 0,
    avgPosition: -0.1, // negatif = iyileşme (daha düşük daha iyi)
    sentiment: +0.02,
  },
};

export const DEMO_COMPETITORS = [
  { name: "ISITMAX", share: 26, color: "#18181B" },
  { name: "Warmup", share: 5, color: "#6B7280" },
  { name: "Viessmann", share: 8, color: "#9CA3AF" },
  { name: "Danfoss", share: 4, color: "#D1D5DB" },
  { name: "RezistansMarket", share: 4, color: "#E5E7EB" },
  { name: "Diğer", share: 53, color: "#F3F4F6" },
];

export const DEMO_KEYWORDS = [
  {
    keyword: "villa banyosu için elektrikli yerden ısıtma sistemleri",
    shareOfVoice: 25,
    coverage: 100,
    avgPosition: 1.2,
    sentiment: 0.76,
    category: "satin-alma",
  },
  {
    keyword: "yüzey altı boru ısıtma kablosu seçenekleri",
    shareOfVoice: 36,
    coverage: 100,
    avgPosition: 1.2,
    sentiment: 0.69,
    category: "satin-alma",
  },
  {
    keyword: "endüstriyel varil ısıtma ceketi fiyat karşılaştırması",
    shareOfVoice: 24,
    coverage: 100,
    avgPosition: 1.4,
    sentiment: 0.56,
    category: "fiyat",
  },
  {
    keyword: "serada enerji verimli ısıtma sistemi önerileri",
    shareOfVoice: 29,
    coverage: 80,
    avgPosition: 1.75,
    sentiment: 0.56,
    category: "bilgi",
  },
  {
    keyword: "çatıda kar buz eritme kablo çözümleri",
    shareOfVoice: 14,
    coverage: 20,
    avgPosition: 2.0,
    sentiment: 0.51,
    category: "bilgi",
  },
];

export const DEMO_CITED_DOMAINS = [
  { domain: "google.com", cites: 69, share: 18 },
  { domain: "isitmax.com", cites: 55, share: 17 },
  { domain: "gshpturkiye.com", cites: 19, share: 9 },
  { domain: "etimuhendislik.com", cites: 18, share: 5 },
  { domain: "warmup.com.tr", cites: 12, share: 4 },
  { domain: "hepsiburada.com", cites: 9, share: 3 },
];

export const DEMO_CITED_PAGES = [
  { path: "/banyo-yerden-isitma", cites: 7, providers: 1 },
  { path: "/", cites: 6, providers: 1 },
  { path: "/endustriyel-varil-isitma-kabli", cites: 5, providers: 1 },
  { path: "/seralarda-toprak-alti-yerden-isitma-projeleri", cites: 5, providers: 1 },
  { path: "/boru-isitici-kablo-heat-trace", cites: 5, providers: 1 },
  { path: "/banyo-yerden-isitma-siltesi", cites: 4, providers: 1 },
];

export const DEMO_AI_RESPONSES = [
  {
    provider: "AI Overview",
    keyword: "yüzey altı boru ısıtma kablosu seçenekleri",
    response: "Yüzey altı boru ısıtma kabloları; donmayı önlemek (heat trace), sıcaklığı korumak veya akışkanlığı sağlamak için kendinden regüleli (otomatik ayarlı) veya sabit güçlü kablolar olarak ayrılır. Kendinden regüleli kablolar, hava koşullarına göre otomatik ayarlanarak enerji tasarrufu sağlar...",
    sources: ["firmamnet.com", "heattrace.com.tr", "isitmax.com", "senrezistans.com"],
    brandMentioned: true,
    position: 1,
  },
  {
    provider: "AI Overview",
    keyword: "villa banyosu için elektrikli yerden ısıtma sistemleri",
    response: "Villa banyoları için elektrikli yerden ısıtma sistemleri (kablo veya mat), nemen etkilenmeyyen, seramik/mermer altına uygun, hızlı montaj imkanı sunan ve 50 yıl ömür beklentisi olan konforlu çözümlerdir...",
    sources: ["enerserji.com.tr", "isitmax.com", "elqubainedilik.com", "isitmax.com"],
    brandMentioned: true,
    position: 1,
  },
];

// 81 İL ISI HARİTASI VERİSİ
export type CityVisibility = "strong" | "moderate" | "weak" | "none" | "not-tracked";

export const DEMO_CITY_DATA: Record<string, { score: number; status: CityVisibility }> = {
  "Istanbul": { score: 82, status: "strong" },
  "Ankara": { score: 71, status: "strong" },
  "Izmir": { score: 65, status: "moderate" },
  "Balikesir": { score: 91, status: "strong" },
  "Bursa": { score: 58, status: "moderate" },
  "Antalya": { score: 45, status: "weak" },
  "Konya": { score: 38, status: "weak" },
  "Trabzon": { score: 22, status: "weak" },
  "Erzurum": { score: 15, status: "none" },
  "Diyarbakir": { score: 12, status: "none" },
  // ... diğer iller "not-tracked" olarak başlar
  // Gerçek implementasyonda 81 ilin tamamı olacak
};

export const DEMO_SENTIMENT_DETAIL = {
  trustworthiness: { score: 65, label: "Güvenilirlik" },
  authority: { score: 61, label: "Otorite" },
  recommendationStrength: { score: 64, label: "Öneri Gücü" },
  fitForQueryIntent: { score: 66, label: "Arama Uyumu" },
};

export const DEMO_OPTIMIZATION = {
  domainSeoScore: 28.9,
  toBeOptimized: [
    {
      keyword: "çatıda kar buz eritme kablo çözümleri",
      myAiSeo: 65,
      aiGap: 1,
      seoVsMin: 20,
      coverage: 20,
      tags: ["Güçlü rakip", "Fırsat kanalları"],
    },
    {
      keyword: "serada enerji verimli ısıtma sistemi önerileri",
      myAiSeo: 54,
      aiGap: 4,
      seoVsMin: 17,
      coverage: 80,
      tags: ["Güçlü rakip"],
    },
  ],
  alreadyOptimized: [
    {
      keyword: "villa banyosu için elektrikli yerden ısıtma sistemleri",
      myAiSeo: 61,
      aiGap: 3,
      seoVsMin: 5,
      coverage: 100,
    },
    {
      keyword: "endüstriyel varil ısıtma ceketi fiyat karşılaştırması",
      myAiSeo: 60,
      aiGap: 3,
      seoVsMin: 17,
      coverage: 100,
    },
    {
      keyword: "yüzey altı boru ısıtma kablosu seçenekleri",
      myAiSeo: 54,
      aiGap: -1,
      seoVsMin: 3,
      coverage: 100,
    },
  ],
};

// Platform dağılımı
export const DEMO_PLATFORM_DISTRIBUTION = [
  { name: "Google", share: 65, color: "#4285F4" },
  { name: "ChatGPT", share: 12, color: "#10A37F" },
  { name: "Bing/Copilot", share: 7, color: "#00BCF2" },
  { name: "Diğer", share: 5, color: "#9CA3AF" },
  { name: "Gemini", share: 4, color: "#8B5CF6" },
  { name: "Perplexity", share: 4, color: "#22D3EE" },
  { name: "Claude", share: 3, color: "#D97706" },
];

// Keyword Discovery kategorileri
export const DEMO_KEYWORD_DISCOVERY = {
  "satin-alma": {
    title: "Satın Alma Niyetli",
    icon: "🛒",
    keywords: [
      "elektrikli gazete yerden ısıtma",
      "kar buz eritme sistemi tedariçi",
      "endüstriyel varil ısıtma ceketi",
      "ev tipi karbon film yerden ısıtma",
      "ankara için elektrikli ısıtma kablosu",
      "stüdyo daire için sesiz sıcaklık",
      "endüstriyel boru donmayı önleme",
      "termal seralar için ısıtma kablosu",
      "roof de-icing kablosu kurulumu",
      "hamam için nem sensörlü yerden ısıtma",
    ],
  },
  "rakip-alternatifleri": {
    title: "Rakip Alternatifleri",
    icon: "🔄",
    keywords: [
      "Warmup yerine yerli elektrikli ısıtma",
      "Uponor'a alternatif yerden ısıtma",
      "Giacomini boru ısıtma yerine daha ucuz",
      "Alarko Carrier sistemlerine güncel alternatif",
      "Hastings benzeri elektrikli kablolu ısıtma",
      "TECHIROM Rezistans rakibi isitmax",
      "Hammaddeler.com'dan rakip ürünler",
      "Viessmann'ın yerden ısıtma ürünleri",
      "RezistansMarket'e benzer kaliteli",
      "Schlüter Systems kadar profesyonel",
    ],
  },
  "fiyat": {
    title: "Fiyat Karşılaştırma",
    icon: "💰",
    keywords: [
      "metrekare elektrikli yerden ısıtma maliyeti",
      "kar buz eritme kablosu watt fiyat",
      "tank/güveç varil ısıtma ceketi fiyat",
      "karbon film vs kablo yerden ısıtma",
      "ankara ısıtma sistemi kurulum maliyeti",
      "kış bahçesi için yerden ısıtma fiyat",
      "ısıtma şiltesi ile mat sistem fiyat farkı",
      "kar ve buz önleme sistemi yıllık maliyet",
      "kontrol paneli elektronik vs analog fiyat",
      "endüstriyel heat trace kablo metraj fiyatı",
    ],
  },
  "bilgi": {
    title: "Bilgi & Keşif",
    icon: "🔍",
    keywords: [
      "yerden ısıtma nasıl çalışır elektrikli",
      "heat trace sistemleri nedir nasıl çalışır",
      "karbon film ısıtıcı avantajları ve dezavantajları",
      "varil ceketi ile sıvı ısı stabilizasyonu",
      "çatı ve oluk kar buz önleme sistemleri",
      "termostat kontrol tipi yerden ısıtma",
      "ısıtmacı kablo seçerken dikkat edilecek",
      "evde seracılık için toprağa döşenen kablolar",
      "endüstriyel tesislerde boru donma önleme",
      "karbon halı altı ısıtma mı güvenli",
    ],
  },
  "il-bazli": {
    title: "İl Bazlı Aramalar",
    icon: "📍",
    keywords: [
      "İstanbul'da en iyi yerden ısıtma firması",
      "Ankara yerden ısıtma sistemi kurulumu",
      "Balıkesir ısıtma kablosu satıcısı",
      "Bursa endüstriyel ısıtma çözümleri",
      "İzmir villa yerden ısıtma fiyat",
      "Antalya sera ısıtma sistemi",
      "Konya fabrika boru ısıtma kablosu",
      "Trabzon çatı kar eritme sistemi",
      "Erzurum boru donma önleme kablosu",
      "Eskişehir yerden ısıtma mat fiyat",
    ],
  },
};
```

---

## SAYFA YAPISI & ROTALAR

```
/                           → Landing page (pazarlama)
/analiz                     → Free tool: "Yapay Zeka Seni Tanıyor mu?"
/giris                      → Auth (login/register)
/panel                      → Dashboard layout wrapper
/panel/genel                → Genel Bakış (GEO Skor + Isı Haritası)
/panel/gorunurluk           → Görünürlük (Visibility detay)
/panel/iyilestirme          → İyileştirme (Optimization + RaaS)
/panel/aramalar             → Aramalar (Keyword/Prompt yönetimi)
/panel/rakipler             → Rakipler
/panel/iller                → İl Bazlı Detay
/panel/raporlar             → PDF rapor indirme
/panel/ayarlar              → Ayarlar
/panel/abonelik             → Abonelik/Billing
```

---

## EKRAN EKRAN TALİMATLAR

### EKRAN 1: /panel/genel — GENEL BAKIŞ

Bu GH7'nin ana dashboard'u. Açılışta kullanıcının gördüğü ilk ekran.

**Layout (üstten alta):**

**1.1 — GEO Skor Kartı (hero pozisyon)**
- Tam genişlik kart, sol tarafta büyük dairesel progress (0-100)
- Skor: 74 (büyük, bold, Inter font)
- Sağ tarafta 1 satır: "Geçen haftaya göre ↑3 puan"
- Renk: 0-39 kırmızı, 40-69 sarı, 70-100 yeşil
- Altında küçük text: "GEO Skoru, markanızın yapay zeka motorlarındaki genel görünürlüğünü ölçer"

**1.2 — 4 Metrik Kartı (grid: 2x2 mobil, 4x1 desktop)**
Her kart:
- Üstte küçük label (Türkçe)
- Ortada büyük değer
- Altında değişim: ↑ veya ↓ ok + değer
- Sağ üstte küçük (?) ikonu → tooltip ile açıklama

```
Ses Payı       Kapsam         Ortalama Sıra    Algı Skoru
  %26          %100              1.4              0.64
  ↑%2          →%0             ↑0.1              ↑0.02
```

Metrik açıklamaları (tooltip):
- Ses Payı: "Tüm marka önerilerinin yüzde kaçında siz varsınız"
- Kapsam: "Takip edilen aramaların yüzde kaçında görünüyorsunuz"
- Ortalama Sıra: "AI'ın sizi kaçıncı sırada önerdiği (düşük = iyi)"
- Algı Skoru: "AI'ın markanız hakkındaki genel tutumu (0-1)"

**1.3 — Türkiye Isı Haritası**
- Başlık: "İl Bazlı AI Görünürlük"
- Altında: "Hizmet verdiğiniz illerde yapay zeka sizi ne kadar tanıyor?"
- Türkiye SVG haritası, 81 il
- Renklendirme: Yeşil (#22C55E) güçlü, Sarı (#F59E0B) orta, Kırmızı (#EF4444) zayıf, Gri (#E5E7EB) takip edilmiyor
- İle hover → tooltip: "Balıkesir: 91/100 — Güçlü"
- İle tıkla → /panel/iller/balikesir detay sayfasına git
- Haritanın sağında legend: Güçlü (70+), Orta (40-69), Zayıf (1-39), Takip Edilmiyor
- Haritanın altında: "5 ilde güçlüsünüz · 3 ilde orta · 2 ilde zayıf · 71 il henüz takip edilmiyor"
- CTA butonu: "Yeni il ekle →"

**1.4 — Yapılacaklar / Önerilen Aksiyonlar**
- Başlık: "Yapılacaklar"
- Sellm'in "Recommended Actions" benzeri ama aksiyonlanabilir
- Eğer iyi: ✅ "Kapsam %100 — Tüm aramalarınızda görünüyorsunuz" (yeşil)
- Eğer iyileştirmeli: 🟡 "İstanbul'da görünürlüğünüz zayıf — İyileştir →" (sarı, tıklanabilir)
- Eğer kötü: 🔴 "2 aramada hiç görünmüyorsunuz — Detay →" (kırmızı, tıklanabilir)
- "Ajansınıza rapor gönderin" butonu — RaaS CTA

**1.5 — Marka Ses Payı (Donut Chart)**
- Sol: Donut chart — ISITMAX %26 (siyah), rakipler (gri tonları)
- Sağ: Marka listesi + yüzde
- Tıklanabilir: rakibe tıkla → /panel/rakipler detay

**1.6 — Trend Grafiği (Line Chart)**
- Tab'lar: Ses Payı | Kapsam | Ortalama Sıra | Algı Skoru
- Zaman seçici: 7 gün | 30 gün | 3 ay | Tümü
- Recharts line chart, minimal, monokrom
- X: tarihler, Y: metrik değeri

**1.7 — Arama Bazlı Kırılım**
- Başlık: "Arama Bazlı Kırılım"
- 4 kolon tablo: Arama | Ses Payı | Kapsam | Sıra | Algı
- Her satırda bar grafik + değer
- Satıra tıkla → detay popup/panel açılır

**1.8 — En Çok Referans Alınan Siteler**
- Sol: Domain listesi (isitmax.com %17, gshpturkiye.com %9...)
- Sağ: "Sayfalarınıza Verilen Referanslar" (/banyo-yerden-isitma: 7 referans)

**1.9 — Örnek AI Yanıtları**
- Başlık: "AI Sizi Nasıl Anlatıyor"
- Yatay scroll kartlar (mobilde swipe)
- Her kart: Provider ikonu + keyword + yanıt metni (kısaltılmış) + kaynak listesi
- Kart altında: Ses Payı, Kapsam, Algı mini badge'leri

---

### EKRAN 2: /panel/iyilestirme — İYİLEŞTİRME

**2.1 — Site Sağlık Skoru**
- Dairesel gauge: 28.9/100
- "AI SEO & SEO zorluk analizi"

**2.2 — Filtreleme**
- Prompt dropdown, Provider chip'leri, İl dropdown
- Sıralama: Varsayılan | AI Sıra | SEO vs Min

**2.3 — Güçlendirilmesi Gereken (sarı başlık)**
- Accordion satırlar, her biri genişleyebilir
- Kapalı hali: Keyword + tag'ler + My AI SEO skoru + AI Gap + SEO vs Min + Coverage bar
- Tag'ler: "Güçlü rakip" (gri), "Fırsat kanalları" (sarı border), "Referans alınıyor/alınmıyor"
- Açık hali (tıklayınca):
  - Sol: "Sayfalarınız" — sayfa URL + AI SEO skoru + AI Optimization bar'ları (İçerik %, Başlık %, Açıklama %)
  - Sağ: "En Çok Referans Alan Sayfalar" — rakip sayfaları + AI SEO skoru + SEO Gap
  - Alt: "Fırsat Kanalları": YouTube, LinkedIn vb.
- **🆕 "Ajansınıza Gönder" butonu** — her satırda. Tıklayınca ajans ortağına bu keyword'ün optimizasyon raporu gönderilir.

**2.4 — Güçlü Alanlar (yeşil başlık)**
- Aynı yapı ama genişlediğinde sadece mevcut durum gösterimi
- "Bu alanda güçlüsünüz, korumaya devam edin" mesajı

---

### EKRAN 3: /panel/aramalar — ARAMALAR

**3.1 — Üst bar**
- Arama kutusu
- Filtreler: Platform | İl | Kategori
- Butonlar: "+ Arama Ekle" (siyah) | "🔍 Keşfet" (siyah outline)
- Toggle: "Haftalık otomatik analiz" (switch)

**3.2 — Arama Listesi**
- Her satır: Keyword + provider ikonları + il bayrağı/etiketi + son analiz tarihi
- Düzenle/sil ikonları
- Toplu seçim + toplu silme

**3.3 — Keşfet Popup (Sellm'in Discover özelliği — GH7 versiyonu)**
- Modal: "Markanız İçin Arama Keşfet"
- AI otomatik keyword üretir (DEMO_KEYWORD_DISCOVERY verisinden)
- 5 kategori tab (Sellm'de 4, GH7'de 5 — il bazlı eklendi):
  - 🛒 Satın Alma Niyetli
  - 🔄 Rakip Alternatifleri
  - 💰 Fiyat Karşılaştırma
  - 🔍 Bilgi & Keşif
  - 📍 İl Bazlı Aramalar (GH7 unique)
- Her keyword'ün yanında provider seçim dropdown (ChatGPT, Gemini, Perplexity, AI Overview, Claude, Copilot)
- "Tümünü Ekle" ve "Seçilenleri Ekle" butonları
- Free: 5 keyword limiti + "Daha fazla eklemek için Pro'ya geçin"

---

### EKRAN 4: /panel/iller — İL BAZLI DETAY (GH7 Unique)

**4.1 — Türkiye Haritası (büyük versiyon)**
- Tam genişlik SVG harita
- İl seçim: tıkla veya dropdown

**4.2 — İl Detay Paneli (il seçildiğinde)**
- İl adı + GEO skoru
- 4 metrik o ile özel
- O ilde en çok sorulan aramalar
- O ildeki rakipler
- O ilde referans alınan sayfalarınız
- "Bu ili optimize et → Ajansınıza gönderin"

**4.3 — İl Karşılaştırma Tablosu**
- Tüm takip edilen iller: İl | GEO Skor | SoV | Kapsam | 1. Rakip
- Sıralanabilir kolonlar

---

### EKRAN 5: /panel/rakipler — RAKİPLER

**5.1 — Otomatik Tespit Edilen Rakipler**
- AI yanıtlarından çıkarılmış 24 rakip (ISITMAX demo verisi)
- Kart grid veya tablo: Marka + Domain + kaç aramada geçiyor
- "+ Rakip Ekle" butonu

**5.2 — Rakip Detay (tıklandığında)**
- Siz vs Rakip karşılaştırma
- Keyword bazlı: hangi aramalarda siz önde, hangisinde rakip önde
- İl bazlı: hangi illerde siz güçlü, hangilerinde rakip

---

### EKRAN 6: /panel/raporlar — RAPORLAR

- "PDF Rapor İndir" — Türkçe, markalı, GEO skoru + ısı haritası + aksiyonlar
- "Haftalık Özet E-posta" — toggle + email adresi
- "WhatsApp Özet" — toggle + telefon numarası (ileride)
- Rapor geçmişi listesi

---

### EKRAN 7: /analiz — FREE TOOL ("Yapay Zeka Seni Tanıyor mu?")

Bu GH7'nin lead generation sayfası. Kayıt gerektirmeden hızlı analiz.

**7.1 — Hero**
- Başlık: "Yapay Zeka Seni Tanıyor mu?"
- Alt başlık: "ChatGPT, Gemini ve AI Overview'da markanızın görünürlüğünü 60 saniyede öğrenin"
- Domain input + "Ücretsiz Analiz Et" butonu (siyah)
- Domain yazılınca logo otomatik gelsin (favicon fetch)
- Altında: "5 dakikadan kısa · Kredi kartı gerekmez"
- Sosyal kanıt: "1.000+ firma analiz edildi"

**7.2 — 3 Adımlı Wizard (domain girildikten sonra)**

Adım 1: Marka Bilgileri
- Marka adı (otomatik doldurulabilir)
- Website URL (girişten gelir)
- Sektör seçimi (dropdown: Isıtma, İnşaat, Sağlık, Hukuk, Restoran, Otel, E-ticaret, Diğer)
- Hizmet verilen iller (Türkiye haritası veya multi-select, max 3 free)
- "Devam →" butonu

Adım 2: Arama Onayı
- AI otomatik 5 keyword üretmiş (sektör + domain analizi)
- Her keyword düzenlenebilir/silinebilir
- Platform seçimi chip'leri: AI Overview ✓ ChatGPT ✓ Gemini ✓ Perplexity ✓ Claude ○ Copilot ○
- Platform trafik dağılımı bar'ı
- "Analizi Başlat →" butonu

Adım 3: Analiz & Sonuç
- Animasyonlu loading:
  1. "Markanız araştırılıyor..." (globe döner animasyon)
  2. "ChatGPT'ye soruyoruz..." (ChatGPT ikonu)
  3. "Gemini'den yanıt alınıyor..." (Gemini ikonu)
  4. "Rakipleriniz tespit ediliyor..." (bar chart animasyonu)
  5. "Raporunuz hazırlanıyor..." (document ikonu)
- Sonuç: Mini dashboard
  - GEO Skor büyük gösterim
  - 4 metrik kartı
  - Küçük Türkiye haritası (seçilen illerde renk)
  - 1-2 örnek AI yanıtı
  - "Detaylı rapora erişmek için kayıt olun" CTA
  - "Takibi başlat →" butonu → /giris sayfasına yönlendir

---

## SIDEBAR YAPISI

```
GH7 logo (üstte)
Proje adı dropdown (ISITMAX ▼)
─────────────────────
🏠 Genel Bakış          → /panel/genel
📊 Görünürlük           → /panel/gorunurluk (ikinci seviye detay)
🎯 İyileştirme          → /panel/iyilestirme
🔍 Aramalar             → /panel/aramalar
🏢 Rakipler             → /panel/rakipler
📍 İller                → /panel/iller
📄 Raporlar             → /panel/raporlar
─────────────────────
⚙️ Ayarlar              → /panel/ayarlar
💳 Abonelik             → /panel/abonelik
🔑 API                  → /panel/api
─────────────────────
info@isitmax.com (alt)
Çıkış
```

Mobilde: bottom tab bar (Genel | İyileştir | Aramalar | İller | Menü)

---

## KRİTİK İMPLEMENTASYON NOTLARI

1. **Tüm metinler Türkçe.** Placeholder'lar, hata mesajları, empty state'ler dahil. Asla İngilizce terim kalmayacak.

2. **Demo modu.** İlk launch'da gerçek API entegrasyonu olmadan ISITMAX verisiyle çalışan tam fonksiyonel demo. Her component demo data'dan beslenecek. İleride Supabase'e bağlanacak.

3. **Türkiye SVG haritası.** 81 ilin sınırları net olan, her ile ayrı CSS class uygulanabilir, tıklanabilir SVG. react-simple-maps veya custom SVG.

4. **Responsive.** Mobile-first. Dashboard'da sidebar mobilde gizlenir, bottom tab bar görünür. Kartlar stack olur. Harita yatay scroll olabilir.

5. **Animasyonlar.** Free tool'da loading animasyonu önemli (Framer Motion veya CSS). Dashboard'da fade-in yeterli.

6. **Font:** Sadece Inter. Başlıklar semibold/bold, body regular. Ekstra font yükleme yok.

7. **shadcn/ui bileşenleri kullan:** Card, Button, Badge, Tooltip, Progress, Tabs, Dialog, DropdownMenu, Select, Table, Accordion.

8. **Her metriğin yanında (?) tooltip.** shadcn Tooltip ile. Türkçe açıklama.

9. **Isı haritası renkleri CSS variable olsun.** Tema değişikliğine hazır.

10. **"Ajansınıza Gönderin" butonu her yerde.** Bu GH7'nin iş modeli — monitoring + RaaS. Her iyileştirme önerisinin yanında bu buton olacak.

---

## ÇIKTI BEKLENTİSİ

Bu prompt ile oluşturulacak:
- Next.js 14 projesi, tüm rotalar ve sayfalar
- shadcn/ui + Tailwind monokrom tema
- Demo data ile çalışan tüm dashboard ekranları
- Türkiye ısı haritası (SVG, tıklanabilir)
- Free tool wizard (/analiz)
- Responsive sidebar + mobil bottom bar
- Recharts grafikler (donut, line, bar)
- Keyword discovery popup
- Tüm metinler Türkçe

Proje çalıştırılabilir durumda olacak: `npm run dev` → localhost'ta demo dashboard görünecek.
