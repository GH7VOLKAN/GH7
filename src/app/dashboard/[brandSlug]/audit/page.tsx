/**
 * /dashboard/[brandSlug]/audit — 43 maddelik AI denetim liste
 * (Brief G Aşama 4 + Brief H-ext Aşama 1).
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { AuditListView } from "./_components/audit-list-view";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandSlug: string }>;

export default async function AuditPage({
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
    select: { id: true, slug: true, name: true, domain: true },
  });
  if (!brand) redirect("/dashboard");

  const latestAudit = await prisma.audit.findFirst({
    where: { brandId: brand.id, profileId: user.id },
    orderBy: { startedAt: "desc" },
    include: {
      items: { orderBy: { itemIndex: "asc" } },
    },
  });

  return (
    <AuditListView brand={brand} audit={latestAudit} />
  );
}
