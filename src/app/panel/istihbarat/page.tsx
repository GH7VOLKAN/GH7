import { checkPageAccess } from "@/lib/check-access";
import IstihbaratContent from "./istihbarat-content";
import { PageHero } from "@/components/panel/page-hero";

export default async function IstihbaratPage() {
  await checkPageAccess("pro", "/panel/istihbarat");
  return (
    <>
      <PageHero
        title="Rakip İstihbarat"
        description="Rakiplerinizin bu haftaki hareketleri"
        stats={[
          { label: "Takip Edilen", value: "3 rakip" },
          { label: "Kritik Hareket", value: "1", deltaType: "negative" },
          { label: "Uyarı", value: "1", deltaType: "neutral" },
          { label: "Stabil", value: "1", deltaType: "positive" },
        ]}
      />
      <IstihbaratContent />
    </>
  );
}
