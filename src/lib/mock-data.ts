export type PlatformKey = "chatgpt" | "claude" | "gemini" | "perplexity";

export const platformLabels: Record<PlatformKey, { name: string; company: string }> = {
  chatgpt: { name: "ChatGPT", company: "OpenAI" },
  claude: { name: "Claude", company: "Anthropic" },
  gemini: { name: "Gemini", company: "Google" },
  perplexity: { name: "Perplexity", company: "Perplexity AI" },
};

export interface QueryResult {
  mentioned: boolean;
  position?: number | null;
}

export interface BrandQuery {
  text: string;
  results: Record<PlatformKey, QueryResult>;
}

export interface PlatformData {
  score: number;
  mentioned: boolean;
  sentiment: string;
  trend: number;
}

export interface Brand {
  name: string;
  domain: string;
  sector: string;
  overallScore: number;
  lastScan: string;
  platforms: Record<PlatformKey, PlatformData>;
  queries: BrandQuery[];
}

export const mockBrand: Brand = {
  name: "ISITMAX",
  domain: "isitmax.com",
  sector: "Isıtma Sistemleri",
  overallScore: 47,
  lastScan: "2026-03-10T14:30:00Z",
  platforms: {
    chatgpt: { score: 62, mentioned: true, sentiment: "pozitif", trend: +8 },
    claude: { score: 35, mentioned: false, sentiment: "nötr", trend: -2 },
    gemini: { score: 51, mentioned: true, sentiment: "pozitif", trend: +5 },
    perplexity: { score: 40, mentioned: true, sentiment: "nötr", trend: +3 },
  },
  queries: [
    {
      text: "En iyi yerden ısıtma firması hangisi?",
      results: {
        chatgpt: { mentioned: true, position: 1 },
        claude: { mentioned: false },
        gemini: { mentioned: true, position: 3 },
        perplexity: { mentioned: true, position: 2 },
      },
    },
    {
      text: "Ankara'da yerden ısıtma yaptırmak istiyorum",
      results: {
        chatgpt: { mentioned: false },
        claude: { mentioned: false },
        gemini: { mentioned: false },
        perplexity: { mentioned: true, position: null },
      },
    },
    {
      text: "Elektrikli mi sulu mu yerden ısıtma?",
      results: {
        chatgpt: { mentioned: true, position: null },
        claude: { mentioned: true, position: 1 },
        gemini: { mentioned: false },
        perplexity: { mentioned: false },
      },
    },
    {
      text: "Yerden ısıtma sistemleri fiyat karşılaştırma 2026",
      results: {
        chatgpt: { mentioned: true, position: 2 },
        claude: { mentioned: false },
        gemini: { mentioned: true, position: 1 },
        perplexity: { mentioned: true, position: 3 },
      },
    },
    {
      text: "Yerden ısıtma montaj yapan firmalar",
      results: {
        chatgpt: { mentioned: false },
        claude: { mentioned: false },
        gemini: { mentioned: true, position: 2 },
        perplexity: { mentioned: false },
      },
    },
  ],
};

export interface SiteCheck {
  id: string;
  title: string;
  description: string;
  status: "pass" | "fail" | "partial";
  details: string;
  impact: "high" | "medium" | "low";
  fix: string | null;
}

