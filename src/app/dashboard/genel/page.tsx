import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { PlatformBreakdownCard } from "@/components/platform-breakdown-card";
import { RecentMentionsTable } from "@/components/recent-mentions-table";
import { MonthlyReportCard } from "@/components/monthly-report-card";
import { BlurredSection } from "@/components/ui/blurred-section";
import { WelcomeHero } from "@/components/welcome-hero";
import { getActiveBrand } from "@/lib/dal/brand";
import { getOverviewData } from "@/lib/dal/overview";
import { canAccess } from "@/lib/plans";

export default async function GenelPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;
  const brandName = activeBrand?.brand?.name ?? "";
  const plan = activeBrand?.plan ?? "free";

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadi. Lutfen ayarlardan marka ekleyin.
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

  const trendLocked = !canAccess(plan, "trendView");

  return (
    <>
      <SectionCards
        mentionScore={data.mentionScore}
        mentionTrend={data.mentionTrend}
        readinessScore={data.readinessScore}
        readinessTrend={data.readinessTrend}
        activePromptCount={data.activePromptCount}
        totalSourceCount={data.totalSourceCount}
        totalMentionCount={data.totalMentionCount}
        totalResultCount={data.totalResultCount}
        lastScanTimeAgo={data.lastScanTimeAgo}
        topCompetitorName={data.topCompetitorName}
        topCompetitorGap={data.topCompetitorGap}
      />
      <div className="px-4 lg:px-6">
        <PlatformBreakdownCard
          platforms={data.platformStats}
          weeklyRate={data.weeklyMentionRate}
        />
      </div>
      <BlurredSection
        isLocked={trendLocked}
        title="Trend Grafigi"
        description="Zaman icindeki skor degisimlerini gormek icin Pro plana gecin."
      >
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive scoreHistory={chartData} />
        </div>
      </BlurredSection>
      <RecentMentionsTable
        recentMentions={data.recentMentions}
        lastScanTimeAgo={data.lastScanTimeAgo}
        totalMentionCount={data.totalMentionCount}
        totalResultCount={data.totalResultCount}
      />
      <div className="px-4 lg:px-6">
        <MonthlyReportCard brandId={brandId} plan={plan} />
      </div>
    </>
  );
}
