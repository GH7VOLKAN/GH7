import { PlatformKey } from "../types";

export interface CompetitorRow {
  name: string;
  domain: string;
  isUser: boolean;
  mentionScore: number;
  readinessScore: number;
  platforms: Record<PlatformKey, number>;
}

export interface CompetitorDetail {
  name: string;
  mentionScore: number;
  userMentionScore: number;
  readinessGaps: string[];
  topSourcePages: { path: string; promptCount: number }[];
}

export const competitorRows: CompetitorRow[] = [
  {
    name: "ISITMAX",
    domain: "isitmax.com",
    isUser: true,
    mentionScore: 34,
    readinessScore: 52,
    platforms: { chatgpt: 42, claude: 18, gemini: 35, perplexity: 28 },
  },
  {
    name: "Rakip A",
    domain: "rakipa.com",
    isUser: false,
    mentionScore: 68,
    readinessScore: 84,
    platforms: { chatgpt: 65, claude: 52, gemini: 58, perplexity: 61 },
  },
  {
    name: "Rakip B",
    domain: "rakipb.com",
    isUser: false,
    mentionScore: 31,
    readinessScore: 41,
    platforms: { chatgpt: 30, claude: 15, gemini: 40, perplexity: 22 },
  },
  {
    name: "Rakip C",
    domain: "rakipc.com",
    isUser: false,
    mentionScore: 52,
    readinessScore: 67,
    platforms: { chatgpt: 48, claude: 38, gemini: 42, perplexity: 45 },
  },
];

export const competitorDetail: CompetitorDetail = {
  name: "Rakip A",
  mentionScore: 68,
  userMentionScore: 34,
  readinessGaps: [
    "FAQ sayfası var (42 soru) — sizde yok",
    "Product schema tüm ürünlerde — sizde yok",
    "3 sektörel dizinde kayıtlı — sizde 0",
    "Haftalık blog yayını — sizde 4 ay önce",
    "280+ Google Business yorumu — sizde 127",
  ],
  topSourcePages: [
    { path: "/sss (42 soru-cevap)", promptCount: 12 },
    { path: "/blog/yerden-isitma-rehberi", promptCount: 8 },
    { path: "Google Business profili", promptCount: 6 },
  ],
};
