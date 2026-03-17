"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { GH7Logo } from "@/components/gh7-logo";
import { createClient } from "@/lib/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
  ChevronDownIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  XCircleIcon,
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

// ── Status icon helper ──────────────────────────────────
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "complete":
      return <CheckCircle2Icon className="size-3.5 shrink-0 text-emerald-500" />;
    case "warning":
      return <AlertTriangleIcon className="size-3.5 shrink-0 text-amber-500" />;
    default:
      return <XCircleIcon className="size-3.5 shrink-0 text-red-400" />;
  }
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
  checklistSummary,
  topCompetitor,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const navItems = getNavItems(brandType);
  const isFree = plan === "free";

  // Gelişim Planı tree expand/collapse
  const isGelisimPage = pathname === "/dashboard/gelisim";
  const [gelisimOpen, setGelisimOpen] = React.useState(isGelisimPage);

  React.useEffect(() => {
    if (isGelisimPage) setGelisimOpen(true);
  }, [isGelisimPage]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?";
  const hasChecklist = checklistSummary && checklistSummary.total > 0;
  const completedCount = checklistSummary?.completed ?? 0;
  const totalCount = checklistSummary?.total ?? 0;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* ── Logo + Plan badge ─────────────────────────── */}
      <SidebarHeader className="px-5 pt-5 pb-2">
        <Link href="/dashboard/genel" className="flex items-center gap-2">
          <GH7Logo size="default" />
          {isFree && (
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Free
            </span>
          )}
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

        {/* ── Gelişim Planı Tree ─────────────────────── */}
        {hasChecklist && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Gelişim Planı"
                    isActive={isGelisimPage}
                    onClick={() => setGelisimOpen(!gelisimOpen)}
                    className={`rounded-xl text-[13px] font-medium ${
                      isGelisimPage ? "bg-[#f5f5f5] font-semibold" : ""
                    }`}
                  >
                    <ListChecksIcon className="size-[18px]" />
                    <span className="flex-1">Gelişim</span>
                    <ChevronDownIcon
                      className={`size-4 text-muted-foreground transition-transform duration-200 ${
                        gelisimOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </SidebarMenuButton>
                  <SidebarMenuBadge>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {completedCount}/{totalCount}
                    </span>
                  </SidebarMenuBadge>

                  {/* Mini progress bars when collapsed */}
                  {!gelisimOpen && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5">
                      {[1, 2, 3, 4].map((week) => {
                        const weekPct = Math.min(
                          100,
                          Math.round(
                            (completedCount / Math.max(totalCount, 1)) * 100 * (week / 4)
                          )
                        );
                        return (
                          <div key={week} className="flex-1">
                            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-foreground/60 transition-all duration-500"
                                style={{ width: `${weekPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tree layers */}
                  {gelisimOpen && (
                    <SidebarMenuSub>
                      {checklistSummary!.layers.map((layer) => (
                        <React.Fragment key={layer.layer}>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              size="sm"
                              render={
                                <Link
                                  href={`/dashboard/gelisim?layer=${layer.layer}`}
                                />
                              }
                              isActive={
                                isGelisimPage &&
                                searchParams.get("layer") === String(layer.layer)
                              }
                              className="font-semibold text-[11px] uppercase tracking-wide text-muted-foreground"
                            >
                              <span className="flex-1 truncate">{layer.name}</span>
                              <span className="text-[10px] tabular-nums font-normal">
                                {layer.completed}/{layer.total}
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>

                          {layer.items.map((item) => (
                            <SidebarMenuSubItem key={item.id}>
                              <SidebarMenuSubButton
                                size="sm"
                                render={
                                  <Link
                                    href={`/dashboard/gelisim?item=${item.itemNumber}`}
                                  />
                                }
                                isActive={
                                  isGelisimPage &&
                                  searchParams.get("item") === item.itemNumber
                                }
                              >
                                <StatusIcon status={item.status} />
                                <span className="flex-1 truncate text-xs">
                                  {item.simpleTitle}
                                </span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* ── Pro CTA card (free users) ───────────────── */}
        {isFree && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div
                className="mx-2 rounded-2xl border border-border p-4 text-center"
                style={{ background: "#fafafa" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Ücretsiz Plan
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Haftalık takip ve trend analizi
                </p>
                <Link
                  href="/dashboard/ayarlar"
                  className="mt-3 inline-block rounded-full bg-foreground px-5 py-1.5 text-[11px] font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  Pro&apos;ya Geç
                </Link>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* ── Bottom nav ──────────────────────────────── */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
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
