import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { getActiveBrand } from "@/lib/dal/brand";
import { getPromptDetail, getPromptsData } from "@/lib/dal/prompts";
import { PromptDetailContent } from "@/components/panel/prompt-detail-content";
import { PageHero } from "@/components/panel/page-hero";
import type { HeroStat } from "@/components/panel/page-hero";
import { isPro } from "@/lib/plans";
import { PLAN_PRICES } from "@/lib/iyzico/plans";

const FREE_VISIBLE_QUERY_COUNT = 3;

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { promptId } = await params;
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;
  const brandName = activeBrand?.brand?.name ?? "";
  const plan = activeBrand?.plan ?? "free";

  if (!brandId) redirect("/panel/aramalar");

  // Free plan access check — sadece ilk 3 sorgu
  if (!isPro(plan)) {
    const prompts = await getPromptsData(brandId);
    const visibleIds = prompts.promptItems
      .slice(0, FREE_VISIBLE_QUERY_COUNT)
      .map((p) => p.id);

    if (!visibleIds.includes(promptId)) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
            <Lock className="size-5 text-gray-500" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Bu sorgu Pro ile açılır
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Ücretsiz planda ilk {FREE_VISIBLE_QUERY_COUNT} sorgunun AI tam
            cevabını görebilirsiniz. Pro&apos;ya geçerek tüm sorgulardaki AI
            yanıtlarını, il bazlı filtreyi ve haftalık takibi açın.
          </p>
          <Link
            href="/panel/abonelik"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Pro&apos;ya Geç · ₺{PLAN_PRICES.pro.monthly}/ay
          </Link>
          <div className="mt-6">
            <Link
              href="/panel/aramalar"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Aramalara dön
            </Link>
          </div>
        </div>
      );
    }
  }

  const detail = await getPromptDetail(promptId, brandId);
  if (!detail) notFound();

  const mentionedCount = detail.platformResults.filter((r) => r.mentioned).length;
  const platformCount = detail.platformResults.length;

  const heroStats: HeroStat[] = [
    {
      label: "Platform Sayısı",
      value: String(platformCount),
    },
    {
      label: "Görünürlük",
      value: `${mentionedCount}/${platformCount}`,
    },
    {
      label: "Son Tarama",
      value: detail.lastScanAt
        ? new Date(detail.lastScanAt).toLocaleDateString("tr-TR")
        : "—",
    },
  ];

  return (
    <>
      <PageHero
        title="Sorgu Detayı"
        description={detail.text}
        stats={heroStats}
      />
      <PromptDetailContent detail={detail} brandName={brandName} />
    </>
  );
}
