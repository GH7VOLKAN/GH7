import { checkPageAccess } from "@/lib/check-access";
import IstihbaratContent from "./istihbarat-content";
import { PageHero } from "@/components/panel/page-hero";

export default async function IstihbaratPage() {
  await checkPageAccess("business", "/panel/istihbarat");
  return (
    <>
      <PageHero
        title="Rakip İstihbarat"
        description="Rakiplerinizin bu haftaki hareketleri"
      />
      <IstihbaratContent />
    </>
  );
}
