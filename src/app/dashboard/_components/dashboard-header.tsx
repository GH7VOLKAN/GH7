"use client";

/**
 * DashboardHeader — breadcrumb + brand switcher (Brief F + H-ext Aşama 1).
 *
 * URL yapısı: /dashboard/[brandSlug]/[...]
 * Breadcrumb: "Dashboard / [BrandName] / [Section]"
 */

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BrandSwitcher } from "./brand-switcher";

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
  defaultBrand: Brand;
};

const SECTION_LABELS: Record<string, string> = {
  insight: "Insight",
  audit: "Audit",
  tracker: "Tracker",
  radar: "Radar",
  advisor: "Advisor",
  studio: "Studio",
  pro: "Pro",
};

export function DashboardHeader({ brands, defaultBrand }: Props) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  // segments örnek: ["dashboard", "idavilla-bungalov-evleri", "insight"]
  // veya ["dashboard", "studio"]

  const brandSlug = segments[1];
  const brandScoped =
    brandSlug && brands.find((b) => b.slug === brandSlug);
  const activeBrand = brandScoped || defaultBrand;
  const section = brandScoped ? segments[2] : segments[1]; // studio / pro durumu

  const crumbs: Array<{ label: string; href: string | null }> = [
    { label: "Dashboard", href: `/dashboard/${activeBrand.slug}` },
  ];
  if (brandScoped) {
    crumbs.push({
      label: activeBrand.name,
      href: `/dashboard/${activeBrand.slug}`,
    });
  }
  if (section) {
    const sectionLabel = SECTION_LABELS[section] ?? section;
    crumbs.push({ label: sectionLabel, href: null });
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 px-4 md:px-6">
      <SidebarTrigger className="-ml-1 size-8" />

      <nav className="flex min-w-0 items-center gap-2 text-sm tracking-tight">
        {crumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-2">
            {idx > 0 && (
              <span aria-hidden className="text-muted-foreground/50">
                /
              </span>
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate font-medium text-foreground">
                {crumb.label}
              </span>
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
