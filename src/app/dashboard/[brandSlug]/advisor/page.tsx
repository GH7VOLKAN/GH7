/**
 * /dashboard/[brandSlug]/advisor — Firma Advisor dashboard (Brief H-ext Aşama 5).
 *
 * Durumlar:
 * - Scan + rapor yok → Insight'a yönlendir
 * - Scan var, rapor yok → "İlk Raporu Oluştur" CTA (client → /api/advisor/first-report)
 * - Rapor var → Markdown render + yenileme butonu
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { AdvisorView, type AdvisorReportSummary } from "./_components/advisor-view";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandSlug: string }>;

export default async function AdvisorPage({
  params,
}: {
  params: Params;
}) {
  const { brandSlug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/analiz");

  const brand = await prisma.brand.findFirst({
    where: { profileId: user.id, slug: brandSlug },
    select: { id: true, slug: true, name: true },
  });
  if (!brand) redirect("/dashboard");

  const [latestReport, hasScan] = await Promise.all([
    prisma.advisorReport.findFirst({
      where: { brandId: brand.id },
      orderBy: { generatedAt: "desc" },
      select: {
        id: true,
        reportType: true,
        content: true,
        generatedAt: true,
      },
    }),
    prisma.scan
      .count({ where: { brandId: brand.id, status: "completed" } })
      .then((n) => n > 0),
  ]);

  const report: AdvisorReportSummary | null = latestReport
    ? {
        id: latestReport.id,
        reportType: latestReport.reportType,
        content: latestReport.content,
        generatedAt: latestReport.generatedAt,
      }
    : null;

  return (
    <AdvisorView
      brand={{ slug: brand.slug, name: brand.name }}
      hasScan={hasScan}
      latestReport={report}
    />
  );
}
