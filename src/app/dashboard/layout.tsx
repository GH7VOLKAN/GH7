/**
 * /dashboard — shadcn SidebarProvider layout (Brief E + H-ext Aşama 1).
 *
 * Profile + Brands tek seferlik server-side fetch; sidebar + header
 * tüm alt sayfalarda (/dashboard/[brandSlug]/*, /dashboard/studio) ortak.
 *
 * activeBrandSlug pathname'den client-side derive edilir (AppSidebar).
 * Burada sadece brands listesi + default slug sağlıyoruz.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./_components/app-sidebar";
import { DashboardHeader } from "./_components/dashboard-header";

export const dynamic = "force-dynamic";

async function getSessionAndData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });
  if (!profile) return null;

  const brands = await prisma.brand.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      gate: true,
      domain: true,
      createdAt: true,
    },
  });

  return { profile, brands };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getSessionAndData();
  if (!data) redirect("/analiz");

  const { profile, brands } = data;
  if (brands.length === 0) redirect("/analiz");

  const defaultBrand = brands[0];

  return (
    <SidebarProvider>
      <div className="font-geist flex min-h-svh w-full">
        <AppSidebar
          profile={{
            email: profile.email,
            phone: profile.phone,
            plan: profile.plan,
          }}
          brands={brands}
          defaultBrandSlug={defaultBrand.slug}
        />
        <SidebarInset>
          <DashboardHeader
            profile={{
              email: profile.email,
              phone: profile.phone,
              plan: profile.plan,
            }}
            brands={brands}
            defaultBrand={defaultBrand}
          />
          <Separator />
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
