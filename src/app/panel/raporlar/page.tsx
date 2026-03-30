import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { FileTextIcon } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import { RaporlarContent } from "./raporlar-content";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import { hasAccess } from "@/lib/subscription";
import { PageHero } from "@/components/panel/page-hero";

export interface ScanReport {
  id: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  promptCount: number;
}

export default async function RaporlarPage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");

  // RBAC: Raporlar requires Pro plan
  if (!hasAccess(activeBrand.plan ?? "free", "pro")) {
    redirect("/panel/upgrade?from=%2Fpanel%2Fraporlar&required=pro");
  }
  const brandId = activeBrand.brand.id;
  const plan = activeBrand.plan ?? "free";
  const profileEmail =
    activeBrand.profile?.email ?? "";
  const emailWeeklyReport =
    (activeBrand.profile as Record<string, unknown>)?.emailWeeklyReport as boolean ?? true;

  // Fetch completed scans as report history
  const scans = await prisma.scan.findMany({
    where: { brandId },
    orderBy: { startedAt: "desc" },
    take: 20,
    include: {
      _count: { select: { results: true } },
    },
  });

  const reports: ScanReport[] = scans.map((s) => ({
    id: s.id,
    status: s.status,
    createdAt: s.startedAt.toISOString(),
    completedAt: s.completedAt?.toISOString() ?? null,
    promptCount: s._count.results,
  }));

  if (reports.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Raporlar</h1>
          <p className="text-sm text-gray-500 mt-1">
            GEO performansınızı PDF olarak indirin veya otomatik olarak alın
          </p>
        </div>
        <EmptyState
          icon={FileTextIcon}
          title="Henüz rapor oluşturulmadı"
          description="İlk raporunuz tarama sonrasında otomatik oluşturulacak."
        />
      </div>
    );
  }

  return (
    <>
      <PageHero
        title="Raporlar"
        description="PDF rapor indirin, haftalık özet ayarlayın"
      />
      <RaporlarContent
        reports={reports}
        plan={plan}
        profileEmail={profileEmail}
        emailWeeklyReport={emailWeeklyReport}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBottomCTA />
      </div>
    </>
  );
}
