import { getActiveBrand } from "@/lib/dal/brand";
import { getChecklistData } from "@/lib/dal/checklist";
import { getActionsData } from "@/lib/dal/actions";
import { getSiteAuditData } from "@/lib/dal/site-audit";
import { getOverviewData } from "@/lib/dal/overview";
import { redirect } from "next/navigation";
import { WrenchIcon } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import { IyilestirmeContent } from "./iyilestirme-content";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import { PageHero } from "@/components/panel/page-hero";
import type { HeroStat } from "@/components/panel/page-hero";

export default async function IyilestirmePage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");
  const brandId = activeBrand.brand.id;

  let checklistData, actionsData, auditData, overviewData;
  try {
    [checklistData, actionsData, auditData, overviewData] = await Promise.all([
      getChecklistData(brandId),
      getActionsData(brandId),
      getSiteAuditData(brandId),
      getOverviewData(brandId),
    ]);
  } catch (error) {
    console.error("[iyilestirme] Data fetch error:", error);
    return (
      <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <EmptyState
          icon={WrenchIcon}
          title="Veri yüklenirken hata oluştu"
          description="İyileştirme verileri yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
        />
      </div>
    );
  }

  const completedCount = checklistData?.completed ?? 0;
  const totalCount = checklistData?.total ?? 0;
  const totalActionsCount = actionsData?.totalCount ?? 0;
  const totalScore = auditData?.totalScore ?? 0;
  const totalChecks = auditData?.totalChecks ?? 0;
  const readinessScore = overviewData?.readinessScore ?? 0;

  const hasData =
    totalCount > 0 ||
    totalActionsCount > 0 ||
    totalChecks > 0;

  if (!hasData) {
    return (
      <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <EmptyState
          icon={WrenchIcon}
          title="Henüz iyileştirme önerisi yok"
          description="İlk tarama tamamlandıktan sonra optimizasyon önerileri burada görünecek."
        />
      </div>
    );
  }

  const heroStats: HeroStat[] = [
    {
      label: "Tamamlanan",
      value: `${completedCount}/${totalCount}`,
    },
    {
      label: "Site Skoru",
      value: `${totalScore}/100`,
    },
    {
      label: "Hazır Olma Skoru",
      value: `%${readinessScore}`,
    },
    {
      label: "Aksiyon Sayısı",
      value: String(totalActionsCount),
    },
  ];

  return (
    <>
      <PageHero
        title="İyileştirme"
        description="Site sağlığı, içerik kalitesi ve teknik optimizasyon önerileri"
        stats={heroStats}
      />
      <IyilestirmeContent
        checklistData={checklistData}
        actionsData={actionsData}
        auditData={auditData}
        readinessScore={readinessScore}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBottomCTA />
      </div>
    </>
  );
}
