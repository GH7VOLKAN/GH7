"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";

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
  SunIcon,
  MoonIcon,
  LogOutIcon,
} from "lucide-react";

const navItems = [
  {
    title: "Genel Bakış",
    href: "/dashboard/genel",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Promptlar",
    href: "/dashboard/promptlar",
    icon: <MessageSquareTextIcon />,
  },
  {
    title: "Kaynaklar",
    href: "/dashboard/kaynaklar",
    icon: <LinkIcon />,
  },
  {
    title: "Rakipler",
    href: "/dashboard/rakipler",
    icon: <UsersIcon />,
  },
  {
    title: "Site Analizi",
    href: "/dashboard/site",
    icon: <GlobeIcon />,
  },
  {
    title: "Aksiyon Planı",
    href: "/dashboard/aksiyon",
    icon: <ListChecksIcon />,
  },
];

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <SidebarMenuButton
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      <span>{theme === "dark" ? "Açık Tema" : "Koyu Tema"}</span>
    </SidebarMenuButton>
  );
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: { name: string; email: string };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?";

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
              <GH7Logo size="lg" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigasyon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
                <ThemeToggleButton />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Çıkış Yap">
                  <LogOutIcon />
                  <span>Çıkış Yap</span>
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
              <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-xs font-bold text-background">
                {initial}
              </div>
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
