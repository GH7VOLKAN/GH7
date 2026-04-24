/**
 * /dashboard/[brandSlug]/tracker — Firma dashboard (Brief H-ext Aşama 3).
 *
 * İlk gün değer: Baseline skor + platform durumu + sorgu durumu + sonraki
 * rapor kartı. Backend haftalık cron (Brief I) olmadan mevcut Scan verisinden
 * canlı bilgi gösterir.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { TrackerView, type TrackerData } from "./_components/tracker-view";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandSlug: string }>;

function computeNextMonday(from: Date): Date {
  const d = new Date(from);
  const day = d.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const offset = day === 0 ? 1 : 8 - day; // bir sonraki Pazartesi
  d.setUTCDate(d.getUTCDate() + offset);
  d.setUTCHours(8, 0, 0, 0); // 08:00 UTC (Türkiye 11:00, mantık basitliği)
  return d;
}

export default async function TrackerPage({
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

  // En son tamamlanmış scan — baseline kaynağı
  const latestScan = await prisma.scan.findFirst({
    where: { brandId: brand.id, status: "completed" },
    orderBy: { completedAt: "desc" },
    include: {
      results: { include: { prompt: true } },
    },
  });

  if (!latestScan) {
    return (
      <TrackerView
        data={null}
        brand={brand}
        nextReportAt={computeNextMonday(new Date())}
      />
    );
  }

  // Platform bazlı mention count
  const platformMap = new Map<
    string,
    { mentioned: number; total: number }
  >();
  for (const r of latestScan.results) {
    const rec = platformMap.get(r.platform) ?? { mentioned: 0, total: 0 };
    rec.total += 1;
    if (r.mentioned) rec.mentioned += 1;
    platformMap.set(r.platform, rec);
  }
  const platforms = Array.from(platformMap.entries())
    .map(([key, v]) => ({
      key,
      mentioned: v.mentioned,
      total: v.total,
    }))
    .sort((a, b) => b.mentioned - a.mentioned);

  // Sorgu bazlı: her prompt için platform sayısı / toplam platform
  const totalPlatforms = platforms.length || 5;
  const promptMap = new Map<
    string,
    { text: string; mentioned: number; total: number }
  >();
  for (const r of latestScan.results) {
    const key = r.promptId;
    const rec = promptMap.get(key) ?? {
      text: r.prompt.text,
      mentioned: 0,
      total: 0,
    };
    rec.total += 1;
    if (r.mentioned) rec.mentioned += 1;
    promptMap.set(key, rec);
  }
  const queries = Array.from(promptMap.values())
    .map((q) => ({ ...q, total: q.total || totalPlatforms }))
    .sort((a, b) => b.mentioned - a.mentioned);

  // En güçlü + en zayıf platform (UI metni için)
  const strongest = platforms.filter((p) => p.mentioned === platforms[0]?.mentioned);
  const weakest = platforms.filter((p) => p.mentioned === 0);

  const data: TrackerData = {
    score: latestScan.score ?? 0,
    scoreTotal: latestScan.scoreTotal ?? 25,
    measuredAt: latestScan.completedAt ?? latestScan.startedAt,
    totalQueries: queries.length,
    platforms,
    queries,
    strongestPlatforms: strongest.map((p) => p.key),
    weakestPlatforms: weakest.map((p) => p.key),
  };

  return (
    <TrackerView
      data={data}
      brand={brand}
      nextReportAt={computeNextMonday(new Date())}
    />
  );
}
