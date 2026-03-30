import { getActiveBrand } from "@/lib/dal/brand";
import { getPromptsData } from "@/lib/dal/prompts";
import { AramalarContent } from "@/components/panel/aramalar-content";
import { EmptyState } from "@/components/panel/empty-state";
import { Search } from "lucide-react";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import { PageHero } from "@/components/panel/page-hero";
import type { HeroStat } from "@/components/panel/page-hero";

export default async function AramalarPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;

  if (!brandId) {
    return (
      <EmptyState
        icon={Search}
        title="Marka bulunamadı"
        description="Lütfen ayarlardan marka ekleyin."
      />
    );
  }

  const data = await getPromptsData(brandId);

  const heroStats: HeroStat[] = [
    {
      label: "Toplam Sorgu",
      value: String(data.promptItems.length),
    },
    {
      label: "Aktif Sorgu",
      value: String(data.activeCount),
    },
  ];

  return (
    <>
      <PageHero
        title="Aramalar"
        description="Takip ettiğiniz sorguları yönetin ve yeni sorgular keşfedin"
        stats={heroStats}
      />
      <AramalarContent
        promptItems={data.promptItems}
        activeCount={data.activeCount}
        brandId={brandId}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBottomCTA />
      </div>
    </>
  );
}
