import { getActiveBrand } from "@/lib/dal/brand";
import { getOverviewData } from "@/lib/dal/overview";
import { getRoiEstimate } from "@/lib/dal/roi";
import { getWeeklyTrendData } from "@/lib/dal/service-orders";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import { GenelContent } from "./genel-content";
import { PageHero } from "@/components/panel/page-hero";
import type { HeroStat } from "@/components/panel/page-hero";

export default async function GenelBakisPage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");
  const brandId = activeBrand.brand.id;

  const userId = activeBrand.profile?.id;
  const domain = activeBrand.brand.domain;

  let overviewData;
  let roiData;
  let weeklyTrendData: Awaited<ReturnType<typeof getWeeklyTrendData>> = [];
  try {
    [overviewData, roiData, weeklyTrendData] = await Promise.all([
      getOverviewData(brandId),
      getRoiEstimate(brandId),
      userId && domain ? getWeeklyTrendData(userId, domain) : Promise.resolve([]),
    ]);
  } catch (error) {
    console.error("[genel] Data fetch error:", error);
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="Veri yüklenirken hata oluştu"
        description="Genel bakış verileri yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
      />
    );
  }

  const mentionScore = overviewData?.mentionScore ?? 0;
  const mentionTrend = overviewData?.mentionTrend ?? 0;
  const totalMentionCount = overviewData?.totalMentionCount ?? 0;
  const totalResultCount = overviewData?.totalResultCount ?? 0;
  const platformStats = overviewData?.platformStats ?? [];
  const competitorRanking = overviewData?.competitorRanking ?? [];
  const recentMentions = overviewData?.recentMentions ?? [];
  const weeklyTrend = overviewData?.weeklyTrend ?? [];
  const scoreHistory = overviewData?.scoreHistory ?? [];
  const bestPrompts = overviewData?.bestPrompts ?? [];
  const worstPrompts = overviewData?.worstPrompts ?? [];
  const sourceMap = overviewData?.sourceMap ?? [];
  const brandDomain = overviewData?.brandDomain ?? "";
  const aiResponseExcerpts = overviewData?.aiResponseExcerpts ?? [];
  const priorityActions = overviewData?.priorityActions ?? [];
  const checklistProgress = overviewData?.checklistProgress ?? { total: 0, completed: 0 };
  const totalScanCount = overviewData?.totalScanCount ?? 0;

  const hasData = platformStats.length > 0 || totalResultCount > 0 || totalScanCount > 0;

  if (!hasData) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="Henüz veri yok"
        description="İlk tarama tamamlandıktan sonra genel bakış burada görünecek. Tarama başlatmak için Aramalar sayfasını ziyaret edin."
      />
    );
  }

  const heroStats: HeroStat[] = [
    {
      label: "GEO Skoru",
      value: `${mentionScore}`,
      delta: mentionTrend !== 0 ? `${mentionTrend > 0 ? "+" : ""}${mentionTrend}` : undefined,
    },
    {
      label: "Bahsedilme",
      value: `${totalMentionCount}/${totalResultCount}`,
    },
    {
      label: "Toplam Tarama",
      value: `${totalScanCount}`,
    },
  ];

  return (
    <>
      <PageHero
        title="Genel Bakış"
        description="AI platformlarında markanızın görünürlük özeti"
        stats={heroStats}
      />
      <GenelContent
        mentionScore={mentionScore}
        mentionTrend={mentionTrend}
        totalMentionCount={totalMentionCount}
        totalResultCount={totalResultCount}
        platformStats={platformStats}
        competitorRanking={competitorRanking}
        recentMentions={recentMentions}
        weeklyTrend={weeklyTrend}
        scoreHistory={scoreHistory}
        bestPrompts={bestPrompts}
        worstPrompts={worstPrompts}
        sourceMap={sourceMap}
        brandDomain={brandDomain}
        aiResponseExcerpts={aiResponseExcerpts}
        priorityActions={priorityActions}
        checklistProgress={checklistProgress}
        roiEstimate={roiData ?? undefined}
        auditTrendData={weeklyTrendData}
      />
    </>
  );
}
