import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PanelSidebar } from "@/components/panel/panel-sidebar";
import { PanelMobileNav } from "@/components/panel/panel-mobile-nav";
import { PageLoadingBar } from "@/components/panel/page-loading-bar";
import { EmailVerificationBanner } from "@/components/panel/email-verification-banner";
import { PanelDataProvider } from "@/contexts/panel-context";
import { getAuthState } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * TEK PANEL GUARD.
 *
 * /panel/* altındaki HİÇBİR sayfa kendi guard'ı yazmaz.
 * Burada getAuthState() tek seferde kontrol eder:
 *   - no_session  → /giris
 *   - no_profile  → /giris (oturum çöpü; client-side signOut için)
 *   - no_brand    → /analiz (analiz tamamlamamış kullanıcı)
 *   - complete    → sayfayı göster
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthState();

  if (auth.status === "no_session") redirect("/giris");
  if (auth.status === "no_profile") redirect("/giris");
  if (auth.status === "no_brand") redirect("/analiz");

  // auth.status === "complete" — Profile + Brand var
  const { profile, brand, isAdmin: isAdminFlag } = auth;

  // Extended brand bilgisi için ek Prisma query (sektör, service regions vb.)
  const brandFull = await prisma.brand.findUnique({
    where: { id: brand.id },
    select: {
      id: true,
      name: true,
      domain: true,
      sector: true,
      type: true,
      serviceRegions: true,
      userType: true,
    },
  });
  // Profile ek alanlar için
  const profileFull = await prisma.profile.findUnique({
    where: { id: profile.id },
    select: {
      emailWeeklyReport: true,
      emailVerified: true,
      avatarUrl: true,
    },
  });

  const plan = profile.plan;
  const brandData = brandFull
    ? {
        id: brandFull.id,
        name: brandFull.name,
        domain: brandFull.domain ?? "",
        sector: brandFull.sector,
        type: brandFull.type ?? "firma",
        serviceRegions: brandFull.serviceRegions ?? [],
      }
    : null;
  const profileData = {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    avatarUrl: profileFull?.avatarUrl ?? null,
    plan,
    emailWeeklyReport: profileFull?.emailWeeklyReport ?? true,
    emailVerified: profileFull?.emailVerified ?? false,
  };

  return (
    <PanelDataProvider
      brand={brandData}
      profile={profileData}
      plan={plan}
      isDemo={false}
    >
      <Suspense fallback={null}>
        <PageLoadingBar />
      </Suspense>
      <div className="min-h-screen bg-white">
        <PanelSidebar
          brandName={brandData?.name ?? "Markanız"}
          userEmail={profileData.email}
          plan={plan}
        />
        <main className="md:pl-64">
          <Suspense fallback={null}>
            <EmailVerificationBanner
              email={profileData.email}
              emailVerified={profileData.emailVerified}
            />
          </Suspense>
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
            <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
              {children}
            </Suspense>
          </div>
        </main>
        <PanelMobileNav />
      </div>
      {/* isAdmin bayrağı PanelDataProvider'a gelecek sürümde eklenebilir.
          Şimdilik admin kontrolleri isAdmin() çağrısıyla yapılır. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
      {false && <span data-is-admin={isAdminFlag} />}
    </PanelDataProvider>
  );
}
