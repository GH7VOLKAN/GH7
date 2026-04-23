/**
 * /dashboard — 6 marka kartı grid (Brief D1)
 *
 * Shazam analizinden geldikten sonra gelinen ana ekran.
 * Free: Insight + Studio açık, 4 marka kilitli
 * Pro: hepsi açık
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { BrandCardGrid } from "./_components/brand-card-grid";
import { DashboardHeader } from "./_components/dashboard-header";
import s from "./dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/analiz");
  }

  // Profile lookup: user.id VEYA user.email ile eşleştir
  // verify-sms-otp akışında Supabase generateLink({email}) her çağrıda
  // yeni user yaratabiliyor — id mismatch'i bypass'lamak için email
  // fallback. Telefon-only session'da user.email = syntheticEmail veya
  // gerçek email olur, Profile.email ile eşleşir.
  const profile = await prisma.profile.findFirst({
    where: {
      OR: [
        { id: user.id },
        ...(user.email ? [{ email: user.email }] : []),
        ...(user.phone ? [{ phone: user.phone }] : []),
      ],
    },
    select: {
      id: true,
      phone: true,
      email: true,
      plan: true,
    },
  });

  if (!profile) {
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

  // Henüz analiz yapılmamış — analize yönlendir
  if (!brand) {
    redirect("/analiz");
  }

  const latestScan = brand.scans[0];
  const isPro = profile.plan !== "free";

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
