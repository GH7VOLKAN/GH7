/**
 * /dashboard/[brandSlug]/insight — Analiz sonucu detay (Brief F + H-ext Aşama 1).
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/constants/plan";
import { InsightView } from "./_components/insight-view";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandSlug: string }>;

export default async function InsightPage({
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

  const brand = await prisma.brand.findFirst({
    where: { profileId: profile.id, slug: brandSlug },
    include: {
      scans: {
        orderBy: { completedAt: "desc" },
        take: 1,
        include: { results: { include: { prompt: true } } },
      },
      competitors: {
        where: { isPrimary: true },
        take: 3,
      },
    },
  });
  if (!brand) redirect("/dashboard");

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
