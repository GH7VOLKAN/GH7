"use client";

import { GH7Logo } from "@/components/gh7-logo";
import { ThemeToggle } from "./theme-toggle";
import { mockBrand } from "@/lib/mock-data";

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6">
      <GH7Logo />
      <div className="flex items-center gap-3 sm:gap-4">
        <ThemeToggle />
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
          {mockBrand.name}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
          V
        </div>
      </div>
    </header>
  );
}
