import { RakiplerContent } from "@/components/kinde/rakipler-content";
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

  return (
    <RakiplerContent
      rows={data.rows}
      detail={data.detail}
      userMentionScore={data.userMentionScore}
      userReadinessScore={data.userReadinessScore}
      totalResults={data.totalResults}
      totalMentions={data.totalMentions}
      shareOfVoice={data.shareOfVoice}
      emptyAreaOpportunities={data.emptyAreaOpportunities}
      aiDiscoveredCount={data.aiDiscoveredCount}
      manualCount={data.manualCount}
      userName={userName}
      plan={plan}
      maxVisibleCompetitors={maxVisibleCompetitors}
    />
  );
}
