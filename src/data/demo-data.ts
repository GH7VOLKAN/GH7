// src/data/demo-data.ts
// ISITMAX.com Sellm.io gercek GEO analiz verilerinden alinmistir.
// Dashboard demo/showcase olarak kullanilir.

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
    category: "satın-alma" as const,
  },
  {
    keyword: "yüzey altı boru ısıtma kablosu seçenekleri",
    shareOfVoice: 36,
    coverage: 100,
    avgPosition: 1.2,
    sentiment: 0.69,
    category: "satın-alma" as const,
  },
  {
    keyword: "endüstriyel varil ısıtma ceketi fiyat karşılaştırması",
    shareOfVoice: 24,
    coverage: 100,
    avgPosition: 1.4,
    sentiment: 0.56,
    category: "fiyat" as const,
  },
  {
    keyword: "serada enerji verimli ısıtma sistemi önerileri",
    shareOfVoice: 29,
    coverage: 80,
    avgPosition: 1.75,
    sentiment: 0.56,
    category: "bilgi" as const,
  },
  {
    keyword: "çatıda kar buz eritme kablo çözümleri",
    shareOfVoice: 14,
    coverage: 20,
    avgPosition: 2.0,
    sentiment: 0.51,
    category: "bilgi" as const,
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
      "Yüzey altı boru ısıtma kabloları; donmayı önlemek (heat trace), sıcaklığı korumak veya akışkanlığı sağlamak icin kendinden regüleli (otomatik ayarlı) veya sabit güçlü kablolar olarak ayrilir. Kendinden reguleli kablolar, hava kosullarina gore otomatik ayarlanarak enerji tasarrufu sağlar...",
    sources: ["firmamnet.com", "heattrace.com.tr", "isitmax.com", "senrezistans.com"],
    brandMentioned: true,
    position: 1,
  },
  {
    provider: "AI Overview",
    keyword: "villa banyosu için elektrikli yerden ısıtma sistemleri",
    response:
      "Villa banyoları için elektrikli yerden isitma sistemleri (kablo veya mat), nemden etkilenmeyen, seramik/mermer altina uygun, hızlı montaj imkanı sunan ve 50 yil ömür beklentisi olan konforlu çözümlerdir...",
    sources: ["enerserji.com.tr", "isitmax.com", "elqubainedilik.com", "isitmax.com"],
    brandMentioned: true,
    position: 1,
  },
  {
    provider: "ChatGPT",
    keyword: "endüstriyel varil ısıtma ceketi fiyat karşılaştırması",
    response:
      "Endüstriyel varil ısıtma ceketleri icin fiyatlar kapasite ve ozelliklere gore degisir. ISITMAX, RezistansMarket ve BandHeater gibi firmalar farklı beden ve watt secenekleri sunmaktadır...",
    sources: ["isitmax.com", "rezistansmarket.com", "bandheater.com.tr"],
    brandMentioned: true,
    position: 1,
  },
  {
    provider: "Gemini",
    keyword: "serada enerji verimli ısıtma sistemi önerileri",
    response:
      "Seralarda enerji verimli isitma icin toprak alti kablo sistemleri, infrared isiticilar ve isi pompalari öne çıkmaktadır. Toprak alti isitma kablolari koku seviyesinde homojen ısı dağıtımı sağlar...",
    sources: ["tarim.gov.tr", "isitmax.com", "seracilik.org"],
    brandMentioned: true,
    position: 2,
  },
  {
    provider: "Perplexity",
    keyword: "çatıda kar buz eritme kablo çözümleri",
    response:
      "Catilarda kar ve buz eritme icin self-regulating (kendinden regüleli) isitma kablolari en yaygin cozumdur. Bu kablolar oluk ve catilara doseneur, hava sicakligina gore otomatik güç ayarı yapar...",
    sources: ["heattrace.com.tr", "danfoss.com.tr", "warmup.com.tr"],
    brandMentioned: false,
    position: 0,
  },
];

// 81 il isi haritasi verisi
export type CityVisibility = "strong" | "moderate" | "weak" | "none" | "not-tracked";

