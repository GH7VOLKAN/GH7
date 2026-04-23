/**
 * /dashboard/audit — 43 maddelik AI denetim liste (Brief G Aşama 4).
 *
 * Static route: /dashboard/[slug] dinamik rotasından önce gelir
 * (Next.js static route priority). audit slug'ı bu sayfayı render eder,
 * coming-soon yerine gerçek GH7 Audit UI'ı görünür.
 *
 * Akış:
 * - activeBrand için en son Audit + AuditItem[]
 * - Hiç audit yoksa: Empty state (Denetim Başlat CTA)
 * - Pipeline devam ediyorsa: loading/polling (Aşama 5'te)
 * - Completed: 43 madde liste
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { AuditListView } from "./_components/audit-list-view";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ brand?: string }>;

async function getAuditData(userId: string, brandIdParam?: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!profile) return null;

  const brands = await prisma.brand.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, domain: true },
  });
  if (brands.length === 0) return null;

  const activeBrand =
    (brandIdParam && brands.find((b) => b.id === brandIdParam)) || brands[0];

  const latestAudit = await prisma.audit.findFirst({
    where: { brandId: activeBrand.id, profileId: profile.id },
    orderBy: { startedAt: "desc" },
    include: {
      items: { orderBy: { itemIndex: "asc" } },
    },
  });

  return { activeBrand, audit: latestAudit };
}

export default async function AuditPage({
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

  const data = await getAuditData(user.id, params.brand);
  if (!data) redirect("/analiz");

  return <AuditListView brand={data.activeBrand} audit={data.audit} />;
}
