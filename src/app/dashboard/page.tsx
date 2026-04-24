/**
 * /dashboard — Default brand'a redirect (Brief H-ext Aşama 1).
 *
 * Yeni URL mimarisi: /dashboard/[brandSlug] marka-spesifik dashboard.
 * Root /dashboard kullanıcıyı en son brand'a yönlendirir.
 *
 * Eski ?brand=X query param'ı backward-compat olarak yakalanır,
 * brandId → slug çevirisi yapılır.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ brand?: string; legacy?: string }>;

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

  const brands = await prisma.brand.findMany({
    where: { profileId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true },
  });
  if (brands.length === 0) redirect("/analiz");

  // ?brand=X legacy param → slug'a çevir
  const legacyBrand = params.brand
    ? brands.find((b) => b.id === params.brand)
    : null;
  const target = legacyBrand ?? brands[0];

  // Middleware'den gelen legacy path: /dashboard?legacy=audit/cmo...
  const legacySection = params.legacy ?? "";
  const sectionTail = legacySection ? `/${legacySection}` : "";

  redirect(`/dashboard/${target.slug}${sectionTail}`);
}
