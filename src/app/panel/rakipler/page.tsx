import { getActiveBrand } from "@/lib/dal/brand";
import { getCompetitorsData } from "@/lib/dal/competitors";
import { RakiplerContent } from "@/components/panel/rakipler-content";
import { EmptyState } from "@/components/panel/empty-state";
import { Building } from "lucide-react";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";

export default async function RakiplerPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;

  if (!brandId) {
    return (
      <EmptyState
        icon={Building}
        title="Marka bulunamadi"
        description="Lutfen ayarlardan marka ekleyin."
      />
    );
  }

  const data = await getCompetitorsData(brandId);
  const userName = activeBrand.brand?.name ?? "Siz";

  return (
    <>
      <RakiplerContent
        rows={data.rows}
        detail={data.detail}
        shareOfVoice={data.shareOfVoice}
        emptyAreaOpportunities={data.emptyAreaOpportunities}
        userName={userName}
        brandId={brandId}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBottomCTA />
      </div>
    </>
  );
}
