import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { RecentMentionsTable } from "@/components/recent-mentions-table";
import { getActiveBrand } from "@/lib/dal/brand";
import { getOverviewData } from "@/lib/dal/overview";

export default async function GenelPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadı. Lütfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getOverviewData(brandId);

  const chartData = data.scoreHistory.map((h) => ({
    date: h.date,
    bahsedilme: h.mentionScore,
    hazirlik: h.readinessScore,
  }));

  return (
    <>
      <SectionCards
        mentionScore={data.mentionScore}
        mentionTrend={data.mentionTrend}
        readinessScore={data.readinessScore}
        readinessTrend={data.readinessTrend}
        activePromptCount={data.activePromptCount}
        totalSourceCount={data.totalSourceCount}
      />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive scoreHistory={chartData} />
      </div>
      <RecentMentionsTable recentMentions={data.recentMentions} />
    </>
  );
}