export const siteChecks: SiteCheck[] = [
  {
    id: "schema_org",
    title: "Schema.org Markup",
    description: "Yapay zekanın sitenizi anlaması için yapılandırılmış veri",
    status: "partial",
    details: "Organization schema var. Product ve FAQ schema eksik.",
    impact: "high",
    fix: "Ürün sayfalarına Product schema, SSS sayfasına FAQ schema ekleyin.",
  },
  {
    id: "faq_page",
    title: "SSS / FAQ Sayfası",
    description: "Sık sorulan sorular — AI'ların en çok referans verdiği içerik türü",
    status: "fail",
    details: "SSS sayfası bulunamadı.",
    impact: "high",
    fix: "Sektörünüzdeki en çok sorulan 20 soruyu yanıtlayan bir SSS sayfası oluşturun.",
  },
  {
    id: "product_info",
    title: "Ürün/Hizmet Bilgi Yapısı",
    description: "Ürün ve hizmetlerin makine tarafından okunabilir formatta olması",
    status: "partial",
    details: "Ürün sayfaları var ama fiyat, stok, özellik bilgisi yapılandırılmamış.",
    impact: "medium",
    fix: "Her ürün sayfasına fiyat, özellik, marka bilgisi ekleyin.",
  },
  {
    id: "google_business",
    title: "Google Business Profili",
    description: "AI'lar yerel önerilerde Google Business verisini kullanır",
    status: "pass",
    details: "Profil mevcut ve güncel. 4.6 puan, 127 yorum.",
    impact: "high",
    fix: null,
  },
  {
    id: "about_page",
    title: "Hakkımızda Sayfası",
    description: "Firma kimliği, geçmişi, uzmanlık alanları",
    status: "partial",
    details: "Sayfa var ama kuruluş yılı, ekip bilgisi, sertifikalar eksik.",
    impact: "medium",
    fix: "Hakkımızda sayfasına firma geçmişi, ekip, sertifikalar ekleyin.",
  },
  {
    id: "sector_directories",
    title: "Sektörel Dizin Kayıtları",
    description: "Sektörel dizinler AI'ların güvenilirlik sinyali olarak kullandığı kaynaklar",
    status: "fail",
    details: "Tespit edilen kayıt: 0/5 sektörel dizin",
    impact: "medium",
    fix: "Sektörünüzdeki dizinlere (ısıtma federasyonu, yapı market dizinleri vb.) kayıt olun.",
  },
  {
    id: "content_freshness",
    title: "İçerik Güncelliği",
    description: "AI'lar güncel içeriği tercih eder",
    status: "partial",
    details: "Son blog yazısı: 4 ay önce. Ana sayfa: güncel.",
    impact: "medium",
    fix: "Ayda en az 2 blog yazısı yayınlayın.",
  },
  {
    id: "meta_descriptions",
    title: "Meta Açıklamaları",
    description: "AI crawlerların sayfa içeriğini anlamak için kullandığı özet",
    status: "pass",
    details: "Ana sayfalar için mevcut ve uygun uzunlukta.",
    impact: "low",
    fix: null,
  },
];

export interface QuestionItem {
  text: string;
  platforms: number;
  covered: boolean;
}

export interface QuestionCategory {
  name: string;
  questions: QuestionItem[];
}

export interface QuestionsData {
  sector: string;
  totalQuestions: number;
  coveredQuestions: number;
  categories: QuestionCategory[];
}

