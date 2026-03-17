import { CompetitorStatsCards } from "@/components/rakipler/competitor-stats-cards";
import { CompetitorTable } from "@/components/rakipler/competitor-table";
import { EmptyAreasCard } from "@/components/rakipler/empty-areas-card";
import { GapAnalysisCard } from "@/components/rakipler/gap-analysis-card";
import { ShareOfVoiceCard } from "@/components/rakipler/share-of-voice-card";
import { ProUpgradeCard } from "@/components/pro-upgrade-card";
import { getActiveBrand } from "@/lib/dal/brand";
import { getCompetitorsData } from "@/lib/dal/competitors";
import { getPlanLimits } from "@/lib/plans";

export default async function RakiplerPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;
  const plan = activeBrand?.plan ?? "free";
  const planLimits = getPlanLimits(plan);

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadı. Lütfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getCompetitorsData(brandId);
  const userName = activeBrand.brand?.name ?? "Siz";

  // Free plan: max 1 competitor visible, rest blurred
  const maxVisibleCompetitors = plan === "free" ? 1 : planLimits.maxCompetitors;
  const canDiscover = plan !== "free";
  const canAddManual = plan !== "free";

  return (
    <div className="flex flex-col gap-4 py-4">
      <CompetitorStatsCards
        rows={data.rows}
        userMentionScore={data.userMentionScore}
        userReadinessScore={data.userReadinessScore}
        totalResults={data.totalResults}
        totalMentions={data.totalMentions}
        aiDiscoveredCount={data.aiDiscoveredCount}
        manualCount={data.manualCount}
        userName={userName}
      />
      <div className="px-4 lg:px-6">
        <ShareOfVoiceCard data={data.shareOfVoice} />
      </div>
      <div className="px-4 lg:px-6">
        <CompetitorTable
          rows={data.rows}
          brandId={brandId}
          canDiscover={canDiscover}
          canAddManual={canAddManual}
          maxVisibleCompetitors={maxVisibleCompetitors}
          plan={plan}
        />
      </div>
      <div className="px-4 lg:px-6">
        <GapAnalysisCard
          detail={data.detail}
          userName={userName}
          plan={plan}
        />
      </div>
      <div className="px-4 lg:px-6">
        <EmptyAreasCard opportunities={data.emptyAreaOpportunities} />
      </div>

      {/* Pro CTA — sayfanın en altında */}
      <ProUpgradeCard type="competitor" plan={plan} />
    </div>
  );
}
