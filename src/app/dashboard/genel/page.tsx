import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { PlatformBreakdownCard } from "@/components/platform-breakdown-card";
import { CompetitorRankingCard } from "@/components/competitor-ranking-card";
import { TopActionCard } from "@/components/top-action-card";
import { RecentMentionsTable } from "@/components/recent-mentions-table";
import { MonthlyReportCard } from "@/components/monthly-report-card";
import { ProUpgradeCard } from "@/components/pro-upgrade-card";
import { WelcomeHero } from "@/components/welcome-hero";
import { getActiveBrand } from "@/lib/dal/brand";
import { getOverviewData } from "@/lib/dal/overview";

export default async function GenelPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;
  const brandName = activeBrand?.brand?.name ?? "";
  const plan = activeBrand?.plan ?? "free";

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadı. Lütfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getOverviewData(brandId);

  // Show welcome state if no scan has ever been run
  if (data.totalResultCount === 0) {
    return (
      <WelcomeHero
        brandId={brandId}
        brandName={brandName}
        activePromptCount={data.activePromptCount}
      />
    );
  }

  const chartData = data.scoreHistory.map((h) => ({
    date: h.date,
    bahsedilme: h.mentionScore,
    hazirlik: h.readinessScore,
  }));

  return (
    <>
      {/* Üst: 2 büyük metrik — mention rate + senin yerine kim */}
      <SectionCards
        mentionScore={data.mentionScore}
        mentionTrend={data.mentionTrend}
        totalMentionCount={data.totalMentionCount}
        totalResultCount={data.totalResultCount}
        lastScanTimeAgo={data.lastScanTimeAgo}
        topCompetitorName={data.topCompetitorName}
        topCompetitorGap={data.topCompetitorGap}
      />

      {/* Platform kartları — renkli, mention rate */}
      <div className="px-4 lg:px-6">
        <PlatformBreakdownCard
          platforms={data.platformStats}
          weeklyRate={data.weeklyMentionRate}
        />
      </div>

      {/* Senin Yerine Kim (özet) — bar chart + platform bazlı sıralama */}
      {data.competitorRanking.length > 0 && (
        <div className="px-4 lg:px-6">
          <CompetitorRankingCard
            ranking={data.competitorRanking}
            totalResults={data.totalResultCount}
          />
        </div>
      )}

      {/* En önemli aksiyonun */}
      {data.priorityActions.length > 0 && (
        <div className="px-4 lg:px-6">
          <TopActionCard action={data.priorityActions[0]} />
        </div>
      )}

      {/* Trend grafik */}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive scoreHistory={chartData} />
      </div>

      {/* Son bahsedilmeler */}
      <RecentMentionsTable
        recentMentions={data.recentMentions}
        lastScanTimeAgo={data.lastScanTimeAgo}
        totalMentionCount={data.totalMentionCount}
        totalResultCount={data.totalResultCount}
      />

      {/* Aylık rapor */}
      <div className="px-4 lg:px-6">
        <MonthlyReportCard brandId={brandId} plan={plan} />
      </div>

      {/* Pro CTA — sayfanın en altında */}
      <ProUpgradeCard type="trend" plan={plan} />
    </>
  );
}
