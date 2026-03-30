import { checkPageAccess } from "@/lib/check-access";
import AksiyonlarContent from "./aksiyonlar-content";
import { PageHero } from "@/components/panel/page-hero";

export default async function AksiyonlarPage() {
  await checkPageAccess("business", "/panel/aksiyonlar");
  return (
    <>
      <PageHero
        title="Haftalık Aksiyonlar"
        description="Bu hafta yapmanız gereken optimizasyonlar"
      />
      <AksiyonlarContent />
    </>
  );
}
