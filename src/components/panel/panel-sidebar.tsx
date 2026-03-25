"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

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

export function PanelSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    router.push("/giris");
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-100">
        <Link href="/panel/genel" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G7</span>
          </div>
          <span className="font-semibold text-lg text-gray-900">GH7.ai</span>
        </Link>
      </div>

      {/* Brand Selector */}
      <div className="px-4 py-3 border-b border-gray-100">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-600">IS</span>
            </div>
            <span className="text-sm font-medium text-gray-900">ISITMAX</span>
          </div>
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </button>
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
            <p className="text-xs text-gray-500 truncate">info@isitmax.com</p>
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
