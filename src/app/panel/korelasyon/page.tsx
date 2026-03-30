import { checkPageAccess } from "@/lib/check-access";
import KorelasyonContent from "./korelasyon-content";
import { PageHero } from "@/components/panel/page-hero";

export default async function KorelasyonPage() {
  await checkPageAccess("business", "/panel/korelasyon");
  return (
    <>
      <PageHero
        title="Korelasyon Motoru"
        description="Yaptığınız aksiyonların sonuçları"
        stats={[
          { label: "Doğrulanmış Etki", value: "3" },
          { label: "Ortalama Süre", value: "5 gün" },
          { label: "Güven Düzeyi", value: "Yüksek", deltaType: "positive" },
        ]}
      />
      <KorelasyonContent />
    </>
  );
}
