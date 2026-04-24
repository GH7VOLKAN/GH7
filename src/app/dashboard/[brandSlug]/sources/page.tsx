/**
 * /dashboard/[brandSlug]/sources — Kaynak Hakimiyeti sayfası
 * (Brief N v4 Aşama 8).
 *
 * AI'ın kategori sorgularda referans aldığı tüm kaynaklar. 3 kova:
 *  - Var olduğun kaynaklar (mentionsBrand=true)
 *  - Zayıf varlık (neutral — hiçbir marka yok)
 *  - Eksik kaynaklar (rakipler var, markanı yok — KRİTİK)
 *
 * Her kaynak için domain + en son keşif + rakiplerin listesi.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { SourceDominanceView } from "./_components/source-dominance-view";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandSlug: string }>;

export default async function SourceDominancePage({
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

  const sources = await prisma.sourceAnalysis.findMany({
    where: { brandId: brand.id },
    orderBy: [{ mentionsBrand: "asc" }, { updatedAt: "desc" }],
  });

  // Kategorize
  const present: typeof sources = [];
  const weak: typeof sources = [];
  const missing: typeof sources = [];
  const unreachable: typeof sources = [];

  for (const s of sources) {
    if (s.status === "unreachable") {
      unreachable.push(s);
      continue;
    }
    if (s.mentionsBrand) {
      present.push(s);
      continue;
    }
    const competitorsArr = Array.isArray(s.mentionedCompetitors)
      ? (s.mentionedCompetitors as string[])
      : [];
    if (competitorsArr.length > 0) {
      missing.push(s);
    } else {
      weak.push(s);
    }
  }

  return (
    <SourceDominanceView
      brand={{ slug: brand.slug, name: brand.name }}
      present={present.map((s) => ({
        id: s.id,
        url: s.url,
        domain: s.domain,
        title: s.title,
        mentionedCompetitors: Array.isArray(s.mentionedCompetitors)
          ? (s.mentionedCompetitors as string[])
          : [],
      }))}
      weak={weak.map((s) => ({
        id: s.id,
        url: s.url,
        domain: s.domain,
        title: s.title,
      }))}
      missing={missing.map((s) => ({
        id: s.id,
        url: s.url,
        domain: s.domain,
        title: s.title,
        competitors: Array.isArray(s.mentionedCompetitors)
          ? (s.mentionedCompetitors as string[])
          : [],
      }))}
      unreachableCount={unreachable.length}
    />
  );
}
