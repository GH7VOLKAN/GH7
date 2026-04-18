import { Suspense } from "react";
import { PanelSidebar } from "@/components/panel/panel-sidebar";
import { PanelMobileNav } from "@/components/panel/panel-mobile-nav";
import { PageLoadingBar } from "@/components/panel/page-loading-bar";
import { EmailVerificationBanner } from "@/components/panel/email-verification-banner";
import { PanelDataProvider } from "@/contexts/panel-context";
import { getUserProfile, getActiveBrand } from "@/lib/dal/brand";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isDemo = true;
  let brandData: { id: string; name: string; domain: string; sector: string | null; type: string; serviceRegions: string[] } | null = null;
  let profileData: { id: string; email: string; fullName: string | null; avatarUrl: string | null; plan: string; emailWeeklyReport: boolean; emailVerified: boolean } | null = null;
  let plan = "free";
  try {
    const user = await getUserProfile();
    const activeBrand = await getActiveBrand();

    if (user && activeBrand?.brand) {
      isDemo = false;
      plan = activeBrand.plan ?? "free";

      brandData = {
        id: activeBrand.brand.id,
        name: activeBrand.brand.name,
        domain: activeBrand.brand.domain ?? "",
        sector: activeBrand.brand.sector,
        type: activeBrand.brand.type ?? "firma",
        serviceRegions: (activeBrand.brand as Record<string, unknown>).serviceRegions as string[] ?? [],
      };

      profileData = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        plan,
        emailWeeklyReport: (activeBrand.profile as Record<string, unknown>).emailWeeklyReport as boolean ?? true,
        emailVerified: (activeBrand.profile as Record<string, unknown>).emailVerified as boolean ?? false,
      };
    }
    // User var ama brand yok → panel yine açılır, her sayfa empty state
    // gösterir (CTA: "Ücretsiz analize başla → /analiz"). Eskiden /onboard'a
    // redirect ediyordu — ikinci paralel analiz akışı açıp kullanıcıyı
    // karıştırıyordu. Tek giriş noktası artık /analiz.
    // Kullanıcı yoksa isDemo=true kalır, demo panel görünür.
  } catch (err) {
    console.error("[panel/layout] Auth/DB error:", err);
    // Auth/DB error → fallback to demo mode
    isDemo = true;
  }

  return (
    <PanelDataProvider
      brand={brandData}
      profile={profileData}
      plan={plan}
      isDemo={isDemo}
    >
      <Suspense fallback={null}>
        <PageLoadingBar />
      </Suspense>
      <div className="min-h-screen bg-white">
        <PanelSidebar
          brandName={brandData?.name ?? "Markanız"}
          userEmail={profileData?.email ?? ""}
          plan={plan}
        />
        <main className="md:pl-64">
          {profileData && (
            <Suspense fallback={null}>
              <EmailVerificationBanner
                email={profileData.email}
                emailVerified={profileData.emailVerified}
              />
            </Suspense>
          )}
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
            <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
              {children}
            </Suspense>
          </div>
        </main>
        <PanelMobileNav />
      </div>
    </PanelDataProvider>
  );
}
