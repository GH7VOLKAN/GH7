"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Search,
  DollarSign,
  BarChart3,
  Bell,
  Handshake,
  Heart,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Kullan\u0131c\u0131lar", icon: Users },
  { href: "/admin/brands", label: "Markalar", icon: Building2 },
  { href: "/admin/scans", label: "Taramalar", icon: Search },
  { href: "/admin/revenue", label: "Gelir", icon: DollarSign },
  { href: "/admin/costs", label: "Maliyetler", icon: BarChart3 },
  { href: "/admin/notifications", label: "Bildirimler", icon: Bell },
  { href: "/admin/agency", label: "Ajans", icon: Handshake },
  { href: "/admin/health", label: "Sa\u011fl\u0131k", icon: Heart },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-border/50 bg-card">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-4">
        <span className="text-sm font-semibold text-foreground">
          GH7 Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 px-4 py-3">
        <p className="truncate text-xs text-muted-foreground">{email}</p>
        <Link
          href="/dashboard"
          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Dashboard&apos;a D\u00f6n
        </Link>
      </div>
    </aside>
  );
}
