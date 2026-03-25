// src/data/demo-data.ts

export const DEMO_BRAND = {
  name: "ISITMAX",
  domain: "isitmax.com",
  sector: "Isıtma Sistemleri",
  logo: "/demo/isitmax-logo.png",
};

export const DEMO_METRICS = {
  geoScore: 74,
  shareOfVoice: 26,
  coverage: 100,
  avgPosition: 1.4,
  sentiment: 0.64,
  changes: {
    geoScore: +3,
    shareOfVoice: +2,
    coverage: 0,
    avgPosition: -0.1,
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
    response:
      "Yüzey altı boru ısıtma kabloları; donmayı önlemek (heat trace), sıcaklığı korumak veya akışkanlığı sağlamak için kendinden regüleli (otomatik ayarlı) veya sabit güçlü kablolar olarak ayrılır. Kendinden regüleli kablolar, hava koşullarına göre otomatik ayarlanarak enerji tasarrufu sağlar...",
    sources: ["firmamnet.com", "heattrace.com.tr", "isitmax.com", "senrezistans.com"],
    brandMentioned: true,
    position: 1,
  },
  {
    provider: "AI Overview",
    keyword: "villa banyosu için elektrikli yerden ısıtma sistemleri",
    response:
      "Villa banyoları için elektrikli yerden ısıtma sistemleri (kablo veya mat), nemen etkilenmeyyen, seramik/mermer altına uygun, hızlı montaj imkanı sunan ve 50 yıl ömür beklentisi olan konforlu çözümlerdir...",
    sources: ["enerserji.com.tr", "isitmax.com", "elqubainedilik.com", "isitmax.com"],
    brandMentioned: true,
    position: 1,
  },
];

export type CityVisibility = "strong" | "moderate" | "weak" | "none" | "not-tracked";

