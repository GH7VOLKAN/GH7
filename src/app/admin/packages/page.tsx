import { getAllPackages } from "@/lib/dal/admin-orders";
import { PackagesContent } from "./packages-content";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  const packages = await getAllPackages();

  const serialized = packages.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    userType: p.userType,
    tier: p.tier,
    price: p.price,
    description: p.description,
    deliverables: Array.isArray(p.deliverables) ? (p.deliverables as string[]) : [],
    auditItemsFixed: Array.isArray(p.auditItemsFixed)
      ? (p.auditItemsFixed as string[])
      : [],
    estimatedScoreBoost: p.estimatedScoreBoost,
    deliveryDays: p.deliveryDays,
    isActive: p.isActive,
  }));

  return <PackagesContent packages={serialized} />;
}
