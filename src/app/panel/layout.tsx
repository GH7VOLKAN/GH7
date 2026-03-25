import { PanelSidebar } from "@/components/panel/panel-sidebar";
import { PanelMobileNav } from "@/components/panel/panel-mobile-nav";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <PanelSidebar />
      <main className="md:pl-64">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          {children}
        </div>
      </main>
      <PanelMobileNav />
    </div>
  );
}
