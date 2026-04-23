/**
 * /dashboard — 6 marka kartı grid (Brief D1)
 *
 * Shazam analizinden geldikten sonra gelinen ana ekran.
 * Free: Insight + Studio açık, 4 marka kilitli
 * Pro: hepsi açık
 */

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { BrandCardGrid } from "./_components/brand-card-grid";
import { DashboardHeader } from "./_components/dashboard-header";
import s from "./dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const allCookieNames = cookieStore.getAll().map((c) => c.name);
  const sbCookies = allCookieNames.filter((n) => n.startsWith("sb-"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[dashboard]", {
    hasUser: !!user,
    userId: user?.id ?? null,
    sbCookies,
    allCookieCount: allCookieNames.length,
    allCookieNames: allCookieNames.slice(0, 20),
  });

  if (!user) {
    console.log("[dashboard] REDIRECT /analiz — no user (session cookie missing or invalid)");
    redirect("/analiz");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      phone: true,
      email: true,
      plan: true,
    },
  });

  console.log("[dashboard]", {
    hasProfile: !!profile,
    profileId: profile?.id,
    profilePhone: profile?.phone,
    profilePlan: profile?.plan,
  });

  if (!profile) {
    console.log("[dashboard] REDIRECT /analiz — no profile for user.id =", user.id);
    redirect("/analiz");
  }

  // En son Brand + en son tamamlanmış Scan
  const brand = await prisma.brand.findFirst({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    include: {
      scans: {
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
  });

  console.log("[dashboard]", {
    hasBrand: !!brand,
    brandId: brand?.id,
    brandDomain: brand?.domain,
    brandName: brand?.name,
    scanCount: brand?.scans.length ?? 0,
  });

  // Henüz analiz yapılmamış — analize yönlendir
  if (!brand) {
    console.log("[dashboard] REDIRECT /analiz — no Brand for profileId =", profile.id);
    redirect("/analiz");
  }

  const latestScan = brand.scans[0];
  const isPro = profile.plan !== "free";

  console.log("[dashboard] RENDER — brand:", brand.name, "score:", latestScan?.score);

  return (
    <div className={s.shell}>
      <DashboardHeader profile={profile} brandName={brand.name} />
      <main className={s.main}>
        <div className={s.hero}>
          <h1 className={s.heroTitle}>{brand.name}</h1>
          <p className={s.heroSub}>
            {isPro
              ? "Tüm araçların aktif. AI görünürlüğünü yönet."
              : "Ücretsiz analizin hazır. 5 Pro aracı kilit açmak için Pro'ya geç."}
          </p>
        </div>

        <BrandCardGrid
          score={latestScan?.score ?? 0}
          scoreTotal={latestScan?.scoreTotal ?? 25}
          isPro={isPro}
        />
      </main>
    </div>
  );
}
