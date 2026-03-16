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
  SidebarGroupLabel,
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
  LockIcon,
  ChevronDownIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  XCircleIcon,
  ClipboardListIcon,
} from "lucide-react";
import type { ChecklistSummary } from "@/lib/dal/checklist";

type BrandType = "firma" | "kisisel";

// Pages locked for free plan
const FREE_LOCKED_PATHS = new Set([
  "/dashboard/rakipler",
  "/dashboard/site",
  "/dashboard/aksiyon",
]);

function getNavItems(brandType: BrandType) {
  return [
    {
      title: "Genel Bakis",
      href: "/dashboard/genel",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Sorular",
      href: "/dashboard/promptlar",
      icon: <MessageSquareTextIcon />,
    },
    {
      title: brandType === "kisisel" ? "Dijital Iz" : "Kaynaklar",
      href: "/dashboard/kaynaklar",
      icon: <LinkIcon />,
    },
    {
      title: brandType === "kisisel" ? "Senin Yerine Kim" : "Rakipler",
      href: "/dashboard/rakipler",
      icon: <UsersIcon />,
    },
    {
      title: brandType === "kisisel" ? "Dijital Kontrol" : "Site Kontrolu",
      href: "/dashboard/site",
      icon: <GlobeIcon />,
    },
    {
      title: "Aksiyon Plani",
      href: "/dashboard/aksiyon",
      icon: <ListChecksIcon />,
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
    case "locked":
      return <LockIcon className="size-3.5 shrink-0 text-muted-foreground/40" />;
    case "missing":
    default:
      return <XCircleIcon className="size-3.5 shrink-0 text-red-400" />;
  }
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: { name: string; email: string; avatarUrl?: string | null };
  brandType?: BrandType;
  plan?: string;
  checklistSummary?: ChecklistSummary | null;
}

export function AppSidebar({
  user,
  brandType = "firma",
  plan = "free",
  checklistSummary,
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

  // Sync open state when navigating to/from gelisim
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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:!p-2 [&_svg]:!size-auto"
              render={<Link href="/dashboard/genel" />}
            >
              <GH7Logo size="default" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigasyon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isLocked = isFree && FREE_LOCKED_PATHS.has(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={pathname === item.href}
                      render={<Link href={item.href} />}
                    >
                      {item.icon}
                      <span className="flex-1">{item.title}</span>
                      {isLocked && (
                        <LockIcon className="size-3.5 text-muted-foreground/50" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Gelişim Planı Tree ─────────────────────────── */}
        {hasChecklist && (
          <SidebarGroup>
            <SidebarGroupLabel>Gelisim</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Gelisim Plani"
                    isActive={isGelisimPage}
                    onClick={() => setGelisimOpen(!gelisimOpen)}
                    className="group/gelisim"
                  >
                    <ClipboardListIcon />
                    <span className="flex-1">Gelisim Plani</span>
                    <ChevronDownIcon
                      className={`size-4 text-muted-foreground transition-transform duration-200 ${
                        gelisimOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </SidebarMenuButton>
                  <SidebarMenuBadge>
                    <span className="text-[10px] tabular-nums">
                      {completedCount}/{totalCount}
                    </span>
                  </SidebarMenuBadge>

                  {/* Tree layers */}
                  {gelisimOpen && (
                    <SidebarMenuSub>
                      {checklistSummary!.layers.map((layer) => {
                        const isLayer3Locked = isFree && layer.layer === 3;
                        return (
                          <React.Fragment key={layer.layer}>
                            {/* Layer header */}
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
                                  searchParams.get("layer") ===
                                    String(layer.layer)
                                }
                                className="font-semibold text-[11px] uppercase tracking-wide text-muted-foreground"
                              >
                                <span className="flex-1 truncate">
                                  {isLayer3Locked
                                    ? `${layer.name} 🔒`
                                    : layer.name}
                                </span>
                                <span className="text-[10px] tabular-nums font-normal">
                                  {isLayer3Locked
                                    ? "Pro"
                                    : `${layer.completed}/${layer.total}`}
                                </span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>

                            {/* Layer items */}
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
                                    searchParams.get("item") ===
                                      item.itemNumber
                                  }
                                  className={
                                    item.status === "locked"
                                      ? "opacity-40"
                                      : ""
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
                        );
                      })}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Plan badge */}
        {isFree && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="mx-2 rounded-lg border border-border bg-foreground/5 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Ucretsiz Plan
                </p>
                <Link
                  href="/dashboard/ayarlar"
                  className="mt-2 inline-block rounded-md bg-foreground px-3 py-1.5 text-[11px] font-bold text-background transition-transform hover:scale-[1.02]"
                >
                  Pro&apos;ya Gec
                </Link>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Secondary nav at bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Ayarlar"
                  isActive={pathname === "/dashboard/ayarlar"}
                  render={<Link href="/dashboard/ayarlar" />}
                >
                  <Settings2Icon />
                  <span>Ayarlar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Cikis Yap">
                  <LogOutIcon />
                  <span>Cikis Yap</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="size-8 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-xs font-bold text-background">
                  {initial}
                </div>
              )}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name ?? "Demo"}</span>
                <span className="truncate text-xs text-foreground/70">
                  {user?.email ?? "demo@gh7.ai"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
