"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GH7Logo } from "@/components/gh7-logo";
import {
  LayoutDashboardIcon,
  BarChart3Icon,
  TargetIcon,
  SearchIcon,
  BuildingIcon,
  MapPinIcon,
  FileTextIcon,
  SettingsIcon,
  CreditCardIcon,
  KeyIcon,
  LogOutIcon,
  ChevronDownIcon,
  PlusIcon,
} from "lucide-react";
// Brand dropdown uses simple state instead of shadcn DropdownMenu
// to avoid base-ui button nesting issues

const NAV_ITEMS = [
  {
    title: "Genel Bakış",
    href: "/panel/genel",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Görünürlük",
    href: "/panel/gorunurluk",
    icon: BarChart3Icon,
  },
  {
    title: "İyileştirme",
    href: "/panel/iyilestirme",
    icon: TargetIcon,
  },
  {
    title: "Aramalar",
    href: "/panel/aramalar",
    icon: SearchIcon,
  },
  {
    title: "Rakipler",
    href: "/panel/rakipler",
    icon: BuildingIcon,
  },
  {
    title: "İller",
    href: "/panel/iller",
    icon: MapPinIcon,
  },
  {
    title: "Raporlar",
    href: "/panel/raporlar",
    icon: FileTextIcon,
  },
];

const BOTTOM_ITEMS = [
  {
    title: "Ayarlar",
    href: "/panel/ayarlar",
    icon: SettingsIcon,
  },
  {
    title: "Abonelik",
    href: "/panel/abonelik",
    icon: CreditCardIcon,
  },
  {
    title: "API",
    href: "/panel/api",
    icon: KeyIcon,
  },
];

interface PanelSidebarProps {
  brandName?: string;
  userEmail?: string;
  plan?: string;
}

export function PanelSidebar({ brandName = "ISITMAX", userEmail = "demo@gh7.ai", plan = "free" }: PanelSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [brandOpen, setBrandOpen] = React.useState(false);
  const brandInitials = brandName.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    router.push("/giris");
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-100">
        <Link href="/panel/genel" className="flex items-center">
          <GH7Logo size="default" />
        </Link>
      </div>

      {/* Brand Selector */}
      <div className="px-4 py-3 border-b border-gray-100 relative">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setBrandOpen(!brandOpen)}
          onKeyDown={(e) => e.key === "Enter" && setBrandOpen(!brandOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-600">{brandInitials}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{brandName}</span>
          </div>
          <ChevronDownIcon className={cn("w-4 h-4 text-gray-400 transition-transform", brandOpen && "rotate-180")} />
        </div>
        {brandOpen && (
          <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-sm font-medium text-gray-900">
              <div className="w-5 h-5 bg-gray-900 rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">IS</span>
              </div>
              ISITMAX
            </div>
            <div className="h-px bg-gray-100 my-1" />
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 cursor-not-allowed">
              <PlusIcon className="w-4 h-4" />
              Yeni marka ekle (Pro)
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.title}</span>
            </Link>
          );
        })}

        <div className="h-px bg-gray-100 my-4" />

        {BOTTOM_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            title="Çıkış Yap"
          >
            <LogOutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