export const mockQuestions: QuestionsData = {
  sector: "Isıtma Sistemleri",
  totalQuestions: 32,
  coveredQuestions: 12,
  categories: [
    {
      name: "Fiyat",
      questions: [
        { text: "Yerden ısıtma fiyatları 2026", platforms: 2, covered: true },
        { text: "Elektrikli yerden ısıtma maliyeti", platforms: 0, covered: false },
        { text: "Yerden ısıtma metrekare fiyatı", platforms: 0, covered: false },
        { text: "Isıtma sistemi kurulum maliyeti karşılaştırma", platforms: 1, covered: true },
        { text: "Doğalgaz yerden ısıtma fiyat", platforms: 0, covered: false },
        { text: "Yerden ısıtma tesisatı ücret 2026", platforms: 0, covered: false },
        { text: "Isıtma sistemi maliyet analizi", platforms: 1, covered: true },
        { text: "En ucuz yerden ısıtma çözümü", platforms: 0, covered: false },
      ],
    },
    {
      name: "Karşılaştırma",
      questions: [
        { text: "Elektrikli mi sulu mu yerden ısıtma", platforms: 2, covered: true },
        { text: "Yerden ısıtma vs radyatör", platforms: 3, covered: true },
        { text: "En iyi yerden ısıtma markası", platforms: 2, covered: true },
        { text: "Kombi mi yerden ısıtma mı", platforms: 1, covered: true },
        { text: "Yerden ısıtma avantajları dezavantajları", platforms: 0, covered: false },
        { text: "Isıtma sistemi karşılaştırma tablosu", platforms: 0, covered: false },
      ],
    },
    {
      name: "Montaj",
      questions: [
        { text: "Yerden ısıtma montaj yapan firmalar", platforms: 1, covered: true },
        { text: "Yerden ısıtma nasıl döşenir", platforms: 0, covered: false },
        { text: "Yerden ısıtma montaj süresi", platforms: 0, covered: false },
        { text: "Yerden ısıtma montaj hataları", platforms: 0, covered: false },
        { text: "Ankara yerden ısıtma montaj", platforms: 0, covered: false },
      ],
    },
    {
      name: "Teknik",
      questions: [
        { text: "Yerden ısıtma çalışma prensibi", platforms: 1, covered: true },
        { text: "Yerden ısıtma boru çeşitleri", platforms: 0, covered: false },
        { text: "Yerden ısıtma termostat ayarı", platforms: 2, covered: true },
        { text: "Yerden ısıtma verimlilik hesabı", platforms: 0, covered: false },
        { text: "Yerden ısıtma kazan seçimi", platforms: 1, covered: true },
        { text: "PEX boru mu PERT boru mu", platforms: 0, covered: false },
        { text: "Yerden ısıtma manifold nedir", platforms: 0, covered: false },
      ],
    },
    {
      name: "Marka",
      questions: [
        { text: "En iyi yerden ısıtma firması hangisi", platforms: 3, covered: true },
        { text: "Isıtmax yerden ısıtma yorumları", platforms: 1, covered: true },
        { text: "Güvenilir ısıtma firmaları", platforms: 0, covered: false },
        { text: "Isıtma sektörü lider firmalar", platforms: 0, covered: false },
      ],
    },
    {
      name: "Bakım",
      questions: [
        { text: "Yerden ısıtma bakım nasıl yapılır", platforms: 0, covered: false },
        { text: "Yerden ısıtma arıza tespit", platforms: 0, covered: false },
      ],
    },
  ],
};

export interface ActionTask {
  id: number;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  source: { tab: string; check?: string; category?: string };
  completed: boolean;
}

export interface ActionsData {
  currentWeek: number;
  tasks: ActionTask[];
  history: { week: number; total: number; completed: number }[];
}

export const mockActions: ActionsData = {
  currentWeek: 10,
  tasks: [
    {
      id: 1,
      priority: "high",
      title: "FAQ sayfası oluşturun",
      description:
        "Sektörünüzdeki en sık sorulan 10 soruyu yanıtlayan bir sayfa oluşturun. FAQ schema ile işaretleyin.",
      source: { tab: "site", check: "faq_page" },
      completed: false,
    },
    {
      id: 2,
      priority: "high",
      title: "Google Business profilini güncelleyin",
      description: "Çalışma saatleri ve hizmet alanı bilgilerini güncelleyin.",
      source: { tab: "site", check: "google_business" },
      completed: true,
    },
    {
      id: 3,
      priority: "medium",
      title: "Product schema ekleyin",
      description:
        "Ürün sayfalarına yapılandırılmış veri ekleyin: /urunler/yerden-isitma, /urunler/elektrikli-isitma",
      source: { tab: "site", check: "schema_org" },
      completed: false,
    },
    {
      id: 4,
      priority: "medium",
      title: '"Yerden ısıtma bakım rehberi" blog yazısı',
      description: "Soru haritasında bakım kategorisinde 0/2 kapsam. Bu konuda içerik üretin.",
      source: { tab: "sorular", category: "Bakım" },
      completed: false,
    },
    {
      id: 5,
      priority: "low",
      title: "Sektörel dizinlere kayıt olun",
      description: "insaat.org, isitma.org.tr, yapi.com.tr dizinlerine profil açın.",
      source: { tab: "site", check: "sector_directories" },
      completed: false,
    },
  ],
  history: [
    { week: 9, total: 4, completed: 3 },
    { week: 8, total: 5, completed: 2 },
  ],
};

