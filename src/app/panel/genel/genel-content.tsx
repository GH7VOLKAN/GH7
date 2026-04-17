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
import { RoiEstimateCard } from "@/components/panel/genel/roi-estimate-card";
import { AuditTrendChart } from "@/components/panel/genel/audit-trend-chart";
import type {
  PlatformStat,
  CompetitorRankEntry,
  RecentMention,
  WeeklyTrendPoint,
  ChecklistProgress,
  PromptSummaryItem,
  AiResponseExcerpt,
  SourceMapEntry,
} from "@/lib/dal/overview";
import type { RoiEstimate } from "@/lib/dal/roi";

export interface GenelContentProps {
  mentionScore: number;
  mentionTrend: number;
  totalMentionCount: number;
  totalResultCount: number;
  platformStats: PlatformStat[];
  competitorRanking: CompetitorRankEntry[];
  recentMentions: RecentMention[];
  weeklyTrend: WeeklyTrendPoint[];
  scoreHistory: { date: string; mentionScore: number }[];
  bestPrompts: PromptSummaryItem[];
  worstPrompts: PromptSummaryItem[];
  sourceMap: SourceMapEntry[];
  brandDomain: string;
  aiResponseExcerpts: AiResponseExcerpt[];
  priorityActions: { title: string; impact: string }[];
  checklistProgress: ChecklistProgress;
  roiEstimate?: RoiEstimate;
  auditTrendData?: Array<{ weekStart: string; overallScore: number; competitorScore: number | null }>;
}

export function GenelContent({
  mentionScore,
  mentionTrend,
  totalMentionCount,
  totalResultCount,
  platformStats,
  competitorRanking,
  recentMentions,
  weeklyTrend,
  scoreHistory,
  bestPrompts,
  worstPrompts,
  sourceMap,
  brandDomain,
  aiResponseExcerpts,
  priorityActions,
  checklistProgress,
  roiEstimate,
  auditTrendData,
}: GenelContentProps) {
  const router = useRouter();

  // KeywordTable expects PromptSummaryItem[] — merge best + worst
  const allPrompts = [...bestPrompts, ...worstPrompts];

  return (
    <div className="space-y-6 pb-12">
      {/* 1.1 — GEO Skor Kartı */}
      <GeoScoreHero score={mentionScore} trend={mentionTrend} />

      {/* 1.2 — 4 Metrik Kartı */}
      <MetricCards
        mentionScore={mentionScore}
        totalMentions={totalMentionCount}
        totalResults={totalResultCount}
        platformStats={platformStats as never}
        competitorRanking={competitorRanking as never}
        recentMentions={recentMentions as never}
      />

      {/* 1.2b — ROI Tahmini */}
      {roiEstimate && roiEstimate.totalMentions > 0 && (
        <RoiEstimateCard roi={roiEstimate} />
      )}

      {/* 1.2c — 43 Madde GEO Trend (Pro) */}
      {auditTrendData && auditTrendData.length > 0 && (
        <AuditTrendChart data={auditTrendData} />
      )}

      {/* 1.3 — Türkiye Isı Haritası */}
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              İl Bazlı AI Görünürlük
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Hizmet verdiğiniz illerde yapay zeka sizi ne kadar tanıyor?
            </p>
          </div>
        </div>

        <TurkeyMap
          cityData={{}}
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

        <div className="mt-4 text-sm text-gray-500 text-center">
          İl bazlı detaylı görünürlük için &quot;İller&quot; sayfasını ziyaret edin.
        </div>

        <button
          onClick={() => router.push("/panel/iller")}
          className="mt-4 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
        >
          İl detaylarını gör &rarr;
        </button>
      </div>

      {/* 1.4 — Yapılacaklar */}
      <ActionItems
        actions={priorityActions}
        checklistProgress={checklistProgress}
      />

      {/* 1.5 — Marka Ses Payı (Donut Chart) */}
      <BrandShareDonut competitors={competitorRanking as never} />

      {/* 1.6 — Trend Grafiği */}
      <TrendChart data={weeklyTrend as never} scoreHistory={scoreHistory} />

      {/* 1.7 — Arama Bazlı Kırılım */}
      <KeywordTable prompts={allPrompts as never} />

      {/* 1.8 — En Çok Referans Alınan Siteler */}
      <CitedSources sources={sourceMap as never} brandDomain={brandDomain} />

      {/* 1.9 — AI Sizi Nasıl Anlatıyor */}
      <AiResponses responses={aiResponseExcerpts as never} mentions={recentMentions as never} />

      {/* Bottom CTA */}
      <PageBottomCTA />
    </div>
  );
}
