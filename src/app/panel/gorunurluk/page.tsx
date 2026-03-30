import { getActiveBrand } from "@/lib/dal/brand";
import { getOverviewData } from "@/lib/dal/overview";
import { redirect } from "next/navigation";
import { EyeIcon } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import { GorunurlukContent } from "./gorunurluk-content";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import { PageHero } from "@/components/panel/page-hero";

export default async function GorunurlukPage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");
  const brandId = activeBrand.brand.id;

  const overviewData = await getOverviewData(brandId);

  const hasData =
    overviewData.platformStats.length > 0 || overviewData.totalResultCount > 0;

  if (!hasData) {
    return (
      <EmptyState
        icon={EyeIcon}
        title="Henüz görünürlük verisi yok"
        description="İlk tarama tamamlandıktan sonra platform görünürlük analizi burada görünecek."
      />
    );
  }

  return (
    <>
      <PageHero
        title="Görünürlük"
        description="Platform ve sorgu bazlı detaylı görünürlük analizi"
      />
      <GorunurlukContent
        mentionScore={overviewData.mentionScore}
        mentionTrend={overviewData.mentionTrend}
        activePromptCount={overviewData.activePromptCount}
        totalMentionCount={overviewData.totalMentionCount}
        totalResultCount={overviewData.totalResultCount}
        platformStats={overviewData.platformStats}
        weeklyTrend={overviewData.weeklyTrend}
        bestPrompts={overviewData.bestPrompts}
        worstPrompts={overviewData.worstPrompts}
        recentMentions={overviewData.recentMentions}
        competitorRanking={overviewData.competitorRanking}
        scoreHistory={overviewData.scoreHistory}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBottomCTA />
      </div>
    </>
  );
}
