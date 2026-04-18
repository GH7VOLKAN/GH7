import { redirect } from "next/navigation";

/**
 * Legacy /panel/rakipler route.
 *
 * Bu sayfa eskiden mock/demo verilerle dolu "senin-yerine-kim" bileşenini
 * gösteriyordu (ISITMAX hardcoded demo). Yeni unified dashboard'da (PR #78)
 * bu işlev /panel/aramalar altında gerçek veri ile yeniden tasarlandı.
 *
 * Bu route bookmark'lanmış eski bağlantıları kırmamak için korundu — yeni
 * kanonik sayfaya 301 redirect yapar.
 */
export default function RakiplerLegacyPage(): never {
  redirect("/panel/aramalar");
}
