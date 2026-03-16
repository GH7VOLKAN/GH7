"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScanButton } from "@/components/scan/scan-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SunIcon, MoonIcon } from "lucide-react";

type BrandType = "firma" | "kisisel";

const firmaPageTitles: Record<string, string> = {
  "/dashboard/genel": "Genel Bakis",
  "/dashboard/promptlar": "Sorular",
  "/dashboard/kaynaklar": "Kaynaklar",
  "/dashboard/rakipler": "Rakipler",
  "/dashboard/site": "Site Kontrolu",
  "/dashboard/aksiyon": "Aksiyon Plani",
  "/dashboard/gelisim": "Gelisim Plani",
  "/dashboard/ayarlar": "Ayarlar",
};

const kisiselPageTitles: Record<string, string> = {
  "/dashboard/genel": "Genel Bakis",
  "/dashboard/promptlar": "Sorular",
  "/dashboard/kaynaklar": "Dijital Iz",
  "/dashboard/rakipler": "Senin Yerine Kim",
  "/dashboard/site": "Dijital Kontrol",
  "/dashboard/aksiyon": "Aksiyon Plani",
  "/dashboard/gelisim": "Gelisim Plani",
  "/dashboard/ayarlar": "Ayarlar",
};

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface SiteHeaderProps {
  userName?: string;
  brandId?: string;
  brandType?: BrandType;
  lastScanAt?: string | null;
  scanRunning?: boolean;
  runningScanId?: string | null;
  notifications?: NotificationItem[];
  unreadCount?: number;
}

export function SiteHeader({
  userName,
  brandId,
  brandType = "firma",
  lastScanAt,
  scanRunning,
  runningScanId,
  notifications = [],
  unreadCount = 0,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const titles = brandType === "kisisel" ? kisiselPageTitles : firmaPageTitles;
  const title = titles[pathname] ?? "Genel Bakis";
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
            <>
              <ScanButton
                brandId={brandId}
                lastScanAt={lastScanAt ?? null}
                initialRunning={scanRunning}
                runningScanId={runningScanId}
              />
              <NotificationBell
                brandId={brandId}
                notifications={notifications}
                unreadCount={unreadCount}
              />
            </>
          )}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            title={theme === "dark" ? "Açık tema" : "Koyu tema"}
          >
            {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </button>
          <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
