"use client";

/**
 * AppSidebar — Kinde editorial sidebar (Brief F + H-ext Aşama 1).
 *
 * URL yapısı: /dashboard/[brandSlug]/insight, /audit, /tracker, /radar, /advisor
 * activeBrandSlug pathname'den derive edilir; yoksa defaultBrandSlug kullanılır.
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
  slug: string;
  name: string;
  domain: string;
  gate: string;
};

type Props = {
  profile: {
    email: string | null;
    phone: string | null;
    plan: string;
  };
  brands: Brand[];
  defaultBrandSlug: string;
};

const BRAND_SUB_MENU = [
  { key: "home", label: "Dashboard", icon: LayoutDashboard, sub: "" },
  { key: "insight", label: "Insight", icon: Eye, sub: "/insight" },
  {
    key: "audit",
    label: "Audit",
    icon: ClipboardCheck,
    sub: "/audit",
  },
  {
    key: "tracker",
    label: "Tracker",
    icon: LineChart,
    sub: "/tracker",
  },
  { key: "radar", label: "Radar", icon: Radar, sub: "/radar" },
  {
    key: "advisor",
    label: "Advisor",
    icon: Sparkles,
    sub: "/advisor",
  },
];

const STUDIO_HREF = "/dashboard/studio";

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

// URL'den aktif brand slug'ı çıkar: /dashboard/idavilla-bungalov/... → "idavilla-bungalov"
// /dashboard/studio → null (brand scope değil)
// /dashboard (root) → null → caller default kullanır
function extractActiveBrandSlug(
  pathname: string,
  brandSlugs: string[],
): string | null {
  const match = pathname.match(/^\/dashboard\/([^/]+)/);
  if (!match) return null;
  const maybeSlug = match[1];
  if (maybeSlug === "studio" || maybeSlug === "pro") return null;
  // Guard: yalnızca bilinen brand slug'ı kabul et
  return brandSlugs.includes(maybeSlug) ? maybeSlug : null;
}

export function AppSidebar({ profile, brands, defaultBrandSlug }: Props) {
  const pathname = usePathname();
  const planLabel = getPlanLabel(profile.plan);
  const displayName = getDisplayName(profile);

  const brandSlugs = brands.map((b) => b.slug);
  const activeBrandSlug =
    extractActiveBrandSlug(pathname, brandSlugs) ?? defaultBrandSlug;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6">
        <Link
          href={`/dashboard/${activeBrandSlug}`}
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
        {/* Araçlar — aktif brand scope'unda */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.14em]">
            Araçlar
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {BRAND_SUB_MENU.map((item) => {
                const Icon = item.icon;
                const href = `/dashboard/${activeBrandSlug}${item.sub}`;
                const isActive =
                  item.sub === ""
                    ? pathname === `/dashboard/${activeBrandSlug}`
                    : pathname.startsWith(
                        `/dashboard/${activeBrandSlug}${item.sub}`,
                      );
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      render={<Link href={href} />}
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
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Studio — brand-agnostik, ayrı grup değil ama farklı prefix */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith(STUDIO_HREF)}
                  tooltip="Studio"
                  render={<Link href={STUDIO_HREF} />}
                  className={`relative tracking-tight ${
                    pathname.startsWith(STUDIO_HREF)
                      ? "font-semibold"
                      : "font-normal"
                  }`}
                >
                  {pathname.startsWith(STUDIO_HREF) && (
                    <span
                      aria-hidden
                      className="absolute inset-y-1 left-0 w-[2px] rounded-r-full bg-foreground"
                    />
                  )}
                  <Settings className="size-4" />
                  <span>Studio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Markalar listesi */}
        {brands.length > 1 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] tracking-[0.14em]">
              Markalar · {brands.length}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {brands.map((brand) => {
                  const isActive = brand.slug === activeBrandSlug;
                  const href = `/dashboard/${brand.slug}`;
                  return (
                    <SidebarMenuItem key={brand.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={brand.name}
                        render={<Link href={href} />}
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
                        {brand.gate !== "FIRMA" && (
                          <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
                            Yakında
                          </span>
                        )}
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
