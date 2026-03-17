import { getActiveBrand } from "@/lib/dal/brand";
import { getSiteAuditData } from "@/lib/dal/site-audit";
import { SiteContent } from "@/components/kinde/site-content";

export default async function SitePage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;
  const plan = activeBrand?.plan ?? "free";
  const brandType = (activeBrand?.brand?.type as "firma" | "kisisel") ?? "firma";

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadi. Lutfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getSiteAuditData(brandId);

  return (
    <SiteContent
      brandId={brandId}
      brandType={brandType}
      plan={plan}
      auditCategories={data.auditCategories}
      totalScore={data.totalScore}
      targetScore={data.targetScore}
      passCount={data.passCount}
      failCount={data.failCount}
      partialCount={data.partialCount}
      totalChecks={data.totalChecks}
      raasEligibleCount={data.raasEligibleCount}
    />
  );
}
