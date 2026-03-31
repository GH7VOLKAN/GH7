"use client";

import { useRouter } from "next/navigation";
import { GeoScoreHero } from "@/components/panel/genel/geo-score-hero";
import { MetricCards } from "@/components/panel/genel/metric-cards";
import { TrendChart } from "@/components/panel/genel/trend-chart";
import { BrandShareDonut } from "@/components/panel/genel/brand-share-donut";
import { KeywordTable } from "@/components/panel/genel/keyword-table";
import { CitedSources } from "@/components/panel/genel/cited-sources";
import { AiResponses } from "@/components/panel/genel/ai-responses";
import { ActionItems } from "@/components/panel/genel/action-items";
import { TurkeyMap } from "@/components/panel/turkey-map";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import {
  DEMO_METRICS,
  DEMO_COMPETITORS,
  DEMO_KEYWORDS,
  DEMO_CITED_DOMAINS,
  DEMO_CITED_PAGES,
  DEMO_AI_RESPONSES,
  DEMO_CITY_DATA,
  DEMO_TREND_DATA,
} from "@/data/demo-data";

// ---------------------------------------------------------------------------
// Adapters: transform demo-data into component prop shapes
// ---------------------------------------------------------------------------

// MetricCards expects specific shapes from the DAL. We map demo data.
const platformStats = [
  { platform: "chatgpt", score: 74 },
  { platform: "perplexity", score: 83 },
  { platform: "gemini", score: 58 },
  { platform: "google_aio", score: 61 },
  { platform: "claude", score: 49 },
  { platform: "copilot", score: 41 },
];

const competitorRanking = DEMO_COMPETITORS.map((c) => ({
  name: c.name,
  mentionCount: c.share,
  isUser: c.name === "ISITMAX",
}));

const recentMentions = DEMO_KEYWORDS.map((k) => ({
  prompt: k.keyword,
  platform: "chatgpt" as const,
  position: k.avgPosition,
  sentiment: k.sentiment > 0.6 ? ("pozitif" as const) : ("notr" as const),
  excerpt: "",
  sources: [],
}));

// KeywordTable expects PromptSummaryItem[]
const keywordTableData = DEMO_KEYWORDS.map((k) => ({
  prompt: k.keyword,
  mentionedCount: Math.round((k.coverage / 100) * 5),
  totalResults: 5,
  platforms: {
    chatgpt: k.coverage === 100,
    claude: k.coverage === 100,
    gemini: k.coverage >= 80,
    perplexity: k.coverage >= 80,
    google_aio: k.coverage >= 20,
  },
}));

// CitedSources expects SourceMapEntry[]
const citedSourcesData = [
  ...DEMO_CITED_DOMAINS.map((d) => ({
    domain: d.domain,
    url: `https://${d.domain}`,
    count: d.cites,
  })),
  ...DEMO_CITED_PAGES.map((p) => ({
    domain: "isitmax.com",
    url: `https://isitmax.com${p.path}`,
    count: p.cites,
  })),
];

// AiResponses expects AiResponseExcerpt[]
const aiResponseData = DEMO_AI_RESPONSES.map((r) => ({
  platform: r.provider === "AI Overview" ? "google_aio" : r.provider.toLowerCase(),
  prompt: r.keyword,
  excerpt: r.response,
  citations: r.sources,
}));

const aiMentionsData = DEMO_AI_RESPONSES.map((r) => ({
  prompt: r.keyword,
  platform: r.provider === "AI Overview" ? "google_aio" : r.provider.toLowerCase(),
  position: r.position,
  sentiment: r.brandMentioned ? ("pozitif" as const) : ("notr" as const),
  excerpt: r.response,
  sources: r.sources,
}));

// TrendChart data
const trendChartData = DEMO_TREND_DATA.geoScore.map((d, i) => ({
  week: d.date,
  chatgpt: 60 + Math.round(Math.random() * 20),
  claude: 40 + Math.round(Math.random() * 15),
  gemini: 50 + Math.round(Math.random() * 15),
  perplexity: 70 + Math.round(Math.random() * 15),
  google_aio: 55 + Math.round(Math.random() * 15),
}));

const scoreHistoryData = DEMO_TREND_DATA.geoScore.map((d) => ({
  date: d.date,
  mentionScore: d.value,
}));

// TurkeyMap data
const turkeyMapData: Record<string, { score: number; status: string }> = {};
for (const [city, data] of Object.entries(DEMO_CITY_DATA)) {
  turkeyMapData[city] = { score: data.score, status: data.status };
}

