"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  UsersIcon,
  GlobeIcon,
  ClipboardListIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  checklistProgress?: { completed: number; total: number };
}

interface TabItem {
  label: string;
  href: string;
  icon: LucideIcon;
  showProgress?: boolean;
}

const tabs: TabItem[] = [
  {
    label: "Genel",
    href: "/dashboard/genel",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Sorular",
    href: "/dashboard/promptlar",
    icon: MessageSquareTextIcon,
  },
  {
    label: "Rakipler",
    href: "/dashboard/rakipler",
    icon: UsersIcon,
  },
  {
    label: "Dijital",
    href: "/dashboard/site",
    icon: GlobeIcon,
  },
  {
    label: "Gelişim",
    href: "/dashboard/gelisim",
    icon: ClipboardListIcon,
    showProgress: true,
  },
];

export function MobileBottomNav({
  checklistProgress,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-border/40 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div
        className="flex items-center justify-around h-[64px]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] font-medium transition-colors relative",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-foreground" />
              )}
              <Icon className="h-5 w-5" />
              <span className="flex items-center gap-0.5">
                {tab.label}
                {tab.showProgress && checklistProgress && checklistProgress.total > 0 && (
                  <span className="text-[9px] text-muted-foreground">
                    {checklistProgress.completed}/{checklistProgress.total}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
