import { WelcomeHero } from "@/components/welcome-hero";
import { GenelBakisContent } from "@/components/kinde/genel-bakis-content";
import { getActiveBrand } from "@/lib/dal/brand";
import { getOverviewData } from "@/lib/dal/overview";
import { getLastScanInfo } from "@/lib/dal/scans";

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
    const scanInfo = await getLastScanInfo(brandId);
    return (
      <WelcomeHero
        brandId={brandId}
        brandName={brandName}
        activePromptCount={data.activePromptCount}
        scanAlreadyRunning={scanInfo.isRunning}
      />
    );
  }

  return (
    <GenelBakisContent
      mentionScore={data.mentionScore}
      mentionTrend={data.mentionTrend}
      totalMentionCount={data.totalMentionCount}
      totalResultCount={data.totalResultCount}
      lastScanTimeAgo={data.lastScanTimeAgo}
      activePromptCount={data.activePromptCount}
      platformStats={data.platformStats}
      competitorRanking={data.competitorRanking}
      priorityActions={data.priorityActions}
      recentMentions={data.recentMentions}
      weeklyTrend={data.weeklyTrend}
      checklistProgress={data.checklistProgress}
      totalScanCount={data.totalScanCount}
      totalSourceCount={data.totalSourceCount}
      plan={plan}
      bestPrompts={data.bestPrompts}
      worstPrompts={data.worstPrompts}
      aiResponseExcerpts={data.aiResponseExcerpts}
      platformQAs={data.platformQAs}
      easiestChecklistItems={data.easiestChecklistItems}
      highImpactChecklistItems={data.highImpactChecklistItems}
      sourceMap={data.sourceMap}
      brandDomain={data.brandDomain}
    />
  );
}
