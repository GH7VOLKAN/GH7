import { Wrench } from "lucide-react";
import { getActiveBrand } from "@/lib/dal/brand";
import {
  getAvailablePackages,
  getUserServiceOrders,
  getLatestAuditScore,
} from "@/lib/dal/service-orders";
import { getLatestAudit } from "@/lib/dal/personal-analysis";
import { EmptyState } from "@/components/panel/empty-state";
import { HizmetlerContentV3 } from "@/components/panel/hizmetler-v3/hizmetler-content-v3";
import type { AuditItemResult } from "@/lib/ai/audit-43";

export default async function HizmetlerPage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand || !activeBrand.profile) return null;

  const brand = activeBrand.brand;
  const userId = activeBrand.profile.id;
  const userType = brand.userType ?? "firma";
  const domain = brand.domain ?? "";

  const [packages, orders, latestAuditScore, latestAudit] = await Promise.all([
    getAvailablePackages(userType),
    getUserServiceOrders(userId),
    getLatestAuditScore(userId),
    getLatestAudit(userId, domain, brand.name).catch(() => null),
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

  const auditItems =
    (latestAudit?.auditItems as unknown as AuditItemResult[] | null) ?? [];
  const failCount = auditItems.filter((it) => it.status === "fail").length;

  return (
    <HizmetlerContentV3
      plan={activeBrand.plan ?? "free"}
      packages={packages}
      orders={orders}
      currentScore={latestAuditScore?.score ?? 0}
      userType={userType}
      failCount={failCount}
      lastUpdate={orders[0]?.createdAt?.toISOString() ?? null}
    />
  );
}
