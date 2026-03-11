import { PlatformKey, Sentiment } from "../types";

export interface DualScores {
  mention: { score: number; trend: number; label: string };
  readiness: { score: number; trend: number; label: string };
}

export interface VisibilityRow {
  name: string;
  isUser: boolean;
  platforms: Record<PlatformKey, number>;
}

export interface RecentMention {
  platform: PlatformKey;
  timeAgo: string;
  prompt: string;
  excerpt: string;
  position: string;
  sentiment: Sentiment;
}

export interface PriorityAction {
  title: string;
  impact: string;
}

export const dualScores: DualScores = {
  mention: { score: 34, trend: +3, label: "AI Bahsedilme" },
  readiness: { score: 52, trend: +6, label: "Site Hazırlık" },
};

export const visibilityData: VisibilityRow[] = [
  { name: "ISITMAX", isUser: true, platforms: { chatgpt: 42, claude: 18, gemini: 35, perplexity: 28 } },
  { name: "Rakip A", isUser: false, platforms: { chatgpt: 65, claude: 52, gemini: 58, perplexity: 61 } },
  { name: "Rakip B", isUser: false, platforms: { chatgpt: 30, claude: 15, gemini: 40, perplexity: 22 } },
  { name: "Rakip C", isUser: false, platforms: { chatgpt: 48, claude: 38, gemini: 42, perplexity: 45 } },
];

export const recentMentions: RecentMention[] = [
  {
    platform: "chatgpt",
    timeAgo: "2 saat önce",
    prompt: "Türkiye'de en iyi yerden ısıtma firması hangisi?",
    excerpt: "...ISITMAX, Türkiye'nin önde gelen yerden ısıtma firmalarından biridir. Geniş ürün yelpazesi ve teknik destek ile bilinir...",
    position: "2. sıra",
    sentiment: "pozitif",
  },
  {
    platform: "perplexity",
    timeAgo: "5 saat önce",
    prompt: "Yerden ısıtma fiyatları 2026",
    excerpt: "...Fiyatlar metrekareye göre değişmektedir. ISITMAX ve Rakip A gibi firmalar farklı seçenekler sunmaktadır...",
    position: "bahsediliyor",
    sentiment: "nötr",
  },
  {
    platform: "gemini",
    timeAgo: "8 saat önce",
    prompt: "Elektrikli yerden ısıtma avantajları",
    excerpt: "...Elektrikli yerden ısıtma sistemleri enerji verimliliği açısından tercih edilmektedir. ISITMAX bu alanda çeşitli çözümler sunmaktadır...",
    position: "3. sıra",
    sentiment: "pozitif",
  },
];

export const priorityActions: PriorityAction[] = [
  { title: "FAQ sayfası oluşturun", impact: "Site Hazırlık +10 puan" },
  { title: "Product schema ekleyin", impact: "Site Hazırlık +10 puan" },
  { title: "\"Bakım rehberi\" içeriği yazın", impact: "2 yeni promptta bahsedilme potansiyeli" },
];

export const nextScanIn = "4 saat 23 dakika";
