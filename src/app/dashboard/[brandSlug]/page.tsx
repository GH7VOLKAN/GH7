/**
 * /dashboard/[brandSlug] — Brand-spesifik ana sayfa (Brief H-ext Aşama 1).
 *
 * Hero (display 72px) + görünürlük metrikleri + 6 kart grid.
 * Layout'un zaten yaptığı brand validation'ı tekrar etmez; aktif brand'ı
 * params'tan okur.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
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

  return (
    <DashboardHome profile={profile} brand={activeBrand} brands={brands} />
  );
}
