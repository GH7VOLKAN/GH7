import { redirect } from "next/navigation";

/**
 * /panel root.
 *
 * Auth kontrolü panel layout'unda yapılır (getAuthState) — bu sayfa sadece
 * /panel/genel'e yönlendirir. Layout zaten session/profile/brand yoksa
 * /giris veya /analiz'e gönderir.
 */
export default async function PanelRootPage() {
  redirect("/panel/genel");
}
