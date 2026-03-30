import { getActiveBrand } from "@/lib/dal/brand";
import { getOverviewData } from "@/lib/dal/overview";
import { redirect } from "next/navigation";
import { EyeIcon } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import { GorunurlukContent } from "./gorunurluk-content";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import { PageHero } from "@/components/panel/page-hero";
import type { HeroStat } from "@/components/panel/page-hero";

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

  const heroStats: HeroStat[] = [
    {
      label: "Platform Sayısı",
      value: String(overviewData.platformStats.length),
    },
    {
      label: "Toplam Tarama",
      value: String(overviewData.totalResultCount),
    },
    {
      label: "Bahsedilme",
      value: String(overviewData.totalMentionCount),
    },
    {
      label: "Bahsedilme Skoru",
      value: `%${overviewData.mentionScore}`,
      delta: overviewData.mentionTrend > 0 ? `+${overviewData.mentionTrend}` : overviewData.mentionTrend < 0 ? String(overviewData.mentionTrend) : undefined,
      deltaType: overviewData.mentionTrend > 0 ? "positive" : overviewData.mentionTrend < 0 ? "negative" : "neutral",
    },
  ];

  return (
    <>
      <PageHero
        title="Görünürlük"
        description="Platform ve sorgu bazlı detaylı görünürlük analizi"
        stats={heroStats}
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
