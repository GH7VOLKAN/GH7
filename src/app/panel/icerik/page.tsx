import { checkPageAccess } from "@/lib/check-access";
import IcerikContent from "./icerik-content";

export default async function IcerikPage() {
  await checkPageAccess("business", "/panel/icerik");
  return <IcerikContent />;
}
