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
  badge?: string;
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
    badge: "★",
  },
  {
    label: "Dijital",
    href: "/dashboard/site",
    icon: GlobeIcon,
  },
  {
    label: "Gelisim",
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
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div
        className="flex items-center justify-around h-[60px]"
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
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2.5 text-[9px] text-amber-500 font-bold leading-none">
                    {tab.badge}
                  </span>
                )}
              </span>
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