export interface Competitor {
  name: string;
  domain: string;
  isUser: boolean;
  overallScore: number;
  platforms: Record<PlatformKey, number>;
  advantages?: string[];
  userGaps?: string[];
}

export const mockCompetitors: Competitor[] = [
  {
    name: "ISITMAX",
    domain: "isitmax.com",
    isUser: true,
    overallScore: 47,
    platforms: { chatgpt: 62, claude: 35, gemini: 51, perplexity: 40 },
  },
  {
    name: "Rakip A",
    domain: "rakipa.com",
    isUser: false,
    overallScore: 71,
    platforms: { chatgpt: 78, claude: 65, gemini: 72, perplexity: 68 },
    advantages: [
      "Kapsamlı FAQ sayfası (42 soru-cevap)",
      "Product schema tüm ürünlerde mevcut",
      "3 sektörel dizinde kayıtlı",
      "Haftalık blog yayını (son 6 ay kesintisiz)",
      "Google Business'ta 280+ yorum, 4.8 puan",
    ],
    userGaps: [
      "FAQ sayfası yok",
      "Product schema eksik",
      "Sektörel dizin kaydı yok",
      "Son blog: 4 ay önce",
    ],
  },
  {
    name: "Rakip B",
    domain: "rakipb.com",
    isUser: false,
    overallScore: 38,
    platforms: { chatgpt: 42, claude: 30, gemini: 44, perplexity: 35 },
  },
  {
    name: "Rakip C",
    domain: "rakipc.com",
    isUser: false,
    overallScore: 55,
    platforms: { chatgpt: 60, claude: 48, gemini: 58, perplexity: 52 },
  },
];

export interface WeekData {
  week: number;
  date: string;
  overall: number;
  chatgpt: number;
  claude: number;
  gemini: number;
  perplexity: number;
}

export interface Alert {
  type: "warning" | "success" | "info";
  text: string;
}

export interface HistoryData {
  weeks: WeekData[];
  alerts: Alert[];
}

export const mockHistory: HistoryData = {
  weeks: [
    { week: 1, date: "2026-01-06", overall: 28, chatgpt: 35, claude: 22, gemini: 30, perplexity: 25 },
    { week: 2, date: "2026-01-13", overall: 30, chatgpt: 38, claude: 24, gemini: 31, perplexity: 26 },
    { week: 3, date: "2026-01-20", overall: 29, chatgpt: 36, claude: 23, gemini: 30, perplexity: 27 },
    { week: 4, date: "2026-01-27", overall: 32, chatgpt: 40, claude: 25, gemini: 33, perplexity: 28 },
    { week: 5, date: "2026-02-03", overall: 35, chatgpt: 45, claude: 28, gemini: 36, perplexity: 30 },
    { week: 6, date: "2026-02-10", overall: 37, chatgpt: 48, claude: 30, gemini: 38, perplexity: 32 },
    { week: 7, date: "2026-02-17", overall: 38, chatgpt: 50, claude: 32, gemini: 40, perplexity: 33 },
    { week: 8, date: "2026-02-24", overall: 40, chatgpt: 52, claude: 34, gemini: 42, perplexity: 35 },
    { week: 9, date: "2026-03-03", overall: 44, chatgpt: 54, claude: 37, gemini: 46, perplexity: 37 },
    { week: 10, date: "2026-03-10", overall: 47, chatgpt: 62, claude: 35, gemini: 51, perplexity: 40 },
  ],
  alerts: [
    { type: "warning", text: "Claude skoru 2 haftadır düşüyor (37 → 35)" },
    { type: "success", text: "ChatGPT skoru 3 haftadır yükseliyor (54 → 62)" },
    { type: "success", text: "Genel skor ilk kez 45'in üzerine çıktı" },
    { type: "info", text: "Rakip A skoru 71'e yükseldi (+6 bu hafta)" },
  ],
};
