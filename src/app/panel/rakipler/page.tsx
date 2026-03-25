import { getActiveBrand } from "@/lib/dal/brand";
import { EmptyState } from "@/components/panel/empty-state";
import { Building } from "lucide-react";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import { SeninYerineKim } from "@/components/panel/senin-yerine-kim";

export default async function RakiplerPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;

  if (!brandId) {
    return (
      <EmptyState
        icon={Building}
        title="Marka bulunamadı"
        description="Lütfen ayarlardan marka ekleyin."
      />
    );
  }

  const userName = activeBrand.brand?.name ?? "Siz";

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SeninYerineKim userName={userName} />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBottomCTA />
      </div>
    </>
  );
}
