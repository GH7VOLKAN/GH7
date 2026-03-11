import { SourceType } from "../types";

export interface SourceDomain {
  domain: string;
  type: SourceType;
  usagePercent: number;
  avgCitations: number;
  urls?: SourceURL[];
  actionNote?: string;
}

export interface SourceURL {
  path: string;
  usagePercent: number;
  promptCount: number;
}

export const sourceDomains: SourceDomain[] = [
  {
    domain: "isitmax.com",
    type: "kurumsal",
    usagePercent: 28,
    avgCitations: 3.2,
    urls: [
      { path: "/urunler/yerden-isitma", usagePercent: 15, promptCount: 8 },
      { path: "/blog/yerden-isitma-rehberi", usagePercent: 8, promptCount: 4 },
      { path: "/hakkimizda", usagePercent: 5, promptCount: 3 },
      { path: "/", usagePercent: 3, promptCount: 2 },
    ],
  },
  {
    domain: "rakipa.com",
    type: "kurumsal",
    usagePercent: 45,
    avgCitations: 5.1,
  },
  {
    domain: "google.com/business",
    type: "referans",
    usagePercent: 32,
    avgCitations: 2.4,
  },
  {
    domain: "insaat.org",
    type: "dizin",
    usagePercent: 18,
    avgCitations: 1.8,
    actionNote: "Sizin kaydınız yok. Rakip A kayıtlı.",
  },
  {
    domain: "reddit.com/r/turkiye",
    type: "ugc",
    usagePercent: 12,
    avgCitations: 1.2,
  },
  {
    domain: "yapi.com.tr",
    type: "dizin",
    usagePercent: 8,
    avgCitations: 0.9,
    actionNote: "Sizin kaydınız yok.",
  },
  {
    domain: "hurriyet.com.tr/emlak",
    type: "medya",
    usagePercent: 6,
    avgCitations: 0.7,
  },
];
