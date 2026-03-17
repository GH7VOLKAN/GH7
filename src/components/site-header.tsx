"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScanButton } from "@/components/scan/scan-button";

/* ─────────────────────────────────────────────────────
   Minimal Kinde-style header
   Only: sidebar toggle (left) + scan button + avatar (right)
   Sticky, backdrop-blur, nearly invisible
   ───────────────────────────────────────────────────── */

interface SiteHeaderProps {
  userName?: string;
  avatarUrl?: string | null;
  brandId?: string;
  brandType?: "firma" | "kisisel";
  lastScanAt?: string | null;
  scanRunning?: boolean;
  runningScanId?: string | null;
  notifications?: unknown[];
  unreadCount?: number;
}

export function SiteHeader({
  userName,
  avatarUrl,
  brandId,
  lastScanAt,
  scanRunning,
  runningScanId,
}: SiteHeaderProps) {
  const initial = userName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className="kinde-header flex items-center justify-between px-4 lg:px-6">
      {/* Left: sidebar toggle */}
      <SidebarTrigger className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" />

      {/* Right: scan button (compact) + avatar */}
      <div className="flex items-center gap-3">
        {brandId && (
          <ScanButton
            brandId={brandId}
            lastScanAt={lastScanAt ?? null}
            initialRunning={scanRunning}
            runningScanId={runningScanId}
          />
        )}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName ?? "User"}
            className="size-[30px] rounded-full object-cover ring-1 ring-border"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex size-[30px] items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
            {initial}
          </div>
        )}
      </div>
    </header>
  );
}
