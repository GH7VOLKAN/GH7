/**
 * /dashboard — 6 marka kartı grid (Brief Final)
 *
 * Shazam analizinden geldikten sonra gelinen ana ekran.
 * Free: Insight + Studio açık, 4 Pro marka kilitli
 * Pro / Pro+: hepsi açık
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { BrandCardGrid } from "./_components/brand-card-grid";
import { DashboardHeader } from "./_components/dashboard-header";
import { PLANS } from "@/lib/constants/plan";
import s from "./dashboard.module.css";

export const dynamic = "force-dynamic";

async function getSessionAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      phone: true,
      email: true,
      plan: true,
    },
  });
  if (!profile) return null;

  return { user, profile };
}

async function getBrandsForProfile(profileId: string) {
  return prisma.brand.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
    include: {
      scans: {
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
  });
}

export default async function DashboardPage() {
  const session = await getSessionAndProfile();
  if (!session) redirect("/analiz");

  const { profile } = session;
  const brands = await getBrandsForProfile(profile.id);

  if (brands.length === 0) redirect("/analiz");

  // Default: en son oluşturulan brand. Pro+ ile marka seçici Studio'da.
  const activeBrand = brands[0];
  const latestScan = activeBrand.scans[0];

  return (
    <div className={s.shell}>
      <DashboardHeader
        profile={profile}
        brandName={activeBrand.name}
        brandCount={brands.length}
      />
      <main className={s.main}>
        <div className={s.hero}>
          <h1 className={s.heroTitle}>{activeBrand.name}</h1>
          <p className={s.heroSub}>
            {profile.plan === PLANS.FREE &&
              "Ücretsiz analizin hazır. 4 Pro aracı kilit açmak için Pro'ya geç."}
            {profile.plan === PLANS.PRO &&
              "Pro üyesin. Tüm araçların aktif, markanı sürekli izle."}
            {profile.plan === PLANS.PRO_PLUS &&
              `Pro+ üyesin. ${brands.length}/5 marka izliyorsun, tüm araçlar aktif.`}
          </p>
        </div>

        <BrandCardGrid
          score={latestScan?.score ?? 0}
          scoreTotal={latestScan?.scoreTotal ?? 25}
          plan={profile.plan}
        />
      </main>
    </div>
  );
}
