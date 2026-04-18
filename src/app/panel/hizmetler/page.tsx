import { getActiveBrand } from "@/lib/dal/brand";
import {
  getAvailablePackages,
  getUserServiceOrders,
  getLatestAuditScore,
} from "@/lib/dal/service-orders";
import { redirect } from "next/navigation";
import { Wrench } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import { HizmetlerContent } from "./hizmetler-content";
import { PageHero } from "@/components/panel/page-hero";

export default async function HizmetlerPage() {
  const activeBrand = await getActiveBrand();
  // Guard: panel/layout.tsx halleder.
  if (!activeBrand?.brand || !activeBrand.profile) return null;

  const brand = activeBrand.brand;
  const userId = activeBrand.profile.id;
  const userType = brand.userType ?? "firma";

  const [packages, orders, latestAudit] = await Promise.all([
    getAvailablePackages(userType),
    getUserServiceOrders(userId),
    getLatestAuditScore(userId),
  ]);

  if (packages.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="Paket bulunamadı"
        description="Kullanıcı tipinize uygun hizmet paketi henüz tanımlanmamış."
      />
    );
  }

  const activeOrderCount = orders.filter(
    (o) => !["refunded", "approved_final", "cancelled"].includes(o.status)
  ).length;

  return (
    <>
      <PageHero
        title="Hizmet Paketleri"
        description="Kırmızıları biz yeşile çevirelim — önce gör, sonra öde"
        stats={[
          { label: "Mevcut Skorunuz", value: `${latestAudit?.score ?? 0}/100` },
          { label: "Aktif Sipariş", value: String(activeOrderCount) },
          { label: "Toplam Sipariş", value: String(orders.length) },
          {
            label: "Paket Sayısı",
            value: String(packages.length),
          },
        ]}
      />
      <HizmetlerContent
        packages={packages}
        orders={orders}
        userType={userType}
        currentScore={latestAudit?.score ?? 0}
        auditId={latestAudit?.auditId}
        plan={activeBrand.plan ?? "free"}
      />
    </>
  );
}
