import { Wrench } from "lucide-react";
import { getActiveBrand } from "@/lib/dal/brand";
import {
  getAvailablePackages,
  getUserServiceOrders,
  getLatestAuditScore,
} from "@/lib/dal/service-orders";
import { EmptyState } from "@/components/panel/empty-state";
import { HizmetlerContentV3 } from "@/components/panel/hizmetler-v3/hizmetler-content-v3";

export default async function HizmetlerPage() {
  const activeBrand = await getActiveBrand();
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

  return (
    <HizmetlerContentV3
      plan={activeBrand.plan ?? "free"}
      packages={packages}
      orders={orders}
      currentScore={latestAudit?.score ?? 0}
      userType={userType}
      lastUpdate={orders[0]?.createdAt?.toISOString() ?? null}
    />
  );
}
