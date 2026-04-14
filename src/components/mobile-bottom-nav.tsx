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
    href: "/panel/genel",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Sorular",
    href: "/panel/aramalar",
    icon: MessageSquareTextIcon,
  },
  {
    label: "Rakipler",
    href: "/panel/rakipler",
    icon: UsersIcon,
  },
  {
    label: "Dijital",
    href: "/panel/iyilestirme",
    icon: GlobeIcon,
  },
  {
    label: "Gelisim",
    href: "/panel/iyilestirme",
    icon: ClipboardListIcon,
    showProgress: true,
  },
];

function getProgressColorClass(completed: number): string {
  if (completed >= 11) return "text-emerald-500";
  if (completed >= 6) return "text-amber-500";
  return "text-red-500";
}

export function MobileBottomNav({
  checklistProgress,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
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
                  <span
                    className={cn(
                      "text-[9px] font-bold",
                      getProgressColorClass(checklistProgress.completed)
                    )}
                  >
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
