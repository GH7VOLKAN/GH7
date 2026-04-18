import { redirect } from "next/navigation";
import { getActiveBrand } from "@/lib/dal/brand";

/**
 * /panel root gateway.
 *
 * Kullanıcı durumuna göre yönlendirir:
 * - Giriş yapmamış → /giris
 * - Giriş yaptı, brand yok → /onboard
 * - Giriş yaptı, brand var → /panel/genel
 *
 * Bu davranış sonsuz redirect loop'u engeller. Eskiden `/panel → /panel/genel`
 * sabit redirect yapıyordu; brand yoksa `/panel/genel` tekrar `/panel`'e
 * yönlendirerek loop oluşturuyordu.
 */
export default async function PanelRootPage() {
  const activeBrand = await getActiveBrand();

  if (!activeBrand) {
    // Supabase user yok (giriş yapılmamış)
    redirect("/giris");
  }

  if (!activeBrand.brand) {
    // Giriş yapmış ama henüz brand/analiz yok
    redirect("/onboard");
  }

  redirect("/panel/genel");
}
