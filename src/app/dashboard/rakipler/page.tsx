import { CompetitorStatsCards } from "@/components/rakipler/competitor-stats-cards";
import { CompetitorTable } from "@/components/rakipler/competitor-table";
import { GapAnalysisCard } from "@/components/rakipler/gap-analysis-card";
import { getActiveBrand } from "@/lib/dal/brand";
import { getCompetitorsData } from "@/lib/dal/competitors";

export default async function RakiplerPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadı. Lütfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getCompetitorsData(brandId);
  const userName = activeBrand.brand?.name ?? "Siz";

  return (
    <>
      <CompetitorStatsCards
        rows={data.rows}
        userMentionScore={data.userMentionScore}
        userReadinessScore={data.userReadinessScore}
      />
      <div className="px-4 lg:px-6">
        <CompetitorTable rows={data.rows} brandId={brandId} />
      </div>
      <div className="px-4 lg:px-6">
        <GapAnalysisCard detail={data.detail} userName={userName} />
      </div>
    </>
  );
}
