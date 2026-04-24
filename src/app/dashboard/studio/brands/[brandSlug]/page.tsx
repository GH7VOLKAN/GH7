/**
 * /dashboard/studio/brands/[brandSlug] — Marka detay + CRUD
 * (Brief H-polish Aşama 2).
 *
 * Görüntüleme:
 * - Marka alanları (düzenlenebilir: name, sector, city, domain)
 * - Takip edilen sorgular (salt okunur — sorgu düzenleme Brief N)
 * - Rakipler (ekle/sil, max 10; primary max 3)
 * - Tehlikeli bölge: marka silme
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { BrandDetailView } from "./_components/brand-detail-view";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandSlug: string }>;

export default async function StudioBrandDetailPage({
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
    include: {
      prompts: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, text: true },
      },
      competitors: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          domain: true,
          isPrimary: true,
          source: true,
        },
      },
    },
  });
  if (!brand) redirect("/dashboard/studio");

  return (
    <BrandDetailView
      brand={{
        id: brand.id,
        slug: brand.slug,
        name: brand.name,
        domain: brand.domain,
        sector: brand.sector,
        city: brand.city,
        gate: brand.gate,
        createdAt: brand.createdAt,
      }}
      prompts={brand.prompts}
      competitors={brand.competitors.map((c) => ({
        id: c.id,
        name: c.name,
        domain: c.domain,
        isPrimary: c.isPrimary,
        source: c.source,
      }))}
    />
  );
}
