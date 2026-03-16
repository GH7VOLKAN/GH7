import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getUserProfile, getActiveBrand } from "@/lib/dal/brand";
import { getLastScanInfo } from "@/lib/dal/scans";
import { getNotifications } from "@/lib/dal/notifications";
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

  const [scanInfo, notifData, checklistSummary] = await Promise.all([
    brandId ? getLastScanInfo(brandId) : null,
    brandId ? getNotifications(brandId) : null,
    brandId ? getChecklistSummary(brandId) : null,
  ]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        brandType={brandType}
        plan={plan}
        checklistSummary={checklistSummary}
        user={
          user
            ? { name: user.fullName, email: user.email, avatarUrl: user.avatarUrl }
            : { name: "Demo", email: "demo@gh7.ai" }
        }
      />
      <SidebarInset>
        <SiteHeader
          userName={user?.fullName ?? "D"}
          brandId={brandId}
          brandType={brandType}
          lastScanAt={scanInfo?.lastCompletedAt}
          scanRunning={scanInfo?.isRunning}
          runningScanId={scanInfo?.runningScanId}
          notifications={notifData?.notifications.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            read: n.read,
            createdAt: n.createdAt.toISOString(),
          }))}
          unreadCount={notifData?.unreadCount}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
