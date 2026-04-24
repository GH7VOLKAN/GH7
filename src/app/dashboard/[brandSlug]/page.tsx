/**
 * /dashboard/[brandSlug] — Brand-spesifik ana sayfa
 * (Brief H-ext Aşama 1 + Brief H-polish Aşama 1).
 *
 * 6 araç kartı (hepsi canlı, "Yakında" yok) + araçlara ait canlı durum satırı
 * + Advisor raporundan "Bu Hafta Öncelikler".
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getPlanLabel } from "@/lib/constants/plan";
import { getDashboardToolStatuses } from "@/lib/dashboard/get-tool-statuses";
import { getTopPriorities } from "@/lib/advisor/get-top-priorities";
import { DashboardHome } from "../_components/dashboard-home";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandSlug: string }>;

export default async function BrandDashboardPage({
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

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });
  if (!profile) redirect("/analiz");

  const brands = await prisma.brand.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    include: {
      scans: { orderBy: { completedAt: "desc" }, take: 2 },
    },
  });
  if (brands.length === 0) redirect("/analiz");

  const activeBrand = brands.find((b) => b.slug === brandSlug);
  if (!activeBrand) redirect(`/dashboard/${brands[0].slug}`);

  const [toolStatuses, priorities] = await Promise.all([
    getDashboardToolStatuses(
      activeBrand.id,
      brands.length,
      getPlanLabel(profile.plan),
    ),
    getTopPriorities(activeBrand.id, 3),
  ]);

  return (
    <DashboardHome
      profile={profile}
      brand={activeBrand}
      brands={brands}
      toolStatuses={toolStatuses}
      priorities={priorities}
    />
  );
}
