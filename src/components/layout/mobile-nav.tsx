"use client";

import { useState } from "react";
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

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <GH7Logo />
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] border rounded-lg border-border"
        >
          {open ? "Kapat" : "Menü"}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 top-[53px] z-40 bg-background">
          <nav className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-border mt-4 pt-4">
              <Link
                href="/dashboard/ayarlar"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Ayarlar
              </Link>
              <div className="px-4 py-2">
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
