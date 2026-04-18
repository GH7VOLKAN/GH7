import { getActiveBrand } from "@/lib/dal/brand";
import { getPromptsData } from "@/lib/dal/prompts";
import { AramalarContent } from "@/components/panel/aramalar-content";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import { PageHero } from "@/components/panel/page-hero";
import type { HeroStat } from "@/components/panel/page-hero";
import { redirect } from "next/navigation";

export default async function AramalarPage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand) redirect("/giris");
  if (!activeBrand.brand) redirect("/analiz");

  const brandId = activeBrand.brand.id;
  const plan = activeBrand.plan ?? "free";
  const serviceRegions =
    (activeBrand.brand as { serviceRegions?: string[] } | undefined)
      ?.serviceRegions ?? [];

  const data = await getPromptsData(brandId);

  // Calculate hero stats — "50 sorguda X kez sen, Y kez rakip"
  const totalQueries = data.promptItems.length;
  let totalYou = 0;
  let totalCompetitor = 0;
  for (const p of data.promptItems) {
    const anyMention = Object.values(p.modelResults).some((m) => m);
    if (anyMention) totalYou++;
    else if (p.topCompetitor && p.topCompetitor !== "—") totalCompetitor++;
  }

  const heroStats: HeroStat[] = [
    {
      label: "Toplam Sorgu",
      value: String(totalQueries),
    },
    {
      label: "Siz Önerildiniz",
      value: String(totalYou),
    },
    {
      label: "Rakip Önerildi",
      value: String(totalCompetitor),
    },
  ];

  return (
    <>
      <PageHero
        title="Senin Yerine Kim?"
        description="Hangi sorgularda AI seni öneriyor, hangilerinde rakibini?"
        stats={heroStats}
      />
      <AramalarContent
        promptItems={data.promptItems}
        activeCount={data.activeCount}
        brandId={brandId}
        plan={plan}
        serviceRegions={serviceRegions}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBottomCTA />
      </div>
    </>
  );
}
