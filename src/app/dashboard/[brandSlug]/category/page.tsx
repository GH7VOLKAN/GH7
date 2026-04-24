/**
 * /dashboard/[brandSlug]/category — Kategori Hakimiyeti detay sayfası
 * (Brief N v4 Aşama 8).
 *
 * 10 kategori sorgusu × 5 platform × 3 adım funnel sonuçlarını gösterir.
 * Her sorgu için per-platform foundAtStep/rank/points + competitors +
 * sources preview.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { CategoryDominanceView } from "./_components/category-dominance-view";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandSlug: string }>;

export default async function CategoryDominancePage({
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
    select: { id: true, slug: true, name: true },
  });
  if (!brand) redirect("/dashboard");

  // CATEGORY sorgular — hepsi (kilitli olanlar dahil, UI'da durumu gösterir)
  const queries = await prisma.trackedQuery.findMany({
    where: { brandId: brand.id, category: "CATEGORY", archivedAt: null },
    orderBy: { orderIndex: "asc" },
    include: {
      trackingResults: {
        orderBy: { checkedAt: "desc" },
        take: 5, // en son 5 (5 platform × 1 run)
      },
    },
  });

  const summaries = queries.map((q) => {
    const byPlatform = new Map<
      string,
      {
        platform: string;
        foundAtStep: number | null;
        rank: number | null;
        points: number;
        competitors: string[];
      }
    >();

    for (const r of q.trackingResults) {
      if (byPlatform.has(r.platform)) continue; // en son olan yeterli
      const comps = Array.isArray(r.competitors)
        ? (r.competitors as Array<{ name?: string }>)
            .map((c) => c?.name)
            .filter((n): n is string => typeof n === "string" && n.length > 0)
        : [];
      byPlatform.set(r.platform, {
        platform: r.platform,
        foundAtStep: r.foundAtStep,
        rank: r.rank,
        points: r.points ?? 0,
        competitors: comps,
      });
    }

    const platformResults = Array.from(byPlatform.values());
    const totalPoints = platformResults.reduce((acc, p) => acc + p.points, 0);
    const maxPossible = platformResults.length * 5;

    return {
      id: q.id,
      orderIndex: q.orderIndex,
      difficulty: q.difficulty,
      unlockedAt: q.unlockedAt,
      step1: q.step1Query ?? "",
      step2: q.step2Query ?? "",
      step3: q.step3Query ?? "",
      platformResults,
      totalPoints,
      maxPossible,
    };
  });

  return (
    <CategoryDominanceView
      brand={{ slug: brand.slug, name: brand.name }}
      queries={summaries}
    />
  );
}
