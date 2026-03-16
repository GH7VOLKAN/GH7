import { getActiveBrand } from "@/lib/dal/brand";
import { getActionsData, getSituationAnalysis } from "@/lib/dal/actions";
import { BlurredSection } from "@/components/ui/blurred-section";
import { AksiyonClient } from "./aksiyon-client";
import { canAccess } from "@/lib/plans";

export default async function AksiyonPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;
  const plan = activeBrand?.plan ?? "free";

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadi. Lutfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const [data, situation] = await Promise.all([
    getActionsData(brandId),
    getSituationAnalysis(brandId),
  ]);

  const actionLocked = !canAccess(plan, "actionPlanView");

  return (
    <BlurredSection
      isLocked={actionLocked}
      title="Aksiyon Plani"
      description="AI gorunurluk aksiyon planlarinizi gormek icin Pro plana gecin."
    >
      <AksiyonClient
        brandId={brandId}
        actionTasks={data.actionTasks}
        completedCount={data.completedCount}
        totalCount={data.totalCount}
        raasEligibleCount={data.raasEligibleCount}
        situation={situation}
      />
    </BlurredSection>
  );
}
