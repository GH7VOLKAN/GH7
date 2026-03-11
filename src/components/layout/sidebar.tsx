"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { GH7Logo } from "@/components/gh7-logo";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

const navItems = [
  { href: "/dashboard/genel", label: "Genel Bakış" },
  { href: "/dashboard/promptlar", label: "Promptlar" },
  { href: "/dashboard/kaynaklar", label: "Kaynaklar" },
  { href: "/dashboard/rakipler", label: "Rakipler" },
  { href: "/dashboard/site", label: "Site Analizi" },
  { href: "/dashboard/aksiyon", label: "Aksiyon Planı" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[240px] lg:fixed lg:inset-y-0 lg:left-0 border-r border-border bg-background-secondary">
      <div className="flex items-center gap-2 px-6 py-5">
        <GH7Logo size="default" />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3 space-y-0.5">
        <Link
          href="/dashboard/ayarlar"
          className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === "/dashboard/ayarlar"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-background"
          }`}
        >
          Ayarlar
        </Link>
        <div className="px-3 py-2">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
