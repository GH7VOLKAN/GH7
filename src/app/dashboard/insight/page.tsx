/**
 * /dashboard/insight — Analiz sonucunun kalıcı görünümü (Brief F Adım 2.1)
 *
 * Free/Pro/Pro+ tüm tier'larda açık. Pro/Pro+ için "Yeniden tara" linki.
 * ?brand=X query param ile marka seçimi (brand switcher uyumlu).
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/constants/plan";
import { InsightView } from "./_components/insight-view";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ brand?: string }>;

async function getInsightData(brandIdParam?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });
  if (!profile) return null;

  const brands = await prisma.brand.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (brands.length === 0) return null;

  const targetBrandId =
    (brandIdParam && brands.find((b) => b.id === brandIdParam)?.id) ||
    brands[0].id;

  const brand = await prisma.brand.findUnique({
    where: { id: targetBrandId },
    include: {
      scans: {
        orderBy: { completedAt: "desc" },
        take: 1,
        include: {
          results: {
            include: { prompt: true },
          },
        },
      },
      competitors: {
        where: { isPrimary: true },
        take: 3,
      },
    },
  });

  if (!brand) return null;
  return { profile, brand };
}

export default async function InsightPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const data = await getInsightData(params.brand);
  if (!data) redirect("/analiz");

  const { profile, brand } = data;
  const latestScan = brand.scans[0];
  const canStartNewAnalysis =
    profile.plan === PLANS.PRO || profile.plan === PLANS.PRO_PLUS;

  return (
    <InsightView
      brand={brand}
      scan={latestScan}
      competitors={brand.competitors}
      canStartNewAnalysis={canStartNewAnalysis}
      plan={profile.plan}
    />
  );
}
