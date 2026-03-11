import { getActiveBrand } from "@/lib/dal/brand";
import { getActionsData } from "@/lib/dal/actions";
import { AksiyonClient } from "./aksiyon-client";

export default async function AksiyonPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadı. Lütfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getActionsData(brandId);

  return (
    <AksiyonClient
      brandId={brandId}
      actionTasks={data.actionTasks}
      completedCount={data.completedCount}
      totalCount={data.totalCount}
      raasEligibleCount={data.raasEligibleCount}
    />
  );
}
