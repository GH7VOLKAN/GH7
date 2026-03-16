import { SiteScoreCards } from "@/components/site/site-score-card";
import { AuditCategories } from "@/components/site/audit-categories";
import { AuditButton } from "@/components/site/audit-button";
import { BlurredSection } from "@/components/ui/blurred-section";
import { getActiveBrand } from "@/lib/dal/brand";
import { getSiteAuditData } from "@/lib/dal/site-audit";
import { canAccess } from "@/lib/plans";

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
  const auditLocked = !canAccess(plan, "auditView");

  const pageTitle = brandType === "kisisel" ? "Dijital Varlık Analizi" : "Site Analizi";
  const lockDescription = brandType === "kisisel"
    ? "Dijital varlık analizinizi görmek için Pro plana geçin."
    : "Sitenizin AI hazirlik analizini gormek icin Pro plana gecin.";

  return (
    <BlurredSection
      isLocked={auditLocked}
      title={pageTitle}
      description={lockDescription}
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
        <AuditButton brandId={brandId} />
      </div>
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
      <AuditCategories auditCategories={data.auditCategories} brandId={brandId} />
    </BlurredSection>
  );
}
