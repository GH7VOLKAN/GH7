/**
 * /dashboard/audit/[itemCode] — Madde detay sayfası (Brief G Aşama 4).
 *
 * En son tamamlanmış audit'i bul → itemCode'u eşleştir → detay render.
 * Önceki/sonraki navigation için itemIndex kullanılır.
 */

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { AuditItemView } from "./_components/audit-item-view";

export const dynamic = "force-dynamic";

type Params = Promise<{ itemCode: string }>;
type SearchParams = Promise<{ brand?: string }>;

export default async function AuditItemPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { itemCode } = await params;
  const { brand: brandIdParam } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/analiz");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true },
  });
  if (!profile) redirect("/analiz");

  const brands = await prisma.brand.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });
  if (brands.length === 0) redirect("/analiz");

  const activeBrand =
    (brandIdParam && brands.find((b) => b.id === brandIdParam)) || brands[0];

  const audit = await prisma.audit.findFirst({
    where: { brandId: activeBrand.id, profileId: profile.id, status: "completed" },
    orderBy: { completedAt: "desc" },
    include: { items: { orderBy: { itemIndex: "asc" } } },
  });

  if (!audit) redirect("/dashboard/audit");

  const currentItem = audit.items.find((i) => i.itemCode === itemCode);
  if (!currentItem) notFound();

  const currentIdx = audit.items.findIndex((i) => i.itemCode === itemCode);
  const prevItem = currentIdx > 0 ? audit.items[currentIdx - 1] : null;
  const nextItem =
    currentIdx < audit.items.length - 1 ? audit.items[currentIdx + 1] : null;

  return (
    <AuditItemView
      auditId={audit.id}
      item={currentItem}
      prevCode={prevItem?.itemCode ?? null}
      nextCode={nextItem?.itemCode ?? null}
      totalItems={audit.items.length}
    />
  );
}
