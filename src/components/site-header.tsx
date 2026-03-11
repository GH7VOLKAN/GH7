"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScanButton } from "@/components/scan/scan-button";

const pageTitles: Record<string, string> = {
  "/dashboard/genel": "Genel Bakış",
  "/dashboard/promptlar": "Promptlar",
  "/dashboard/kaynaklar": "Kaynaklar",
  "/dashboard/rakipler": "Rakipler",
  "/dashboard/site": "Site Analizi",
  "/dashboard/aksiyon": "Aksiyon Planı",
  "/dashboard/ayarlar": "Ayarlar",
};

interface SiteHeaderProps {
  userName?: string;
  brandId?: string;
  lastScanAt?: string | null;
  scanRunning?: boolean;
  runningScanId?: string | null;
}

export function SiteHeader({
  userName,
  brandId,
  lastScanAt,
  scanRunning,
  runningScanId,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";
  const initial = userName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-3">
          {brandId && (
            <ScanButton
              brandId={brandId}
              lastScanAt={lastScanAt ?? null}
              initialRunning={scanRunning}
              runningScanId={runningScanId}
            />
          )}
          <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
