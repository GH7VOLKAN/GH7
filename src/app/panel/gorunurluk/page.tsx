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

  let overviewData;
  try {
    overviewData = await getOverviewData(brandId);
  } catch (error) {
    console.error("[gorunurluk] Data fetch error:", error);
    return (
      <EmptyState
        icon={EyeIcon}
        title="Veri yüklenirken hata oluştu"
        description="Görünürlük verileri yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
      />
    );
  }

  const platformStats = overviewData?.platformStats ?? [];
  const totalResultCount = overviewData?.totalResultCount ?? 0;
  const totalMentionCount = overviewData?.totalMentionCount ?? 0;
  const mentionScore = overviewData?.mentionScore ?? 0;
  const mentionTrend = overviewData?.mentionTrend ?? 0;
  const activePromptCount = overviewData?.activePromptCount ?? 0;
  const weeklyTrend = overviewData?.weeklyTrend ?? [];
  const bestPrompts = overviewData?.bestPrompts ?? [];
  const worstPrompts = overviewData?.worstPrompts ?? [];
  const recentMentions = overviewData?.recentMentions ?? [];
  const competitorRanking = overviewData?.competitorRanking ?? [];
  const scoreHistory = overviewData?.scoreHistory ?? [];

  const hasData = platformStats.length > 0 || totalResultCount > 0;

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
      value: String(platformStats.length),
    },
    {
      label: "Toplam Tarama",
      value: String(totalResultCount),
    },
    {
      label: "Bahsedilme",
      value: String(totalMentionCount),
    },
    {
      label: "Bahsedilme Skoru",
      value: `%${mentionScore}`,
      delta: mentionTrend > 0 ? `+${mentionTrend}` : mentionTrend < 0 ? String(mentionTrend) : undefined,
      deltaType: mentionTrend > 0 ? "positive" : mentionTrend < 0 ? "negative" : "neutral",
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
        mentionScore={mentionScore}
        mentionTrend={mentionTrend}
        activePromptCount={activePromptCount}
        totalMentionCount={totalMentionCount}
        totalResultCount={totalResultCount}
        platformStats={platformStats}
        weeklyTrend={weeklyTrend}
        bestPrompts={bestPrompts}
        worstPrompts={worstPrompts}
        recentMentions={recentMentions}
        competitorRanking={competitorRanking}
        scoreHistory={scoreHistory}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBottomCTA />
      </div>
    </>
  );
}
