"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { GH7Logo } from "@/components/gh7-logo";
import { ProUpgradeBanner } from "@/components/panel/pro-upgrade-banner";
import {
  LayoutDashboardIcon,
  ClipboardCheckIcon,
  CrownIcon,
  PackageIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronDownIcon,
  PlusIcon,
  ShieldIcon,
} from "lucide-react";

const NAV_ITEMS = [
  {
    title: "Genel Bakış",
    href: "/panel/genel",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Audit Detay",
    href: "/panel/audit-detay",
    icon: ClipboardCheckIcon,
  },
  {
    title: "Senin Yerine Kim?",
    href: "/panel/aramalar",
    icon: CrownIcon,
  },
  {
    title: "Hizmetler",
    href: "/panel/hizmetler",
    icon: PackageIcon,
  },
  {
    title: "Ayarlar",
    href: "/panel/ayarlar",
    icon: SettingsIcon,
  },
];

interface PanelSidebarProps {
  brandName?: string;
  userEmail?: string;
  plan?: string;
  projectType?: string;
  /** Admin ise nav listesine /admin linki eklenir. */
  isAdmin?: boolean;
}

interface BrandListItem {
  id: string;
  name: string;
  domain: string | null;
  isDefault: boolean;
  userType?: string | null;
}

export function PanelSidebar({
  brandName = "Markanız",
  userEmail = "",
  plan = "free",
  projectType = "Firma",
  isAdmin = false,
}: PanelSidebarProps) {
  // Admin ise nav'a "Admin Panel" linki eklenir (sadece admin görür)
  const navItems = isAdmin
    ? [
        ...NAV_ITEMS,
        { title: "Admin Panel", href: "/admin", icon: ShieldIcon },
      ]
    : NAV_ITEMS;
  const pathname = usePathname();
  const router = useRouter();
  const [brandOpen, setBrandOpen] = React.useState(false);
  const [brandList, setBrandList] = React.useState<BrandListItem[]>([]);
  const [switching, setSwitching] = React.useState<string | null>(null);
  const brandInitials = brandName.substring(0, 2).toUpperCase();

  // Brand list'i lazy fetch — dropdown ilk açıldığında
  React.useEffect(() => {
    if (!brandOpen || brandList.length > 0) return;
    (async () => {
      try {
        const res = await fetch("/api/panel/brands");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.brands)) {
          setBrandList(data.brands as BrandListItem[]);
        }
      } catch {
        // sessiz fail
      }
    })();
  }, [brandOpen, brandList.length]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/giris");
  };

  const switchBrand = async (id: string) => {
    if (switching) return;
    setSwitching(id);
    try {
      const res = await fetch("/api/panel/brands/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: id }),
      });
      if (res.ok) {
        setBrandOpen(false);
        // Sayfayı yenile — getActiveBrand yeni brand'i döndürsün
        router.refresh();
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch {
      // sessiz fail
    } finally {
      setSwitching(null);
    }
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
            <span className="text-sm font-medium text-gray-900 truncate">{brandName}</span>
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">
              {projectType}
            </span>
          </div>
          <ChevronDownIcon className={cn("w-4 h-4 text-gray-400 transition-transform shrink-0", brandOpen && "rotate-180")} />
        </div>
        {brandOpen && (
          <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-80 overflow-y-auto">
            {/* Aktif brand — her zaman en üste */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-sm font-medium text-gray-900">
              <div className="w-5 h-5 bg-gray-900 rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">{brandInitials}</span>
              </div>
              <span className="truncate">{brandName}</span>
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-auto shrink-0">
                {projectType}
              </span>
            </div>

            {/* Diğer brand'ler (aktif olanı zaten üstte) */}
            {brandList
              .filter((b) => b.name !== brandName)
              .map((b) => {
                const initials = b.name.substring(0, 2).toUpperCase();
                const isSwitching = switching === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => switchBrand(b.id)}
                    disabled={isSwitching}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-wait"
                  >
                    <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-[8px] font-bold text-gray-600">
                        {initials}
                      </span>
                    </div>
                    <span className="truncate flex-1">{b.name}</span>
                    {b.domain && (
                      <span className="text-[10px] text-gray-400 truncate max-w-[100px]">
                        {b.domain}
                      </span>
                    )}
                    {isSwitching && (
                      <span className="text-[10px] text-gray-400">...</span>
                    )}
                  </button>
                );
              })}

            <div className="h-px bg-gray-100 my-1" />

            {/* Yeni marka ekle — her zaman aktif, /analiz'e yönlendirir */}
            <Link
              href="/analiz"
              onClick={() => setBrandOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Yeni marka ekle
            </Link>
          </div>
        )}
      </div>

      {/* Main Navigation — 5 item */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
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

      {/* Upgrade banner for free users */}
      <ProUpgradeBanner plan={plan} variant="sidebar" />

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            {plan !== "free" && (
              <span className="inline-block mt-0.5 text-[10px] font-semibold bg-gray-900 text-white px-1.5 py-0.5 rounded">
                {plan.toUpperCase()}
              </span>
            )}
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
