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
        Marka bulunamadı. Lütfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getSiteAuditData(brandId);
  const auditLocked = !canAccess(plan, "auditView");

  const pageTitle =
    brandType === "kisisel"
      ? "Dijital Varlık Kontrolü"
      : "Site Kontrolü";
  const pageDescription =
    brandType === "kisisel"
      ? "Dijital varlığınızın yapay zeka hazırlığını kontrol edin."
      : "Sitenizin yapay zekalar tarafından ne kadar iyi anlaşıldığını kontrol edin.";
  const lockDescription =
    brandType === "kisisel"
      ? "Dijital varlık analizinizi görmek için Pro plana geçin."
      : "Sitenizin yapay zeka hazırlık analizini görmek için Pro plana geçin.";

  const hasAuditData = data.auditCategories && data.auditCategories.length > 0;

  return (
    <BlurredSection
      isLocked={auditLocked}
      title={pageTitle}
      description={lockDescription}
    >
      <div className="flex flex-col gap-1 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          <AuditButton brandId={brandId} />
        </div>
        <p className="text-sm text-muted-foreground">{pageDescription}</p>
      </div>

      {hasAuditData ? (
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
          <AuditCategories auditCategories={data.auditCategories} brandId={brandId} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed py-16 mx-4 lg:mx-6">
          <p className="text-center text-muted-foreground">
            Henüz site analizi yapılmadı. Analizi başlatmak için yukarıdaki butona tıklayın.
          </p>
        </div>
      )}
    </BlurredSection>
  );
}
