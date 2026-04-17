"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  ClipboardCheckIcon,
  CrownIcon,
  PackageIcon,
  SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Genel", href: "/panel/genel", icon: LayoutDashboardIcon },
  { label: "Audit", href: "/panel/audit-detay", icon: ClipboardCheckIcon },
  { label: "Rakipler", href: "/panel/aramalar", icon: CrownIcon },
  { label: "Hizmetler", href: "/panel/hizmetler", icon: PackageIcon },
  { label: "Ayarlar", href: "/panel/ayarlar", icon: SettingsIcon },
];

export function PanelMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-xl">
      <div
        className="flex items-center justify-around h-16"
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
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-gray-900" />
              )}
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
