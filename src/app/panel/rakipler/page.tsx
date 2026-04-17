import { getActiveBrand } from "@/lib/dal/brand";
import { getCompetitorsData } from "@/lib/dal/competitors";
import { EmptyState } from "@/components/panel/empty-state";
import { Building } from "lucide-react";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import { SeninYerineKim } from "@/components/panel/senin-yerine-kim";
import { PageHero } from "@/components/panel/page-hero";

export default async function RakiplerPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;

  if (!brandId) {
    return (
      <EmptyState
        icon={Building}
        title="Marka bulunamadı"
        description="Lütfen ayarlardan marka ekleyin."
      />
    );
  }

  const userName = activeBrand.brand?.name ?? "Siz";

  // Gerçek rakip verisi
  let competitorsData;
  try {
    competitorsData = await getCompetitorsData(brandId);
  } catch (error) {
    console.error("[rakipler] Data fetch error:", error);
    return (
      <EmptyState
        icon={Building}
        title="Veri yüklenirken hata oluştu"
        description="Rakip verileri yüklenirken bir sorun oluştu. Lütfen tekrar deneyin."
      />
    );
  }

  const competitorsList = competitorsData?.rows?.filter((r) => !r.isUser) ?? [];
  const totalCompetitors = competitorsList.length;
  const leadersCount = competitorsList.filter((c) => c.mentionScore > 50).length;
  const laggardsCount = competitorsList.filter((c) => c.mentionScore < 20).length;

  // Empty state: hiç rakip yoksa ve veri yoksa
  const hasData = totalCompetitors > 0 || (competitorsData?.totalResults ?? 0) > 0;

  if (!hasData) {
    return (
      <>
        <PageHero
          title="Senin Yerine Kim"
          description="Ürün bazlı rakip sıralaması ve rekabet analizi"
        />
        <EmptyState
          icon={Building}
          title="Henüz rakip verisi yok"
          description="İlk tarama tamamlandıktan sonra rakip analizi burada görünecek."
        />
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Senin Yerine Kim"
        description="Ürün bazlı rakip sıralaması ve rekabet analizi"
        stats={[
          { label: "Takip Edilen Rakip", value: String(totalCompetitors) },
          {
            label: "Lider Rakipler",
            value: String(leadersCount),
            deltaType: leadersCount > 0 ? "negative" : undefined,
          },
          {
            label: "Geride Kalan Rakipler",
            value: String(laggardsCount),
            deltaType: "positive",
          },
          {
            label: "Sizin Skorunuz",
            value: `${competitorsData?.userMentionScore ?? 0}/100`,
          },
        ]}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SeninYerineKim userName={userName} />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBottomCTA />
      </div>
    </>
  );
}
