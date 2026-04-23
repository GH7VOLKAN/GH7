/**
 * /dashboard/studio — Ayarlar ve kontrol
 *
 * 3 tier farklı içerik:
 * - Free: profil + newsletter + "Pro'ya Geç" WhatsApp
 * - Pro: + "Bu Markayı Yeniden Analiz Et"
 * - Pro+: + 5 markaya kadar "Yeni Marka Ekle"
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/constants/plan";
import { StudioView } from "./_components/studio-view";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
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
  });

  const canStartNewAnalysis =
    profile.plan === PLANS.PRO || profile.plan === PLANS.PRO_PLUS;
  const canAddMoreBrands =
    profile.plan === PLANS.PRO_PLUS && brands.length < 5;

  return (
    <StudioView
      profile={profile}
      brands={brands}
      canStartNewAnalysis={canStartNewAnalysis}
      canAddMoreBrands={canAddMoreBrands}
    />
  );
}
