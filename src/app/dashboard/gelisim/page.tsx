import { getActiveBrand } from "@/lib/dal/brand";
import { getChecklistData } from "@/lib/dal/checklist";
import { GelisimClient } from "./gelisim-client";

export default async function GelisimPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;
  const plan = activeBrand?.plan ?? "free";

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadı. Lütfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getChecklistData(brandId);

  return (
    <GelisimClient
      brandId={brandId}
      plan={plan}
      data={data}
    />
  );
}
