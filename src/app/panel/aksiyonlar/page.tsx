import { checkPageAccess } from "@/lib/check-access";
import AksiyonlarContent from "./aksiyonlar-content";

export default async function AksiyonlarPage() {
  await checkPageAccess("business", "/panel/aksiyonlar");
  return <AksiyonlarContent />;
}
