import { checkPageAccess } from "@/lib/check-access";
import AksiyonlarContent from "./aksiyonlar-content";
import { PageHero } from "@/components/panel/page-hero";

export default async function AksiyonlarPage() {
  await checkPageAccess("pro", "/panel/aksiyonlar");
  return (
    <>
      <PageHero
        title="Haftalık Aksiyonlar"
        description="Bu hafta yapmanız gereken optimizasyonlar"
        stats={[
          { label: "Bu Hafta", value: "5 aksiyon" },
          { label: "Tamamlanan", value: "2/5" },
          { label: "Tahmini Süre", value: "~3 saat" },
        ]}
      />
      <AksiyonlarContent />
    </>
  );
}
