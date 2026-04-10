import { checkPageAccess } from "@/lib/check-access";
import { getActiveBrand } from "@/lib/dal/brand";
import { getCorrelationData } from "@/lib/dal/correlation";
import { PageHero } from "@/components/panel/page-hero";
import { EmptyState } from "@/components/panel/empty-state";
import KorelasyonContent from "./korelasyon-content";
import { redirect } from "next/navigation";
import { GitBranch } from "lucide-react";

export default async function KorelasyonPage() {
  await checkPageAccess("pro", "/panel/korelasyon");

  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");
  const brandId = activeBrand.brand.id;

  const data = await getCorrelationData(brandId);

  if (data.totalCompletedActions === 0 && data.totalScoreEntries < 2) {
    return (
      <>
        <PageHero
          title="Korelasyon Motoru"
          description="Aksiyon-sonuç ilişkisi analizi"
          stats={[
            { label: "Doğrulanmış Etki", value: "0" },
            { label: "Veri", value: "Yetersiz" },
          ]}
        />
        <EmptyState
          icon={GitBranch}
          title="Korelasyon analizi için yeterli veri yok"
          description="En az 1 tamamlanan aksiyon ve 2 tarama gerekli. Aksiyonları tamamlayın, düzenli tarama yapın."
        />
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Korelasyon Motoru"
        description="Yaptığınız aksiyonların GEO skoruna etkisi"
        stats={[
          {
            label: "Doğrulanmış Etki",
            value: String(data.verifiedImpacts),
            deltaType: data.verifiedImpacts > 0 ? "positive" : undefined,
          },
          {
            label: "Ortalama Süre",
            value: data.avgResponseDays > 0 ? `${data.avgResponseDays} gün` : "—",
          },
          {
            label: "Güven Düzeyi",
            value: data.overallConfidence,
            deltaType: data.overallConfidence === "Yüksek" ? "positive" : data.overallConfidence === "Orta" ? "neutral" : undefined,
          },
          {
            label: "Tamamlanan Aksiyon",
            value: String(data.totalCompletedActions),
          },
        ]}
      />
      <KorelasyonContent
        correlations={data.correlations}
        chartData={data.chartData}
        actionMarkers={data.actionMarkers}
        verifiedImpacts={data.verifiedImpacts}
        avgResponseDays={data.avgResponseDays}
        overallConfidence={data.overallConfidence}
      />
    </>
  );
}
