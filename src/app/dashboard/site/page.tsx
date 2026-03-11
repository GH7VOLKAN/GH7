import { SiteScoreCards } from "@/components/site/site-score-card";
import { AuditCategories } from "@/components/site/audit-categories";
import { getActiveBrand } from "@/lib/dal/brand";
import { getSiteAuditData } from "@/lib/dal/site-audit";

export default async function SitePage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadı. Lütfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getSiteAuditData(brandId);

  return (
    <>
      <SiteScoreCards
        totalScore={data.totalScore}
        targetScore={data.targetScore}
        passCount={data.passCount}
        failCount={data.failCount}
        partialCount={data.partialCount}
        totalChecks={data.totalChecks}
        raasEligibleCount={data.raasEligibleCount}
        categoryCount={data.auditCategories.length}
      />
      <AuditCategories auditCategories={data.auditCategories} />
    </>
  );
}
