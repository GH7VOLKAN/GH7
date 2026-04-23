"use client";

/**
 * DashboardHeader — minimal editorial header (Brief F Adım 1.5)
 *
 * - Hamburger (SidebarTrigger)
 * - Breadcrumb: "Dashboard / Insight" düz metin, slash separator
 * - Sağda BrandSwitcher (subtle)
 */

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BrandSwitcher } from "./brand-switcher";

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
  activeBrand: Brand;
};

const PATH_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  insight: "Insight",
  audit: "Audit",
  tracker: "Tracker",
  radar: "Radar",
  advisor: "Advisor",
  studio: "Studio",
  pro: "Pro",
};

export function DashboardHeader({ brands, activeBrand }: Props) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = PATH_LABELS[seg] || seg;
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 px-4 md:px-6">
      <SidebarTrigger className="-ml-1 size-8" />

      <nav className="flex items-center gap-2 text-sm tracking-tight">
        {crumbs.map((crumb, idx) => (
          <span key={crumb.href} className="flex items-center gap-2">
            {idx > 0 && (
              <span aria-hidden className="text-muted-foreground/50">
                /
              </span>
            )}
            {crumb.isLast ? (
              <span className="font-medium text-foreground">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <BrandSwitcher brands={brands} activeBrand={activeBrand} />
      </div>
    </header>
  );
}
