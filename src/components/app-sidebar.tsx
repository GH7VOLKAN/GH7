"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import { GH7Logo } from "@/components/gh7-logo";
import { createClient } from "@/lib/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  LinkIcon,
  UsersIcon,
  GlobeIcon,
  ListChecksIcon,
  Settings2Icon,
  LogOutIcon,
  SparklesIcon,
} from "lucide-react";
import type { ChecklistSummary } from "@/lib/dal/checklist";

type BrandType = "firma" | "kisisel";

function getNavItems(brandType: BrandType) {
  return [
    {
      title: "Genel Bakış",
      href: "/dashboard/genel",
      icon: <LayoutDashboardIcon className="size-[18px]" />,
    },
    {
      title: "Sorular",
      href: "/dashboard/promptlar",
      icon: <MessageSquareTextIcon className="size-[18px]" />,
    },
    {
      title: brandType === "kisisel" ? "Dijital İz" : "Kaynaklar",
      href: "/dashboard/kaynaklar",
      icon: <LinkIcon className="size-[18px]" />,
    },
    {
      title: brandType === "kisisel" ? "Senin Yerine Kim" : "Rakipler",
      href: "/dashboard/rakipler",
      icon: <UsersIcon className="size-[18px]" />,
    },
    {
      title: brandType === "kisisel" ? "Dijital Kontrol" : "Site Kontrolü",
      href: "/dashboard/site",
      icon: <GlobeIcon className="size-[18px]" />,
    },
    {
      title: "Gelişim Planı",
      href: "/dashboard/gelisim",
      icon: <ListChecksIcon className="size-[18px]" />,
    },
  ];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: { name: string; email: string; avatarUrl?: string | null };
  brandType?: BrandType;
  plan?: string;
  checklistSummary?: ChecklistSummary | null;
  topCompetitor?: { name: string; score: number } | null;
}

export function AppSidebar({
  user,
  brandType = "firma",
  plan = "free",
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = getNavItems(brandType);
  const isFree = plan === "free";
  const isPro = plan === "pro";
  const isBusiness = plan === "business";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  // Plan-aware CTA config
  const ctaConfig = isFree
    ? {
        badge: "Free",
        label: "Ücretsiz Plan",
        desc: "Haftalık takip ve trend analizi",
        buttonText: "Pro'ya Geç",
        href: "/dashboard/ayarlar",
      }
    : isPro
    ? {
        badge: "Pro",
        label: "Pro Plan",
        desc: "Daha fazla marka ve gelişmiş analiz",
        buttonText: "Business'a Geç",
        href: "/dashboard/ayarlar",
      }
    : {
        badge: "Business",
        label: "Business Plan",
        desc: "Tüm özellikler aktif",
        buttonText: "Planlar",
        href: "/dashboard/ayarlar",
      };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* ── Logo + Plan badge ─────────────────────────── */}
      <SidebarHeader className="px-5 pt-5 pb-2">
        <Link href="/dashboard/genel" className="flex items-center gap-2">
          <GH7Logo size="default" />
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              isBusiness
                ? "bg-emerald-100 text-emerald-700"
                : isPro
                ? "bg-amber-100 text-amber-700"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {ctaConfig.badge}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* ── Navigation ──────────────────────────────── */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      render={<Link href={item.href} />}
                      className={`rounded-xl text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-[#f5f5f5] text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-[#f5f5f5] hover:text-foreground"
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Plan CTA card ───────────────────────────── */}
        {!isBusiness && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div
                className="mx-2 rounded-2xl border border-border p-4 text-center"
                style={{ background: "#fafafa" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  {ctaConfig.label}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {ctaConfig.desc}
                </p>
                <Link
                  href={ctaConfig.href}
                  className="mt-3 inline-block rounded-full bg-foreground px-5 py-1.5 text-[11px] font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  {ctaConfig.buttonText}
                </Link>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Business planında Planlar kartı */}
        {isBusiness && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div
                className="mx-2 rounded-2xl border border-emerald-200 p-4 text-center"
                style={{ background: "#f0fdf4" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                  Business Plan
                </p>
                <p className="mt-1 text-[11px] text-emerald-600">
                  Tüm özellikler aktif
                </p>
                <Link
                  href="/dashboard/ayarlar"
                  className="mt-3 inline-block rounded-full bg-emerald-700 px-5 py-1.5 text-[11px] font-bold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  Planlar
                </Link>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* ── Bottom nav ──────────────────────────────── */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Ücretli Paketler */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Ücretli Paketler"
                  isActive={pathname === "/dashboard/paketler"}
                  render={<Link href="/dashboard/paketler" />}
                  className={`rounded-xl text-[13px] font-medium ${
                    pathname === "/dashboard/paketler"
                      ? "bg-[#f5f5f5] font-semibold"
                      : "text-muted-foreground hover:bg-[#f5f5f5] hover:text-foreground"
                  }`}
                >
                  <SparklesIcon className="size-[18px]" />
                  <span>Ücretli Paketler</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Ayarlar */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Ayarlar"
                  isActive={pathname === "/dashboard/ayarlar"}
                  render={<Link href="/dashboard/ayarlar" />}
                  className={`rounded-xl text-[13px] font-medium ${
                    pathname === "/dashboard/ayarlar"
                      ? "bg-[#f5f5f5] font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  <Settings2Icon className="size-[18px]" />
                  <span>Ayarlar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip="Çıkış Yap"
                  className="rounded-xl text-[13px] font-medium text-muted-foreground"
                >
                  <LogOutIcon className="size-[18px]" />
                  <span>Çıkış Yap</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── User footer ───────────────────────────────── */}
      <SidebarFooter className="px-4 pb-4">
        <div className="flex items-center gap-2.5">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="size-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
              {initial}
            </div>
          )}
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-[13px] font-medium">{user?.name ?? "Demo"}</span>
            <span className="truncate text-[11px] text-muted-foreground">
              {user?.email ?? "demo@gh7.ai"}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
