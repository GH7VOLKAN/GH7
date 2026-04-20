import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { AdminPanelContent } from "./admin-panel-content";

export const dynamic = "force-dynamic";

export default async function AdminRootPage() {
  // layout.tsx zaten guard yapıyor — buraya admin geliyor.

  const [
    profiles,
    totalBrands,
    totalAudits,
    totalScans,
    proProfiles,
    recentScans,
  ] = await Promise.all([
    prisma.profile.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        plan: true,
        freeAuditUsed: true,
        createdAt: true,
        brands: {
          select: { id: true, name: true, domain: true, isDefault: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.brand.count(),
    prisma.geoAudit.count(),
    prisma.scan.count(),
    prisma.profile.count({ where: { plan: { not: "free" } } }),
    prisma.scan.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
      include: {
        brand: { select: { name: true, domain: true } },
        _count: { select: { results: true } },
      },
    }),
  ]);

  const users = profiles.map((p) => ({
    id: p.id,
    email: p.email,
    phone: p.phone,
    fullName: p.fullName,
    plan: p.plan ?? "free",
    freeAuditUsed: p.freeAuditUsed,
    createdAt: p.createdAt.toISOString(),
    isAdmin: isAdmin({ email: p.email, phone: p.phone }),
    brands: p.brands,
  }));

  const scans = recentScans.map((s) => ({
    id: s.id,
    status: s.status,
    type: s.type,
    startedAt: s.startedAt.toISOString(),
    completedAt: s.completedAt?.toISOString() ?? null,
    resultCount: s._count.results,
    brandName: s.brand?.name ?? "?",
    brandDomain: s.brand?.domain ?? "",
  }));

  return (
    <AdminPanelContent
      stats={{
        totalUsers: profiles.length,
        totalBrands,
        totalAudits,
        totalScans,
        proUsers: proProfiles,
      }}
      users={users}
      recentScans={scans}
    />
  );
}
