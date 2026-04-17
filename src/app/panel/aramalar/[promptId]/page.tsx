import { notFound, redirect } from "next/navigation";
import { getActiveBrand } from "@/lib/dal/brand";
import { getPromptDetail } from "@/lib/dal/prompts";
import { PromptDetailContent } from "@/components/panel/prompt-detail-content";
import { PageHero } from "@/components/panel/page-hero";
import type { HeroStat } from "@/components/panel/page-hero";

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { promptId } = await params;
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;
  const brandName = activeBrand?.brand?.name ?? "";

  if (!brandId) redirect("/panel/aramalar");

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
