"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Tarama", href: "/dashboard/tarama" },
  { label: "Site", href: "/dashboard/site" },
  { label: "Sorular", href: "/dashboard/sorular" },
  { label: "Aksiyon", href: "/dashboard/aksiyon" },
  { label: "Rakip", href: "/dashboard/rakip" },
  { label: "Takip", href: "/dashboard/takip" },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border overflow-x-auto">
      <div className="flex min-w-max px-4 sm:px-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors whitespace-nowrap",
                isActive
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
