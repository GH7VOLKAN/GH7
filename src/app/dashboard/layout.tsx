import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopBar } from "@/components/layout/top-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      <div className="lg:ml-[240px]">
        <TopBar />
        <main className="dashboard-container mx-auto max-w-[900px] px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
