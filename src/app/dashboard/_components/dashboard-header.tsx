"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  insight: "GH7 Insight",
  audit: "GH7 Audit",
  tracker: "GH7 Tracker",
  radar: "GH7 Radar",
  advisor: "GH7 Advisor",
  studio: "GH7 Studio",
  pro: "Pro",
};

export function DashboardHeader({ brands, activeBrand }: Props) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Breadcrumb: Dashboard > [current] ...
  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = PATH_LABELS[seg] || seg;
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb) => (
            <div key={crumb.href} className="flex items-center gap-2">
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!crumb.isLast && <BreadcrumbSeparator />}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-3">
        <BrandSwitcher brands={brands} activeBrand={activeBrand} />
      </div>
    </header>
  );
}
