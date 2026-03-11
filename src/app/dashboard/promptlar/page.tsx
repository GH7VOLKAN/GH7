import { PromptStatsCards } from "@/components/promptlar/prompt-stats-cards";
import { PromptTable } from "@/components/promptlar/prompt-table";
import { SuggestedPromptsTable } from "@/components/promptlar/suggested-prompts-table";
import { getActiveBrand } from "@/lib/dal/brand";
import { getPromptsData } from "@/lib/dal/prompts";

export default async function PromptlarPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadı. Lütfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getPromptsData(brandId);

  return (
    <>
      <PromptStatsCards
        promptItems={data.promptItems}
        activeCount={data.activeCount}
        suggestedCount={data.suggestedCount}
      />
      <div className="px-4 lg:px-6">
        <PromptTable promptItems={data.promptItems} brandId={brandId} />
      </div>
      <div className="px-4 lg:px-6">
        <SuggestedPromptsTable suggestedPrompts={data.suggested} brandId={brandId} />
      </div>
    </>
  );
}
