import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getUserProfile, getActiveBrand } from "@/lib/dal/brand";
import { getChecklistSummary } from "@/lib/dal/checklist";
import { redirect } from "next/navigation";

// Dashboard is always dynamic — requires auth + DB
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserProfile();
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;
  const brandType = (activeBrand?.brand?.type as "firma" | "kisisel") ?? "firma";
  const plan = activeBrand?.plan ?? "free";

  // Redirect to onboarding if user has no brand yet
  if (!brandId && activeBrand?.profile) {
    redirect("/onboard");
  }

  const checklistSummary = brandId ? await getChecklistSummary(brandId) : null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "256px",
          "--header-height": "48px",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        brandType={brandType}
        plan={plan}
        user={
          user
            ? { name: user.fullName, email: user.email, avatarUrl: user.avatarUrl }
            : { name: "Demo", email: "demo@gh7.ai" }
        }
      />
      <SidebarInset>
        <SiteHeader
          userName={user?.fullName ?? "D"}
          avatarUrl={user?.avatarUrl}
        />
        {/* Kinde-style main content area — centered, max-width, fafafa bg */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          <div className="mx-auto w-full max-w-[880px] px-4 lg:px-6">
            {children}
          </div>
        </main>
      </SidebarInset>
      <MobileBottomNav
        checklistProgress={
          checklistSummary
            ? { completed: checklistSummary.completed, total: checklistSummary.total }
            : undefined
        }
      />
    </SidebarProvider>
  );
}
