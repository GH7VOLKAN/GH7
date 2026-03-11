import { PlatformKey, Sentiment } from "../types";

export interface ModelResult {
  platform: PlatformKey;
  mentioned: boolean;
  position: string | null;
  sentiment: Sentiment | null;
  source: string | null;
}

export interface PromptItem {
  id: number;
  text: string;
  visibility: number;
  position: string | null;
  sentiment: Sentiment | null;
  topCompetitor: string | null;
  tags: string[];
  modelResults: ModelResult[];
  competitorVisibility: { name: string; visibility: number; avgPosition: string }[];
  trendData: number[];
}

export interface SuggestedPrompt {
  text: string;
  volume: number; // 1-5
}

export const promptItems: PromptItem[] = [
  {
    id: 1,
    text: "En iyi yerden ısıtma firması hangisi?",
    visibility: 75,
    position: "2.",
    sentiment: "pozitif",
    topCompetitor: "Rakip A (1.)",
    tags: ["marka", "karşılaştırma"],
    modelResults: [
      { platform: "chatgpt", mentioned: true, position: "2. sıra", sentiment: "pozitif", source: "isitmax.com" },
      { platform: "claude", mentioned: false, position: null, sentiment: null, source: null },
      { platform: "gemini", mentioned: true, position: "3. sıra", sentiment: "nötr", source: null },
      { platform: "perplexity", mentioned: true, position: "1. sıra", sentiment: "pozitif", source: "isitmax.com/urunler" },
    ],
    competitorVisibility: [
      { name: "Rakip A", visibility: 100, avgPosition: "1. sıra" },
      { name: "ISITMAX", visibility: 75, avgPosition: "2. sıra" },
      { name: "Rakip C", visibility: 50, avgPosition: "3. sıra" },
    ],
    trendData: [60, 65, 70, 68, 72, 75, 75],
  },
  {
    id: 2,
    text: "Yerden ısıtma fiyatları 2026",
    visibility: 50,
    position: "3.",
    sentiment: "nötr",
    topCompetitor: "Rakip C (1.)",
    tags: ["fiyat"],
    modelResults: [
      { platform: "chatgpt", mentioned: true, position: "3. sıra", sentiment: "nötr", source: "isitmax.com" },
      { platform: "claude", mentioned: false, position: null, sentiment: null, source: null },
      { platform: "gemini", mentioned: true, position: "2. sıra", sentiment: "nötr", source: null },
      { platform: "perplexity", mentioned: false, position: null, sentiment: null, source: null },
    ],
    competitorVisibility: [
      { name: "Rakip C", visibility: 75, avgPosition: "1. sıra" },
      { name: "ISITMAX", visibility: 50, avgPosition: "2.5 sıra" },
      { name: "Rakip A", visibility: 50, avgPosition: "3. sıra" },
    ],
    trendData: [30, 35, 40, 42, 45, 48, 50],
  },
  {
    id: 3,
    text: "Elektrikli yerden ısıtma önerisi",
    visibility: 25,
    position: null,
    sentiment: "nötr",
    topCompetitor: "Rakip A (1.)",
    tags: ["ürün", "teknik"],
    modelResults: [
      { platform: "chatgpt", mentioned: true, position: "bahsediliyor", sentiment: "nötr", source: null },
      { platform: "claude", mentioned: false, position: null, sentiment: null, source: null },
      { platform: "gemini", mentioned: false, position: null, sentiment: null, source: null },
      { platform: "perplexity", mentioned: false, position: null, sentiment: null, source: null },
    ],
    competitorVisibility: [
      { name: "Rakip A", visibility: 75, avgPosition: "1. sıra" },
      { name: "ISITMAX", visibility: 25, avgPosition: "-" },
    ],
    trendData: [10, 15, 20, 20, 22, 25, 25],
  },
  {
    id: 4,
    text: "Ankara yerden ısıtma firmaları",
    visibility: 25,
    position: null,
    sentiment: null,
    topCompetitor: "Rakip B (2.)",
    tags: ["yerel", "marka"],
    modelResults: [
      { platform: "chatgpt", mentioned: false, position: null, sentiment: null, source: null },
      { platform: "claude", mentioned: false, position: null, sentiment: null, source: null },
      { platform: "gemini", mentioned: true, position: "bahsediliyor", sentiment: "nötr", source: null },
      { platform: "perplexity", mentioned: false, position: null, sentiment: null, source: null },
    ],
    competitorVisibility: [
      { name: "Rakip B", visibility: 50, avgPosition: "2. sıra" },
      { name: "ISITMAX", visibility: 25, avgPosition: "-" },
    ],
    trendData: [20, 22, 20, 25, 25, 25, 25],
  },
  {
    id: 5,
    text: "Yerden ısıtma bakım nasıl yapılır",
    visibility: 0,
    position: null,
    sentiment: null,
    topCompetitor: null,
    tags: ["bakım", "teknik"],
    modelResults: [
      { platform: "chatgpt", mentioned: false, position: null, sentiment: null, source: null },
      { platform: "claude", mentioned: false, position: null, sentiment: null, source: null },
      { platform: "gemini", mentioned: false, position: null, sentiment: null, source: null },
      { platform: "perplexity", mentioned: false, position: null, sentiment: null, source: null },
    ],
    competitorVisibility: [],
    trendData: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 6,
    text: "Yerden ısıtma sistemleri karşılaştırma",
    visibility: 50,
    position: "2.",
    sentiment: "pozitif",
    topCompetitor: "Rakip A (1.)",
    tags: ["karşılaştırma"],
    modelResults: [
      { platform: "chatgpt", mentioned: true, position: "2. sıra", sentiment: "pozitif", source: "isitmax.com" },
      { platform: "claude", mentioned: false, position: null, sentiment: null, source: null },
      { platform: "gemini", mentioned: true, position: "1. sıra", sentiment: "pozitif", source: "isitmax.com/urunler" },
      { platform: "perplexity", mentioned: false, position: null, sentiment: null, source: null },
    ],
    competitorVisibility: [
      { name: "Rakip A", visibility: 100, avgPosition: "1. sıra" },
      { name: "ISITMAX", visibility: 50, avgPosition: "2. sıra" },
    ],
    trendData: [35, 38, 40, 42, 45, 48, 50],
  },
];

export const suggestedPrompts: SuggestedPrompt[] = [
  { text: "Yerden ısıtma mı klima mı daha ekonomik", volume: 4 },
  { text: "Yerden ısıtma hangi zeminlere uygun", volume: 3 },
  { text: "Sulu yerden ısıtma avantajları dezavantajları", volume: 3 },
  { text: "Yerden ısıtma kazan seçimi nasıl yapılır", volume: 2 },
];

export const promptStats = { active: 32, suggested: 15 };
