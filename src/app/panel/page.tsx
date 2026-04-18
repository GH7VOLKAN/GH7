import { redirect } from "next/navigation";
import { getActiveBrand } from "@/lib/dal/brand";

/**
 * /panel root gateway.
 *
 * Kurallar:
 * - Giriş yapmamış → /giris
 * - Giriş yapmış, brand YOK → /analiz (kayıt tamamlanmamış, analiz yapmalı)
 * - Giriş yapmış, brand var → /panel/genel
 *
 * Tek giriş noktası /analiz — panel sadece analizli kullanıcıyı gösterir.
 */
export default async function PanelRootPage() {
  const activeBrand = await getActiveBrand();

  if (!activeBrand) {
    redirect("/giris");
  }

  if (!activeBrand.brand) {
    redirect("/analiz");
  }

  redirect("/panel/genel");
}
