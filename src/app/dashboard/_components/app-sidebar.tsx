"use client";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Eye,
  ClipboardCheck,
  LineChart,
  Radar,
  Sparkles,
  Settings,
  LogOut,
  ChevronsUpDown,
  User,
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
  {
    key: "insight",
    label: "GH7 Insight",
    icon: Eye,
    href: "/dashboard/insight",
  },
  {
    key: "audit",
    label: "GH7 Audit",
    icon: ClipboardCheck,
    href: "/dashboard/audit",
  },
  {
    key: "tracker",
    label: "GH7 Tracker",
    icon: LineChart,
    href: "/dashboard/tracker",
  },
  { key: "radar", label: "GH7 Radar", icon: Radar, href: "/dashboard/radar" },
  {
    key: "advisor",
    label: "GH7 Advisor",
    icon: Sparkles,
    href: "/dashboard/advisor",
  },
  {
    key: "studio",
    label: "GH7 Studio",
    icon: Settings,
    href: "/dashboard/studio",
  },
];

function getInitial(profile: Props["profile"]): string {
  const isSyntheticEmail =
    !!profile.email &&
    profile.email.startsWith("phone_") &&
    profile.email.endsWith("@gh7.ai");
  if (profile.email && !isSyntheticEmail) {
    return profile.email[0]!.toUpperCase();
  }
  if (profile.phone) {
    return profile.phone[profile.phone.length - 1] ?? "U";
  }
  return "U";
}

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
    // ignore — redirect anyway
  }
  window.location.href = "/";
}

export function AppSidebar({ profile, brands, activeBrandId }: Props) {
  const pathname = usePathname();
  const planLabel = getPlanLabel(profile.plan);
  const displayName = getDisplayName(profile);
  const initials = getInitial(profile);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-2 py-1.5"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black text-white font-bold text-sm">
                G7
              </div>
              <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="font-semibold text-sm tracking-tight">
                  GH7
                </span>
                <span className="text-xs text-muted-foreground">
                  {planLabel}
                </span>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Araçlar</SidebarGroupLabel>
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
                    >
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
            <SidebarGroupLabel>Markalar ({brands.length})</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {brands.map((brand) => (
                  <SidebarMenuItem key={brand.id}>
                    <SidebarMenuButton
                      isActive={brand.id === activeBrandId}
                      tooltip={brand.name}
                      render={<Link href={`/dashboard?brand=${brand.id}`} />}
                    >
                      <div className="flex aspect-square size-5 items-center justify-center rounded bg-muted text-[10px] font-semibold">
                        {brand.name[0]?.toUpperCase() || "B"}
                      </div>
                      <span className="truncate">{brand.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent"
                  />
                }
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black text-white text-sm font-semibold">
                  {initials}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {planLabel} üyelik
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[240px]"
              >
                <DropdownMenuItem
                  render={<Link href="/dashboard/studio" />}
                  className="flex items-center gap-2"
                >
                  <User className="size-4" />
                  Hesap ayarları
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="size-4" />
                  Çıkış
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