// Actions
const actionList = [
  { title: "/banyo-yerden-isitma sayfasina FAQ ekle — Gemini referansi baslasin", impact: "high" },
  { title: "YouTube'a 'Yerden Isitma Kurulum' videosu yukle — ChatGPT video kaynagi tercih ediyor", impact: "high" },
  { title: "Schema markup guncelle (/urunler sayfasi) — AI botlari yapilandirilmis veriyi seviyor", impact: "medium" },
];

// City stats
const trackedCities = Object.values(DEMO_CITY_DATA).filter((c) => c.status !== "not-tracked");
const strongCities = trackedCities.filter((c) => c.status === "strong").length;
const moderateCities = trackedCities.filter((c) => c.status === "moderate").length;
const weakCities = trackedCities.filter((c) => c.status === "weak" || c.status === "none").length;
const notTrackedCities = Object.values(DEMO_CITY_DATA).filter((c) => c.status === "not-tracked").length;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GenelBakisPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 pb-12">
      {/* 1.1 — GEO Skor Karti */}
      <GeoScoreHero score={DEMO_METRICS.geoScore} trend={DEMO_METRICS.changes.geoScore} />

      {/* 1.2 — 4 Metrik Karti */}
      <MetricCards
        mentionScore={DEMO_METRICS.geoScore}
        totalMentions={DEMO_KEYWORDS.reduce((s, k) => s + (k.coverage === 100 ? 5 : k.coverage >= 80 ? 4 : 1), 0)}
        totalResults={DEMO_KEYWORDS.length * 5}
        platformStats={platformStats as never}
        competitorRanking={competitorRanking as never}
        recentMentions={recentMentions as never}
      />

      {/* 1.3 — Turkiye Isi Haritasi */}
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Il Bazli AI Gorunurluk
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Hizmet verdiginiz illerde yapay zeka sizi ne kadar taniyor?
            </p>
          </div>
        </div>

        <TurkeyMap
          cityData={turkeyMapData}
          onCityClick={(city) => {
            const slug = city
              .toLowerCase()
              .replace(/\u00e7/g, "c")
              .replace(/\u011f/g, "g")
              .replace(/\u0131/g, "i")
              .replace(/\u00f6/g, "o")
              .replace(/\u015f/g, "s")
              .replace(/\u00fc/g, "u")
              .replace(/\u00c7/g, "c")
              .replace(/\u011e/g, "g")
              .replace(/\u0130/g, "i")
              .replace(/\u00d6/g, "o")
              .replace(/\u015e/g, "s")
              .replace(/\u00dc/g, "u")
              .replace(/\s+/g, "-");
            router.push(`/panel/iller/${slug}`);
          }}
        />

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <span>
            <span className="inline-block w-3 h-3 rounded-sm bg-green-500 mr-1.5 align-middle" />
            {strongCities} ilde guclu
          </span>
          <span>
            <span className="inline-block w-3 h-3 rounded-sm bg-yellow-500 mr-1.5 align-middle" />
            {moderateCities} ilde orta
          </span>
          <span>
            <span className="inline-block w-3 h-3 rounded-sm bg-red-500 mr-1.5 align-middle" />
            {weakCities} ilde zayif
          </span>
          <span>
            <span className="inline-block w-3 h-3 rounded-sm bg-gray-200 mr-1.5 align-middle" />
            {notTrackedCities} il henuz takip edilmiyor
          </span>
        </div>

        <button
          onClick={() => router.push("/panel/iller")}
          className="mt-4 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
        >
          Yeni il ekle &rarr;
        </button>
      </div>

      {/* 1.4 — Yapilacaklar */}
      <ActionItems
        actions={actionList}
        checklistProgress={{ completed: 1, total: 3 }}
      />

      {/* 1.5 — Marka Ses Payi (Donut Chart) */}
      <BrandShareDonut competitors={competitorRanking as never} />

      {/* 1.6 — Trend Grafigi */}
      <TrendChart data={trendChartData as never} scoreHistory={scoreHistoryData} />

      {/* 1.7 — Arama Bazli Kirilim */}
      <KeywordTable prompts={keywordTableData as never} />

      {/* 1.8 — En Cok Referans Alinan Siteler */}
      <CitedSources sources={citedSourcesData as never} brandDomain="isitmax.com" />

      {/* 1.9 — AI Sizi Nasil Anlatiyor */}
      <AiResponses responses={aiResponseData as never} mentions={aiMentionsData as never} />

      {/* Bottom CTA */}
      <PageBottomCTA />
    </div>
  );
}
