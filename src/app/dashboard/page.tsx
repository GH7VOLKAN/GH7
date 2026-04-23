/**
 * /dashboard — Kinde estetiği editorial home (Brief F Adım 1.4)
 *
 * Server component: fetch + render DashboardHome (client, motion).
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { DashboardHome } from "./_components/dashboard-home";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ brand?: string }>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/analiz");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });
  if (!profile) redirect("/analiz");

  const brands = await prisma.brand.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    include: {
      scans: {
        orderBy: { completedAt: "desc" },
        take: 2, // trend için
      },
    },
  });

  if (brands.length === 0) redirect("/analiz");

  const activeBrand =
    brands.find((b) => b.id === params.brand) || brands[0];

  return (
    <DashboardHome profile={profile} brand={activeBrand} brands={brands} />
  );
}