// All 81 cities of Turkey
export const DEMO_CITY_DATA: Record<string, { score: number; status: CityVisibility }> = {
  "Adana": { score: 0, status: "not-tracked" },
  "Adıyaman": { score: 0, status: "not-tracked" },
  "Afyonkarahisar": { score: 0, status: "not-tracked" },
  "Ağrı": { score: 0, status: "not-tracked" },
  "Aksaray": { score: 0, status: "not-tracked" },
  "Amasya": { score: 0, status: "not-tracked" },
  "Ankara": { score: 71, status: "strong" },
  "Antalya": { score: 45, status: "weak" },
  "Ardahan": { score: 0, status: "not-tracked" },
  "Artvin": { score: 0, status: "not-tracked" },
  "Aydın": { score: 0, status: "not-tracked" },
  "Balıkesir": { score: 91, status: "strong" },
  "Bartın": { score: 0, status: "not-tracked" },
  "Batman": { score: 0, status: "not-tracked" },
  "Bayburt": { score: 0, status: "not-tracked" },
  "Bilecik": { score: 0, status: "not-tracked" },
  "Bingöl": { score: 0, status: "not-tracked" },
  "Bitlis": { score: 0, status: "not-tracked" },
  "Bolu": { score: 0, status: "not-tracked" },
  "Burdur": { score: 0, status: "not-tracked" },
  "Bursa": { score: 58, status: "moderate" },
  "Çanakkale": { score: 0, status: "not-tracked" },
  "Çankırı": { score: 0, status: "not-tracked" },
  "Çorum": { score: 0, status: "not-tracked" },
  "Denizli": { score: 0, status: "not-tracked" },
  "Diyarbakır": { score: 12, status: "none" },
  "Düzce": { score: 0, status: "not-tracked" },
  "Edirne": { score: 0, status: "not-tracked" },
  "Elazığ": { score: 0, status: "not-tracked" },
  "Erzincan": { score: 0, status: "not-tracked" },
  "Erzurum": { score: 15, status: "none" },
  "Eskişehir": { score: 0, status: "not-tracked" },
  "Gaziantep": { score: 0, status: "not-tracked" },
  "Giresun": { score: 0, status: "not-tracked" },
  "Gümüşhane": { score: 0, status: "not-tracked" },
  "Hakkari": { score: 0, status: "not-tracked" },
  "Hatay": { score: 0, status: "not-tracked" },
  "Iğdır": { score: 0, status: "not-tracked" },
  "Isparta": { score: 0, status: "not-tracked" },
  "İstanbul": { score: 82, status: "strong" },
  "İzmir": { score: 65, status: "moderate" },
  "Kahramanmaraş": { score: 0, status: "not-tracked" },
  "Karabük": { score: 0, status: "not-tracked" },
  "Karaman": { score: 0, status: "not-tracked" },
  "Kars": { score: 0, status: "not-tracked" },
  "Kastamonu": { score: 0, status: "not-tracked" },
  "Kayseri": { score: 0, status: "not-tracked" },
  "Kırıkkale": { score: 0, status: "not-tracked" },
  "Kırklareli": { score: 0, status: "not-tracked" },
  "Kırşehir": { score: 0, status: "not-tracked" },
  "Kilis": { score: 0, status: "not-tracked" },
  "Kocaeli": { score: 0, status: "not-tracked" },
  "Konya": { score: 38, status: "weak" },
  "Kütahya": { score: 0, status: "not-tracked" },
  "Malatya": { score: 0, status: "not-tracked" },
  "Manisa": { score: 0, status: "not-tracked" },
  "Mardin": { score: 0, status: "not-tracked" },
  "Mersin": { score: 0, status: "not-tracked" },
  "Muğla": { score: 0, status: "not-tracked" },
  "Muş": { score: 0, status: "not-tracked" },
  "Nevşehir": { score: 0, status: "not-tracked" },
  "Niğde": { score: 0, status: "not-tracked" },
  "Ordu": { score: 0, status: "not-tracked" },
  "Osmaniye": { score: 0, status: "not-tracked" },
  "Rize": { score: 0, status: "not-tracked" },
  "Sakarya": { score: 0, status: "not-tracked" },
  "Samsun": { score: 0, status: "not-tracked" },
  "Şanlıurfa": { score: 0, status: "not-tracked" },
  "Siirt": { score: 0, status: "not-tracked" },
  "Sinop": { score: 0, status: "not-tracked" },
  "Şırnak": { score: 0, status: "not-tracked" },
  "Sivas": { score: 0, status: "not-tracked" },
  "Tekirdağ": { score: 0, status: "not-tracked" },
  "Tokat": { score: 0, status: "not-tracked" },
  "Trabzon": { score: 22, status: "weak" },
  "Tunceli": { score: 0, status: "not-tracked" },
  "Uşak": { score: 0, status: "not-tracked" },
  "Van": { score: 0, status: "not-tracked" },
  "Yalova": { score: 0, status: "not-tracked" },
  "Yozgat": { score: 0, status: "not-tracked" },
  "Zonguldak": { score: 0, status: "not-tracked" },
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

export const DEMO_PLATFORM_DISTRIBUTION = [
  { name: "Google", share: 65, color: "#4285F4" },
  { name: "ChatGPT", share: 12, color: "#10A37F" },
  { name: "Bing/Copilot", share: 7, color: "#00BCF2" },
  { name: "Diğer", share: 5, color: "#9CA3AF" },
  { name: "Gemini", share: 4, color: "#8B5CF6" },
  { name: "Perplexity", share: 4, color: "#22D3EE" },
  { name: "Claude", share: 3, color: "#D97706" },
];

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

// Trend data for line charts (last 30 days)
export const DEMO_TREND_DATA = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const dateStr = date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
  return {
    date: dateStr,
    shareOfVoice: Math.round(20 + Math.random() * 10 + i * 0.2),
    coverage: Math.round(85 + Math.random() * 15),
    avgPosition: +(1.8 - i * 0.01 + Math.random() * 0.3).toFixed(1),
    sentiment: +(0.55 + Math.random() * 0.15 + i * 0.003).toFixed(2),
  };
});

// Helper functions
export function getCityStats() {
  const entries = Object.entries(DEMO_CITY_DATA);
  const strong = entries.filter(([, d]) => d.status === "strong").length;
  const moderate = entries.filter(([, d]) => d.status === "moderate").length;
  const weak = entries.filter(([, d]) => d.status === "weak" || d.status === "none").length;
  const notTracked = entries.filter(([, d]) => d.status === "not-tracked").length;
  return { strong, moderate, weak, notTracked };
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "#22C55E";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

export function getScoreLabel(score: number): string {
  if (score >= 70) return "Güçlü";
  if (score >= 40) return "Orta";
  if (score > 0) return "Zayıf";
  return "Takip Edilmiyor";
}

export function getScoreBgClass(score: number): string {
  if (score >= 70) return "bg-green-50 text-green-700";
  if (score >= 40) return "bg-yellow-50 text-yellow-700";
  if (score > 0) return "bg-red-50 text-red-700";
  return "bg-gray-50 text-gray-400";
}
