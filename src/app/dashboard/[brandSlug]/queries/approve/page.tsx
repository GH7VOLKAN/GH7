/**
 * /dashboard/[brandSlug]/queries/approve — Sorgu onay ekranı
 * (Brief N v4 Aşama 7).
 *
 * Markanın TrackedQuery'si yoksa onboarding akışının parçası olarak
 * açılır. Qwen ile 10 niş + 10 kategori funnel üretir, kullanıcı
 * düzenleyip onaylar. Onay sonrası dashboard'a yönlendirir.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { QueryApprovalView } from "./_components/query-approval-view";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandSlug: string }>;

export default async function QueryApprovalPage({
  params,
}: {
  params: Params;
}) {
  const { brandSlug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/analiz");

  const brand = await prisma.brand.findFirst({
    where: { profileId: user.id, slug: brandSlug },
    select: { id: true, slug: true, name: true, sector: true, city: true },
  });
  if (!brand) redirect("/dashboard");

  const existingCount = await prisma.trackedQuery.count({
    where: { brandId: brand.id, archivedAt: null },
  });

  return (
    <QueryApprovalView
      brand={{ slug: brand.slug, name: brand.name }}
      hasExistingQueries={existingCount > 0}
    />
  );
}
