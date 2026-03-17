"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

/* ─────────────────────────────────────────────────────
   Minimal Kinde-style header
   Only: sidebar toggle (left) + avatar (right)
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
}: SiteHeaderProps) {
  const initial = userName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className="kinde-header flex items-center justify-between px-4 lg:px-6">
      {/* Left: sidebar toggle */}
      <SidebarTrigger className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" />

      {/* Right: avatar only */}
      <div className="flex items-center gap-3">
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