export const DEMO_CITY_DATA: Record<string, { score: number; status: CityVisibility }> = {
  Istanbul: { score: 82, status: "strong" },
  Ankara: { score: 71, status: "strong" },
  Izmir: { score: 65, status: "moderate" },
  Balikesir: { score: 91, status: "strong" },
  Bursa: { score: 58, status: "moderate" },
  Antalya: { score: 45, status: "weak" },
  Konya: { score: 38, status: "weak" },
  Trabzon: { score: 22, status: "weak" },
  Erzurum: { score: 15, status: "none" },
  Diyarbakir: { score: 12, status: "none" },
  // Diger iller not-tracked
  Adana: { score: 0, status: "not-tracked" },
  Adiyaman: { score: 0, status: "not-tracked" },
  Afyonkarahisar: { score: 0, status: "not-tracked" },
  Agri: { score: 0, status: "not-tracked" },
  Aksaray: { score: 0, status: "not-tracked" },
  Amasya: { score: 0, status: "not-tracked" },
  Ardahan: { score: 0, status: "not-tracked" },
  Artvin: { score: 0, status: "not-tracked" },
  Aydin: { score: 0, status: "not-tracked" },
  Bartin: { score: 0, status: "not-tracked" },
  Batman: { score: 0, status: "not-tracked" },
  Bayburt: { score: 0, status: "not-tracked" },
  Bilecik: { score: 0, status: "not-tracked" },
  Bingol: { score: 0, status: "not-tracked" },
  Bitlis: { score: 0, status: "not-tracked" },
  Bolu: { score: 0, status: "not-tracked" },
  Burdur: { score: 0, status: "not-tracked" },
  Canakkale: { score: 0, status: "not-tracked" },
  Cankiri: { score: 0, status: "not-tracked" },
  Corum: { score: 0, status: "not-tracked" },
  Denizli: { score: 0, status: "not-tracked" },
  Duzce: { score: 0, status: "not-tracked" },
  Edirne: { score: 0, status: "not-tracked" },
  Elazig: { score: 0, status: "not-tracked" },
  Erzincan: { score: 0, status: "not-tracked" },
  Eskisehir: { score: 0, status: "not-tracked" },
  Gaziantep: { score: 0, status: "not-tracked" },
  Giresun: { score: 0, status: "not-tracked" },
  Gumushane: { score: 0, status: "not-tracked" },
  Hakkari: { score: 0, status: "not-tracked" },
  Hatay: { score: 0, status: "not-tracked" },
  Igdir: { score: 0, status: "not-tracked" },
  Isparta: { score: 0, status: "not-tracked" },
  Kahramanmaras: { score: 0, status: "not-tracked" },
  Karabuk: { score: 0, status: "not-tracked" },
  Karaman: { score: 0, status: "not-tracked" },
  Kars: { score: 0, status: "not-tracked" },
  Kastamonu: { score: 0, status: "not-tracked" },
  Kayseri: { score: 0, status: "not-tracked" },
  Kilis: { score: 0, status: "not-tracked" },
  Kirikkale: { score: 0, status: "not-tracked" },
  Kirklareli: { score: 0, status: "not-tracked" },
  Kirsehir: { score: 0, status: "not-tracked" },
  Kocaeli: { score: 0, status: "not-tracked" },
  Kutahya: { score: 0, status: "not-tracked" },
  Malatya: { score: 0, status: "not-tracked" },
  Manisa: { score: 0, status: "not-tracked" },
  Mardin: { score: 0, status: "not-tracked" },
  Mersin: { score: 0, status: "not-tracked" },
  Mugla: { score: 0, status: "not-tracked" },
  Mus: { score: 0, status: "not-tracked" },
  Nevsehir: { score: 0, status: "not-tracked" },
  Nigde: { score: 0, status: "not-tracked" },
  Ordu: { score: 0, status: "not-tracked" },
  Osmaniye: { score: 0, status: "not-tracked" },
  Rize: { score: 0, status: "not-tracked" },
  Sakarya: { score: 0, status: "not-tracked" },
  Samsun: { score: 0, status: "not-tracked" },
  Sanliurfa: { score: 0, status: "not-tracked" },
  Siirt: { score: 0, status: "not-tracked" },
  Sinop: { score: 0, status: "not-tracked" },
  Sirnak: { score: 0, status: "not-tracked" },
  Sivas: { score: 0, status: "not-tracked" },
  Tekirdag: { score: 0, status: "not-tracked" },
  Tokat: { score: 0, status: "not-tracked" },
  Tunceli: { score: 0, status: "not-tracked" },
  Usak: { score: 0, status: "not-tracked" },
  Van: { score: 0, status: "not-tracked" },
  Yalova: { score: 0, status: "not-tracked" },
  Yozgat: { score: 0, status: "not-tracked" },
  Zonguldak: { score: 0, status: "not-tracked" },
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
  "satın-alma": {
    title: "Satın Alma Niyetli",
    icon: "cart",
    keywords: [
      "elektrikli gazete yerden ısıtma",
      "kar buz eritme sistemi tedarikçi",
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
    icon: "repeat",
    keywords: [
      "Warmup yerine yerli elektrikli ısıtma",
      "Uponor'a alternatif yerden ısıtma",
      "Giacomini boru ısıtma yerine daha ucuz",
      "Alarko Carrier sistemlerine güncel alternatif",
      "Hastings benzeri elektrikli kablolu ısıtma",
      "TECHIROM Rezistans rakibi isitmax",
      "Hammaddeler.com'dan rakip urunler",
      "Viessmann'ın yerden ısıtma ürünleri",
      "RezistansMarket'e benzer kaliteli",
      "Schluter Systems kadar profesyonel",
    ],
  },
  fiyat: {
    title: "Fiyat Karşılaştırma",
    icon: "banknote",
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
  bilgi: {
    title: "Bilgi & Keşif",
    icon: "search",
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
    icon: "map-pin",
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

// =====================================================
// SENIN YERINE KIM — Urun bazli rakip verileri
// =====================================================

export interface ProductCompetitor {
  name: string;
  mentionRate: string; // "3/5 sorguda"
  mentionCount: number;
  totalQueries: number;
  change: "up" | "down" | "same";
  changeNote?: string;
  isMe?: boolean;
}

export interface ProductRanking {
  product: string;
  icon: string;
  competitors: ProductCompetitor[];
  myPosition: number;
  totalCompetitors: number;
  isLeader: boolean;
}

export const DEMO_PRODUCT_MAP = {
  products: [
    "Yerden ısıtma kablosu (elektrikli)",
    "Heat trace boru ısıtma kablosu",
    "Çatı kar buz eritme sistemi",
    "Varil ısıtma ceketi",
    "Sera ısıtma kablosu",
    "Karbon film ısıtıcı",
  ],
  services: ["Proje tasarımı", "Teknik destek", "Kurulum danışmanlığı"],
};

export const DEMO_PRODUCT_RANKINGS: ProductRanking[] = [
  {
    product: "Yerden Isıtma Kablosu",
    icon: "thermometer",
    competitors: [
      {
        name: "Warmup",
        mentionRate: "3/5 sorguda",
        mentionCount: 3,
        totalQueries: 5,
        change: "same",
      },
      {
        name: "ISITMAX",
        mentionRate: "2/5 sorguda",
        mentionCount: 2,
        totalQueries: 5,
        change: "up",
        changeNote: "Geçen hafta 3. sıradaydınız",
        isMe: true,
      },
      {
        name: "Giacomini",
        mentionRate: "2/5 sorguda",
        mentionCount: 2,
        totalQueries: 5,
        change: "down",
      },
      {
        name: "Uponor",
        mentionRate: "1/5 sorguda",
        mentionCount: 1,
        totalQueries: 5,
        change: "same",
      },
    ],
    myPosition: 2,
    totalCompetitors: 4,
    isLeader: false,
  },
  {
    product: "Heat Trace Boru Isıtma",
    icon: "flame",
    competitors: [
      {
        name: "ISITMAX",
        mentionRate: "4/5 sorguda",
        mentionCount: 4,
        totalQueries: 5,
        change: "same",
        isMe: true,
      },
      {
        name: "Danfoss",
        mentionRate: "3/5 sorguda",
        mentionCount: 3,
        totalQueries: 5,
        change: "same",
      },
      {
        name: "nVent Raychem",
        mentionRate: "1/5 sorguda",
        mentionCount: 1,
        totalQueries: 5,
        change: "same",
      },
    ],
    myPosition: 1,
    totalCompetitors: 3,
    isLeader: true,
  },
  {
    product: "Çatı Kar Buz Eritme",
    icon: "snowflake",
    competitors: [
      {
        name: "Danfoss",
        mentionRate: "3/5 sorguda",
        mentionCount: 3,
        totalQueries: 5,
        change: "same",
      },
      {
        name: "Warmup",
        mentionRate: "2/5 sorguda",
        mentionCount: 2,
        totalQueries: 5,
        change: "same",
      },
      {
        name: "ISITMAX",
        mentionRate: "2/5 sorguda",
        mentionCount: 2,
        totalQueries: 5,
        change: "up",
        changeNote: "Geçen hafta 4. sıradaydınız",
        isMe: true,
      },
      {
        name: "nVent Raychem",
        mentionRate: "1/5 sorguda",
        mentionCount: 1,
        totalQueries: 5,
        change: "down",
      },
      {
        name: "Thermon",
        mentionRate: "1/5 sorguda",
        mentionCount: 1,
        totalQueries: 5,
        change: "same",
      },
    ],
    myPosition: 3,
    totalCompetitors: 5,
    isLeader: false,
  },
  {
    product: "Varil Isıtma Ceketi",
    icon: "container",
    competitors: [
      {
        name: "ISITMAX",
        mentionRate: "4/5 sorguda",
        mentionCount: 4,
        totalQueries: 5,
        change: "same",
        isMe: true,
      },
      {
        name: "RezistansMarket",
        mentionRate: "2/5 sorguda",
        mentionCount: 2,
        totalQueries: 5,
        change: "same",
      },
    ],
    myPosition: 1,
    totalCompetitors: 2,
    isLeader: true,
  },
  {
    product: "Sera Isıtma Kablosu",
    icon: "sprout",
    competitors: [
      {
        name: "Danfoss",
        mentionRate: "3/5 sorguda",
        mentionCount: 3,
        totalQueries: 5,
        change: "same",
      },
      {
        name: "ISITMAX",
        mentionRate: "2/5 sorguda",
        mentionCount: 2,
        totalQueries: 5,
        change: "same",
        isMe: true,
      },
      {
        name: "Nexans",
        mentionRate: "1/5 sorguda",
        mentionCount: 1,
        totalQueries: 5,
        change: "same",
      },
    ],
    myPosition: 2,
    totalCompetitors: 3,
    isLeader: false,
  },
];

// Rakip derinlik analizi — "Neden Onde?"
export interface CompetitorAdvantage {
  description: string;
  hasIt: boolean; // rakipte var mi
  iHaveIt: boolean; // bende var mi
  action?: string; // onerilen aksiyon
  impact: "high" | "medium" | "low";
}

export interface CompetitorDepthAnalysis {
  competitorName: string;
  product: string;
  whyAhead: CompetitorAdvantage[];
  myAdvantages: string[];
}

export const DEMO_COMPETITOR_DEPTH: CompetitorDepthAnalysis[] = [
  {
    competitorName: "Warmup",
    product: "Yerden Isıtma Kablosu",
    whyAhead: [
      {
        description: "YouTube'da kurulum videoları var (12 video, 50K+ izlenme)",
        hasIt: true,
        iHaveIt: false,
        action: "Video içerik üret",
        impact: "high",
      },
      {
        description: "Sayfalarında FAQ schema kullanıyor (8 sayfa)",
        hasIt: true,
        iHaveIt: false,
        action: "Schema ekle",
        impact: "high",
      },
      {
        description: "Blog'da 'yerden ısıtma rehberi' serisi var (15 yazi)",
        hasIt: true,
        iHaveIt: false,
        action: "İçerik üret — sende 3 yazi",
        impact: "medium",
      },
      {
        description: "Google AI Overview'da 5/5 sorguda cite ediliyor",
        hasIt: true,
        iHaveIt: false,
        action: "Eksik 2 sorgu için içerik optimize et",
        impact: "high",
      },
      {
        description: "llms.txt dosyası yok",
        hasIt: false,
        iHaveIt: true,
        impact: "low",
      },
    ],
    myAdvantages: [
      "Heat trace'de lider — Warmup bu alanda yok",
      "Sera ısıtma'da tek referans kaynağınız",
      "isitmax.com domain authority daha yüksek",
    ],
  },
  {
    competitorName: "Danfoss",
    product: "Heat Trace Boru Isıtma",
    whyAhead: [
      {
        description: "Global marka bilinirlik avantajı",
        hasIt: true,
        iHaveIt: false,
        action: "Türkçe içerik avantajınızı kullanın",
        impact: "medium",
      },
      {
        description: "Teknik dokümantasyon PDF'leri AI tarafından indeksleniyor",
        hasIt: true,
        iHaveIt: false,
        action: "Türkçe teknik rehberler oluştur",
        impact: "high",
      },
    ],
    myAdvantages: [
      "Türkçe içerikte lider — Danfoss Turkce icerigi zayif",
      "Yerel referanslar (Türkiye projeleri) daha güçlü",
      "Fiyat avantajı — müşteriler sizi 'uygun fiyatlı' olarak tanıyor",
    ],
  },
];

// Siralama savasi bildirimleri
export interface RankingNotification {
  type: "celebration" | "warning" | "stable";
  message: string;
  product: string;
  date: string;
}

export const DEMO_RANKING_NOTIFICATIONS: RankingNotification[] = [
  {
    type: "celebration",
    message: "'Yerden ısıtma kablosu'nda Giacomini'yi gectiniz! (3. -> 2. sira)",
    product: "Yerden Isıtma Kablosu",
    date: "2026-03-28",
  },
  {
    type: "warning",
    message: "Danfoss 'heat trace'de yukseliyor. Gecen hafta 3., bu hafta 2. siraya cikti.",
    product: "Heat Trace Boru Isıtma",
    date: "2026-03-27",
  },
  {
    type: "stable",
    message: "'Varil ısıtma ceketi'nde 3 haftadir istikrarli 1. siradasiniz.",
    product: "Varil Isıtma Ceketi",
    date: "2026-03-26",
  },
];

// Genel rekabet ozeti
export const DEMO_COMPETITION_SUMMARY = [
  { product: "Yerden ısıtma kablosu", position: 2, total: 4, leader: "Warmup", behindBy: 1 },
  { product: "Heat trace boru ısıtma", position: 1, total: 3, leader: null, behindBy: 0 },
  { product: "Çatı kar eritme", position: 3, total: 5, leader: "Danfoss", behindBy: 2 },
  { product: "Varil ısıtma ceketi", position: 1, total: 2, leader: null, behindBy: 0 },
  { product: "Sera ısıtma kablosu", position: 2, total: 3, leader: "Danfoss", behindBy: 1 },
];

// =====================================================
// ANALYSIS_CONFIG — 4 kapi (spec v3 ile uyumlu)
// =====================================================

export type AnalysisType = "firma" | "kisi" | "eticaret" | "export";

export const ANALYSIS_CONFIG: Record<
  AnalysisType,
  {
    label: string;
    icon: string;
    inputPlaceholder: string;
    inputLabel: string;
    inputSecondary?: string;
    description: string;
    fields: string[];
    sonarQuery: string;
    freeLimit: string;
    proLimit: string;
  }
> = {
  firma: {
    label: "Firma",
    icon: "building-2",
    inputPlaceholder: "firmaniz.com",
    inputLabel: "Website URL",
    description: "Markanız AI'da nasıl görünüyor?",
    fields: ["brand", "url", "sector", "cities"],
    sonarQuery: "Bu domain hakkında: firma adı, sektör, ürünler, hizmetler, projeler, hizmet bölgeleri",
    freeLimit: "1 domain, 10 sorgu",
    proLimit: "1 domain, 50 sorgu, haftalik varyasyon",
  },
  kisi: {
    label: "Kisi",
    icon: "user",
    inputPlaceholder: "Ad Soyad",
    inputLabel: "İsminiz",
    inputSecondary: "Website veya LinkedIn (opsiyonel)",
    description: "Adınız AI'da nasıl geçiyor?",
    fields: ["name", "title", "linkedin", "cities"],
    sonarQuery: "Bu kişi hakkında: meslek, uzmanlık alanları, kurum, yayınlar, hizmet bölgesi",
    freeLimit: "1 kisi, 10 sorgu",
    proLimit: "1 kisi, 30 sorgu, haftalik varyasyon",
  },
  eticaret: {
    label: "E-Ticaret",
    icon: "shopping-cart",
    inputPlaceholder: "Trendyol veya Hepsiburada ürün linki",
    inputLabel: "Ürün satış linki",
    description: "Ürününüz AI tarafından öneriliyor mu?",
    fields: ["productUrl", "productName", "brand", "category"],
    sonarQuery: "Bu ürün hakkında: ürün adı, marka, kategori, fiyat aralığı, rakip ürünler",
    freeLimit: "1 urun linki, 3-5 sorgu",
    proLimit: "30 urun linki, urun basi 3-5 sorgu, haftalik varyasyon",
  },
  export: {
    label: "Export",
    icon: "globe",
    inputPlaceholder: "firmaniz.com",
    inputLabel: "Website URL",
    inputSecondary: "Hedef pazarlar (çoklu seçim)",
    description: "Yabancılar sizi buluyor mu?",
    fields: ["url", "brand", "targetMarkets", "targetLanguages", "services"],
    sonarQuery: "Bu firma hakkında: firma adı, yabancıya sunulan hizmetler/ürünler, hedef pazarlar",
    freeLimit: "1 hedef pazar, 1 dil, 5 sorgu",
    proLimit: "5 hedef pazar, coklu dil, pazar basi 10 sorgu, haftalik varyasyon",
  },
};

export const EXPORT_TARGET_MARKETS = [
  "Almanya",
  "Ingiltere",
  "BAE",
  "Rusya",
  "ABD",
  "Fransa",
  "Hollanda",
  "Suudi Arabistan",
];

export const EXPORT_LANGUAGE_MAP: Record<string, string | string[]> = {
  Almanya: "de",
  Ingiltere: "en",
  BAE: ["en", "ar"],
  Rusya: "ru",
  ABD: "en",
  Fransa: "fr",
  Hollanda: ["nl", "en"],
  "Suudi Arabistan": "ar",
};

// =====================================================
// Trend verisi (haftalik GEO skor degisimleri)
// =====================================================

export const DEMO_TREND_DATA = {
  shareOfVoice: [
    { date: "3 Mar", value: 20 },
    { date: "10 Mar", value: 22 },
    { date: "17 Mar", value: 23 },
    { date: "24 Mar", value: 24 },
    { date: "31 Mar", value: 26 },
  ],
  coverage: [
    { date: "3 Mar", value: 80 },
    { date: "10 Mar", value: 80 },
    { date: "17 Mar", value: 100 },
    { date: "24 Mar", value: 100 },
    { date: "31 Mar", value: 100 },
  ],
  avgPosition: [
    { date: "3 Mar", value: 1.8 },
    { date: "10 Mar", value: 1.6 },
    { date: "17 Mar", value: 1.5 },
    { date: "24 Mar", value: 1.5 },
    { date: "31 Mar", value: 1.4 },
  ],
  sentiment: [
    { date: "3 Mar", value: 0.58 },
    { date: "10 Mar", value: 0.6 },
    { date: "17 Mar", value: 0.61 },
    { date: "24 Mar", value: 0.62 },
    { date: "31 Mar", value: 0.64 },
  ],
  geoScore: [
    { date: "3 Mar", value: 65 },
    { date: "10 Mar", value: 68 },
    { date: "17 Mar", value: 70 },
    { date: "24 Mar", value: 71 },
    { date: "31 Mar", value: 74 },
  ],
};
