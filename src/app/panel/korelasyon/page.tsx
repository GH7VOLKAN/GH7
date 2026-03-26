import { checkPageAccess } from "@/lib/check-access";
import KorelasyonContent from "./korelasyon-content";

export default async function KorelasyonPage() {
  await checkPageAccess("business", "/panel/korelasyon");
  return <KorelasyonContent />;
}
