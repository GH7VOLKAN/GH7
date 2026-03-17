import { SorularContent } from "@/components/kinde/sorular-content";
import { getActiveBrand } from "@/lib/dal/brand";
import { getPromptsData } from "@/lib/dal/prompts";

export default async function PromptlarPage() {
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

  const data = await getPromptsData(brandId);

  return (
    <SorularContent
      promptItems={data.promptItems}
      activeCount={data.activeCount}
      plan={plan}
    />
  );
}
