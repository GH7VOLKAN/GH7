import { getActiveBrand } from "@/lib/dal/brand";
import { getOverviewData } from "@/lib/dal/overview";
import { EmptyState } from "@/components/panel/empty-state";
import { LayoutDashboardIcon } from "lucide-react";
import { TurkeyMap } from "@/components/panel/turkey-map";

import { GeoScoreHero } from "@/components/panel/genel/geo-score-hero";
import { MetricCards } from "@/components/panel/genel/metric-cards";
import { TrendChart } from "@/components/panel/genel/trend-chart";
import { BrandShareDonut } from "@/components/panel/genel/brand-share-donut";
import { KeywordTable } from "@/components/panel/genel/keyword-table";
import { AiResponses } from "@/components/panel/genel/ai-responses";
import { ActionItems } from "@/components/panel/genel/action-items";
import { CitedSources } from "@/components/panel/genel/cited-sources";

export default async function GenelBakisPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;

  if (!brandId) {
    return (
      <EmptyState
        icon={LayoutDashboardIcon}
        title="Marka bulunamadı"
        description="Lütfen önce marka ekleyin."
      />
    );
  }

  const data = await getOverviewData(brandId);

  if (data.totalResultCount === 0) {
    return (
      <EmptyState
        icon={LayoutDashboardIcon}
        title="Henüz tarama yapılmadı"
        description="İlk taramanızı başlatarak GEO skorunuzu öğrenin."
      />
    );
  }

  // Build city data for TurkeyMap from real data (placeholder — no city-level data in overview yet)
  // TurkeyMap expects Record<string, { score: number; status: string }>
  const cityData: Record<string, { score: number; status: string }> = {};

  // Combine best + worst prompts for keyword table
  const allPrompts = [...data.bestPrompts, ...data.worstPrompts];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
            <p className="text-sm text-gray-400 mt-1">
              Markanızın AI arama performansına genel bakış
              {data.lastScanTimeAgo && (
                <span className="ml-2 text-gray-300">
                  \u00b7 Son tarama: {data.lastScanTimeAgo}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 1. GEO Score Hero */}
        <GeoScoreHero score={data.mentionScore} trend={data.mentionTrend} />

        {/* 2. Metric Cards */}
        <MetricCards
          mentionScore={data.mentionScore}
          totalMentions={data.totalMentionCount}
          totalResults={data.totalResultCount}
          platformStats={data.platformStats}
          competitorRanking={data.competitorRanking}
          recentMentions={data.recentMentions}
        />

        {/* 3. Turkey Heatmap */}
        {Object.keys(cityData).length > 0 && (
          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Türkiye Isı Haritası
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  İl bazında AI görünürlük performansınız
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-sm bg-green-500" />
                  Güçlü
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-sm bg-yellow-400" />
                  Orta
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-sm bg-red-400" />
                  Zayıf
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-sm bg-gray-200" />
                  Takip Edilmiyor
                </span>
              </div>
            </div>
            <div className="w-full overflow-hidden">
              <TurkeyMap cityData={cityData} />
            </div>
          </div>
        )}

        {/* 4. Action Items */}
        <ActionItems
          actions={data.priorityActions}
          checklistProgress={data.checklistProgress}
        />

        {/* 5. Brand Share Donut */}
        <BrandShareDonut competitors={data.competitorRanking} />

        {/* 6. Trend Chart */}
        <TrendChart
          data={data.weeklyTrend}
          scoreHistory={data.scoreHistory}
        />

        {/* 7. Keyword Breakdown Table */}
        <KeywordTable prompts={allPrompts} />

        {/* 8. Cited Sources */}
        <CitedSources
          sources={data.sourceMap}
          brandDomain={data.brandDomain}
        />

        {/* 9. AI Responses */}
        <AiResponses
          responses={data.aiResponseExcerpts}
          mentions={data.recentMentions}
        />
      </div>
    </div>
  );
}
