import { checkPageAccess } from "@/lib/check-access";
import { getActiveBrand } from "@/lib/dal/brand";
import { getCompetitorsData } from "@/lib/dal/competitors";
import { PageHero } from "@/components/panel/page-hero";
import { EmptyState } from "@/components/panel/empty-state";
import IstihbaratContent from "./istihbarat-content";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";

export default async function IstihbaratPage() {
  await checkPageAccess("pro", "/panel/istihbarat");

  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");
  const brandId = activeBrand.brand.id;

  const data = await getCompetitorsData(brandId);
  const competitors = data.rows.filter((r) => !r.isUser);
  const userRow = data.rows.find((r) => r.isUser);
  const threatCount = competitors.filter(
    (r) => r.mentionScore > (userRow?.mentionScore ?? 0)
  ).length;

  if (competitors.length === 0) {
    return (
      <>
        <PageHero
          title="Rakip İstihbaratı"
          description="Rakiplerinizin AI görünürlüğünü takip edin"
          stats={[
            { label: "Rakip", value: "0" },
            { label: "Tehdit", value: "0" },
          ]}
        />
        <EmptyState
          icon={Users}
          title="Henüz rakip verisi yok"
          description="İlk taramanızdan sonra rakipleriniz otomatik keşfedilecek."
        />
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Rakip İstihbaratı"
        description="Rakiplerinizin AI platformlarındaki görünürlüğü"
        stats={[
          { label: "Takip Edilen", value: `${competitors.length} rakip` },
          {
            label: "Tehdit",
            value: String(threatCount),
            deltaType: threatCount > 0 ? "negative" : "positive",
          },
          {
            label: "Fırsat Alanı",
            value: String(data.emptyAreaOpportunities.length),
            deltaType: data.emptyAreaOpportunities.length > 0 ? "positive" : undefined,
          },
          {
            label: "Sizin Skorunuz",
            value: `${data.userMentionScore}/100`,
          },
        ]}
      />
      <IstihbaratContent
        rows={data.rows}
        shareOfVoice={data.shareOfVoice}
        emptyAreaOpportunities={data.emptyAreaOpportunities}
        brandId={brandId}
      />
    </>
  );
}
