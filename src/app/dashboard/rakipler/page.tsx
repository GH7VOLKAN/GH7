import { CompetitorStatsCards } from "@/components/rakipler/competitor-stats-cards";
import { CompetitorTable } from "@/components/rakipler/competitor-table";
import { EmptyAreasCard } from "@/components/rakipler/empty-areas-card";
import { GapAnalysisCard } from "@/components/rakipler/gap-analysis-card";
import { ShareOfVoiceCard } from "@/components/rakipler/share-of-voice-card";
import { BlurredSection } from "@/components/ui/blurred-section";
import { getActiveBrand } from "@/lib/dal/brand";
import { getCompetitorsData } from "@/lib/dal/competitors";
import { canAccess } from "@/lib/plans";

export default async function RakiplerPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;
  const plan = activeBrand?.plan ?? "free";

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadi. Lutfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getCompetitorsData(brandId);
  const userName = activeBrand.brand?.name ?? "Siz";
  const competitorLocked = !canAccess(plan, "competitorView");

  return (
    <BlurredSection
      isLocked={competitorLocked}
      title="Rakip Analizi"
      description="Rakiplerinizin yapay zeka gorunurlugunu karsilastirmak icin Pro plana gecin."
    >
      <CompetitorStatsCards
        rows={data.rows}
        userMentionScore={data.userMentionScore}
        userReadinessScore={data.userReadinessScore}
        totalResults={data.totalResults}
        totalMentions={data.totalMentions}
        aiDiscoveredCount={data.aiDiscoveredCount}
        manualCount={data.manualCount}
      />
      <div className="px-4 lg:px-6">
        <ShareOfVoiceCard data={data.shareOfVoice} />
      </div>
      <div className="px-4 lg:px-6">
        <CompetitorTable rows={data.rows} brandId={brandId} />
      </div>
      <div className="px-4 lg:px-6">
        <GapAnalysisCard detail={data.detail} userName={userName} />
      </div>
      <div className="px-4 lg:px-6">
        <EmptyAreasCard opportunities={data.emptyAreaOpportunities} />
      </div>
    </BlurredSection>
  );
}
