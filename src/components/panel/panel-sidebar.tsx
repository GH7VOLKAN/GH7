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
  MapPinIcon,
  FileTextIcon,
  SettingsIcon,
  CreditCardIcon,
  LogOutIcon,
  ChevronDownIcon,
  PlusIcon,
} from "lucide-react";

const NAV_ITEMS = [
  {
    title: "Genel Bakış",
    href: "/panel/genel",
    icon: LayoutDashboardIcon,
    emoji: null,
  },
  {
    title: "Görünürlük",
    href: "/panel/gorunurluk",
    icon: BarChart3Icon,
    emoji: null,
  },
  {
    title: "İyileştirme",
    href: "/panel/iyilestirme",
    icon: TargetIcon,
    emoji: null,
  },
  {
    title: "Aramalar",
    href: "/panel/aramalar",
    icon: SearchIcon,
    emoji: null,
  },
  {
    title: "Senin Yerine Kim",
    href: "/panel/rakipler",
    icon: null,
    emoji: "🏆",
  },
  {
    title: "İller",
    href: "/panel/iller",
    icon: MapPinIcon,
    emoji: null,
  },
  {
    title: "Raporlar",
    href: "/panel/raporlar",
    icon: FileTextIcon,
    emoji: null,
  },
];

const BUSINESS_ITEMS = [
  {
    title: "Haftalık Aksiyonlar",
    href: "/panel/aksiyonlar",
    emoji: "📋",
  },
  {
    title: "İçerik Üretimi",
    href: "/panel/icerik",
    emoji: "✍️",
  },
  {
    title: "Rakip İstihbarat",
    href: "/panel/istihbarat",
    emoji: "🔎",
  },
  {
    title: "Korelasyon",
    href: "/panel/korelasyon",
    emoji: "📈",
  },
];

const BOTTOM_ITEMS = [
  {
    title: "Ajans Paketleri",
    href: "/panel/ajans-paketleri",
    emoji: "🛠",
    icon: null,
  },
  {
    title: "Ayarlar",
    href: "/panel/ayarlar",
    icon: SettingsIcon,
    emoji: null,
  },
  {
    title: "Abonelik",
    href: "/panel/abonelik",
    icon: CreditCardIcon,
    emoji: null,
  },
];

interface PanelSidebarProps {
  brandName?: string;
  userEmail?: string;
  plan?: string;
  projectType?: string;
}

export function PanelSidebar({
  brandName = "ISITMAX",
  userEmail = "demo@gh7.ai",
  plan = "free",
  projectType = "Firma",
}: PanelSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [brandOpen, setBrandOpen] = React.useState(false);
  const brandInitials = brandName.substring(0, 2).toUpperCase();
  const isPro = plan === "pro" || plan === "business" || plan === "agency";

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
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
              {projectType}
            </span>
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
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-auto">
                Firma
              </span>
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
              {item.emoji ? (
                <span className="w-[18px] h-[18px] flex items-center justify-center text-sm leading-none">{item.emoji}</span>
              ) : Icon ? (
                <Icon className="w-[18px] h-[18px]" />
              ) : null}
              <span>{item.title}</span>
            </Link>
          );
        })}

        {/* Divider before Business section */}
        <div className="h-px bg-gray-100 my-4" />

        {/* Business Section Header */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Pro
          </span>
          {!isPro && (
            <span className="text-xs">🔒</span>
          )}
        </div>

        {BUSINESS_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
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
              <span className="w-[18px] h-[18px] flex items-center justify-center text-sm leading-none">{item.emoji}</span>
              <span className="flex-1">{item.title}</span>
              {!isPro && (
                <span className="text-xs opacity-50">🔒</span>
              )}
            </Link>
          );
        })}

        {/* Divider before Ajans + Settings */}
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
              {item.emoji ? (
                <span className="w-[18px] h-[18px] flex items-center justify-center text-sm leading-none">{item.emoji}</span>
              ) : Icon ? (
                <Icon className="w-[18px] h-[18px]" />
              ) : null}
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
