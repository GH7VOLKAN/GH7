"use client";

/**
 * AppSidebar — Kinde estetiği editorial sidebar (Brief F Adım 1.5)
 *
 * - Üstte GH7 text logosu + plan label (kutu yok)
 * - Menü item'ler: ikon + metin düz satır, tracking-tight
 * - Active state: font-semibold + solda 2px siyah bar
 * - Hover: subtle zinc-100 bg, 120ms
 * - Alt user: kutu yok, düz bilgi + Çıkış ikonu
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Eye,
  ClipboardCheck,
  LineChart,
  Radar,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";
import { getPlanLabel } from "@/lib/constants/plan";

type Brand = {
  id: string;
  name: string;
  domain: string;
};

type Props = {
  profile: {
    email: string | null;
    phone: string | null;
    plan: string;
  };
  brands: Brand[];
  activeBrandId: string;
};

const BRAND_MENU = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  { key: "insight", label: "Insight", icon: Eye, href: "/dashboard/insight" },
  {
    key: "audit",
    label: "Audit",
    icon: ClipboardCheck,
    href: "/dashboard/audit",
  },
  {
    key: "tracker",
    label: "Tracker",
    icon: LineChart,
    href: "/dashboard/tracker",
  },
  { key: "radar", label: "Radar", icon: Radar, href: "/dashboard/radar" },
  {
    key: "advisor",
    label: "Advisor",
    icon: Sparkles,
    href: "/dashboard/advisor",
  },
  {
    key: "studio",
    label: "Studio",
    icon: Settings,
    href: "/dashboard/studio",
  },
];

function getDisplayName(profile: Props["profile"]): string {
  const isSyntheticEmail =
    !!profile.email &&
    profile.email.startsWith("phone_") &&
    profile.email.endsWith("@gh7.ai");
  if (profile.email && !isSyntheticEmail) return profile.email;
  if (profile.phone) {
    const digits = profile.phone.replace(/\D/g, "");
    if (digits.startsWith("90") && digits.length === 12) {
      return `+90 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
    }
    return `+${profile.phone}`;
  }
  return "Kullanıcı";
}

async function handleSignOut() {
  try {
    await fetch("/api/auth/signout", { method: "POST" });
  } catch {
    // ignore
  }
  window.location.href = "/";
}

export function AppSidebar({ profile, brands, activeBrandId }: Props) {
  const pathname = usePathname();
  const planLabel = getPlanLabel(profile.plan);
  const displayName = getDisplayName(profile);

  return (
    <Sidebar collapsible="icon">
      {/* Editorial logo: "GH7" text + tiny plan label */}
      <SidebarHeader className="px-4 py-6">
        <Link
          href="/dashboard"
          className="inline-block group-data-[collapsible=icon]:text-center"
        >
          <div className="text-2xl font-bold tracking-tight leading-none">
            GH7
          </div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground group-data-[collapsible=icon]:hidden">
            {planLabel}
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.14em]">
            Araçlar
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {BRAND_MENU.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                      className={`relative tracking-tight ${
                        isActive ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {/* 2px left bar (active indicator) */}
                      {isActive && (
                        <span
                          aria-hidden
                          className="absolute inset-y-1 left-0 w-[2px] rounded-r-full bg-foreground"
                        />
                      )}
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {brands.length > 1 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] tracking-[0.14em]">
              Markalar · {brands.length}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {brands.map((brand) => {
                  const isActive = brand.id === activeBrandId;
                  return (
                    <SidebarMenuItem key={brand.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={brand.name}
                        render={<Link href={`/dashboard?brand=${brand.id}`} />}
                        className={`relative tracking-tight ${
                          isActive ? "font-semibold" : "font-normal"
                        }`}
                      >
                        {isActive && (
                          <span
                            aria-hidden
                            className="absolute inset-y-1 left-0 w-[2px] rounded-r-full bg-foreground"
                          />
                        )}
                        <span className="inline-flex aspect-square size-4 items-center justify-center text-[10px] font-semibold text-muted-foreground">
                          {brand.name[0]?.toUpperCase() || "B"}
                        </span>
                        <span className="truncate">{brand.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-medium tracking-tight">
              {displayName}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mt-0.5">
              {planLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Çıkış"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
