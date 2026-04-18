import { redirect } from "next/navigation";
import { getActiveBrand } from "@/lib/dal/brand";

/**
 * /panel root gateway.
 *
 * Basit yönlendirme:
 * - Giriş yapmamış → /giris
 * - Giriş yapmış → /panel/genel (brand yoksa empty state gösterilir)
 *
 * Brand yoksa /onboard'a YÖNLENDİRMEZ — /panel/genel kendi empty state'ini
 * gösterir ve kullanıcıyı /analiz'e yönlendirir. Tek giriş noktası /analiz.
 */
export default async function PanelRootPage() {
  const activeBrand = await getActiveBrand();

  if (!activeBrand) {
    redirect("/giris");
  }

  redirect("/panel/genel");
}
