/**
 * /dashboard/insight — Analiz sonucunun kalıcı görünümü (readOnly)
 *
 * Free/Pro/Pro+ tüm tier'larda açık. Pro/Pro+ için "Yeni Analiz Başlat" butonu.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/constants/plan";
import { InsightView } from "./_components/insight-view";

export const dynamic = "force-dynamic";

async function getInsightData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });
  if (!profile) return null;

  const brand = await prisma.brand.findFirst({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    include: {
      scans: {
        orderBy: { completedAt: "desc" },
        take: 1,
        include: {
          results: {
            include: {
              prompt: true,
            },
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

export default async function InsightPage() {
  const data = await getInsightData();
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
