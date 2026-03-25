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

export default async function IyilestirmePage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");
  const brandId = activeBrand.brand.id;

  const [checklistData, actionsData, auditData, overviewData] =
    await Promise.all([
      getChecklistData(brandId),
      getActionsData(brandId),
      getSiteAuditData(brandId),
      getOverviewData(brandId),
    ]);

  const hasData =
    checklistData.total > 0 ||
    actionsData.totalCount > 0 ||
    auditData.totalChecks > 0;

  if (!hasData) {
    return (
      <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <EmptyState
          icon={WrenchIcon}
          title="Henuz iyilestirme onerisi yok"
          description="Ilk tarama tamamlandiktan sonra optimizasyon onerileri burada gorunecek."
        />
      </div>
    );
  }

  return (
    <>
      <IyilestirmeContent
        checklistData={checklistData}
        actionsData={actionsData}
        auditData={auditData}
        readinessScore={overviewData.readinessScore}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBottomCTA />
      </div>
    </>
  );
}
