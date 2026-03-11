"use client";

import { nextScanIn } from "@/lib/mock-data/overview";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          ISITMAX
        </span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">
          isitmax.com
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">
          Sonraki tarama: {nextScanIn}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
          V
        </div>
      </div>
    </header>
  );
}
