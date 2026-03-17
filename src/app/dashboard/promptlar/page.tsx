import { PromptStatsCards } from "@/components/promptlar/prompt-stats-cards";
import { PromptTable } from "@/components/promptlar/prompt-table";
import { SuggestedPromptsTable } from "@/components/promptlar/suggested-prompts-table";
import { ProUpgradeCard } from "@/components/pro-upgrade-card";
import { getActiveBrand } from "@/lib/dal/brand";
import { getPromptsData } from "@/lib/dal/prompts";
import { getPlanLimits, isPro } from "@/lib/plans";
import Link from "next/link";

export default async function PromptlarPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;
  const plan = activeBrand?.plan ?? "free";
  const limits = getPlanLimits(plan);
  const isProUser = isPro(plan);

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Marka bulunamadi. Lutfen ayarlardan marka ekleyin.
      </div>
    );
  }

  const data = await getPromptsData(brandId);

  return (
    <>
      {/* Plan info banner for free users */}
      {!isProUser && (
        <div className="mx-4 lg:mx-6 rounded-xl border border-border bg-foreground/5 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">
              Ucretsiz plan: {data.activeCount}/{limits.maxPrompts} soru
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daha fazla soru eklemek icin Pro plana gecin.
            </p>
          </div>
          <Link
            href="/dashboard/ayarlar"
            className="shrink-0 rounded-lg bg-foreground px-4 py-2 text-xs font-bold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Pro&apos;ya Gec
          </Link>
        </div>
      )}

      <PromptStatsCards
        promptItems={data.promptItems}
        activeCount={data.activeCount}
        suggestedCount={data.suggestedCount}
        categoryBreakdown={data.categoryBreakdown}
        sourceBreakdown={data.sourceBreakdown}
      />
      <div className="px-4 lg:px-6">
        <PromptTable promptItems={data.promptItems} brandId={brandId} />
      </div>
      {isProUser && (
        <div className="px-4 lg:px-6">
          <SuggestedPromptsTable suggestedPrompts={data.suggested} brandId={brandId} />
        </div>
      )}

      {/* Pro CTA — sayfanın en altında */}
      <ProUpgradeCard type="trend" plan={plan} />
    </>
  );
}
