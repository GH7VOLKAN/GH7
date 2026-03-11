import { SourceStatsCards } from "@/components/kaynaklar/source-stats-cards";
import { SourceTable } from "@/components/kaynaklar/source-table";
import { getActiveBrand } from "@/lib/dal/brand";
import { getSourcesData } from "@/lib/dal/sources";

export default async function KaynaklarPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadı. Lütfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getSourcesData(brandId);

  return (
    <>
      <SourceStatsCards sourceDomains={data.sourceDomains} />
      <div className="px-4 lg:px-6">
        <SourceTable sourceDomains={data.sourceDomains} />
      </div>
    </>
  );
}
