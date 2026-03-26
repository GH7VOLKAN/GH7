import { checkPageAccess } from "@/lib/check-access";
import IstihbaratContent from "./istihbarat-content";

export default async function IstihbaratPage() {
  await checkPageAccess("business", "/panel/istihbarat");
  return <IstihbaratContent />;
}
