/**
 * /dashboard — minimal layout.
 *
 * Root layout'a indirgendi (Brief D1). Yeni /dashboard ana sayfası
 * kendi fullscreen layout'unu yönetir. Eski /dashboard/* alt sayfaları
 * (genel, aksiyon, vs.) sidebar kaybeder — Brief C3'te silinecekler.
 *
 * Auth kontrolü sayfa seviyesinde (dashboard/page.tsx) yapılır.
 */
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
