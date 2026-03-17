import { KaynaklarContent } from "@/components/kinde/kaynaklar-content";
import { getActiveBrand } from "@/lib/dal/brand";
import { getSourcesData } from "@/lib/dal/sources";

export default async function KaynaklarPage() {
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

  const data = await getSourcesData(brandId);

  return (
    <KaynaklarContent
      sourceDomains={data.sourceDomains}
      totalSources={data.totalSources}
      actionableSources={data.actionableSources}
      avgCitations={data.avgCitations}
      topSource={data.topSource}
      plan={plan}
    />
  );
}
