/**
 * /dashboard/[brandSlug]/audit/[itemCode] — Madde detay sayfası
 * (Brief G Aşama 4 + Brief H-ext Aşama 1).
 */

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { AuditItemView } from "./_components/audit-item-view";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandSlug: string; itemCode: string }>;

export default async function AuditItemPage({
  params,
}: {
  params: Params;
}) {
  const { brandSlug, itemCode } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/analiz");

  const brand = await prisma.brand.findFirst({
    where: { profileId: user.id, slug: brandSlug },
    select: { id: true, slug: true },
  });
  if (!brand) redirect("/dashboard");

  // En son audit (completed / awaiting-opus / generating — partial detayda görünsün)
  const audit = await prisma.audit.findFirst({
    where: {
      brandId: brand.id,
      profileId: user.id,
      status: { in: ["completed", "awaiting-opus", "generating"] },
    },
    orderBy: { startedAt: "desc" },
    include: { items: { orderBy: { itemIndex: "asc" } } },
  });

  if (!audit) redirect(`/dashboard/${brandSlug}/audit`);

  const currentItem = audit.items.find((i) => i.itemCode === itemCode);
  if (!currentItem) notFound();

  const currentIdx = audit.items.findIndex((i) => i.itemCode === itemCode);
  const prevItem = currentIdx > 0 ? audit.items[currentIdx - 1] : null;
  const nextItem =
    currentIdx < audit.items.length - 1 ? audit.items[currentIdx + 1] : null;

  return (
    <AuditItemView
      auditId={audit.id}
      brandSlug={brand.slug}
      item={currentItem}
      prevCode={prevItem?.itemCode ?? null}
      nextCode={nextItem?.itemCode ?? null}
      totalItems={audit.items.length}
    />
  );
}
