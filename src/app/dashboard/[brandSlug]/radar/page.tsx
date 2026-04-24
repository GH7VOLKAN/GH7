/**
 * /dashboard/[brandSlug]/radar — Firma Radar dashboard (Brief H-ext Aşama 4).
 *
 * İlk gün değer: Rakip listesi + karşılaştırma matrisi + önde/geride özeti.
 * DataForSEO rakip site analizi Brief I (cron) + gelecek iterasyonda.
 *
 * Veri:
 * - Competitor model: brand.competitors (isPrimary=true tercihli)
 * - Karşılaştırma: scan.results üzerinden per-query × per-competitor mention
 *   (PromptResult.competitors JSON: CompetitorDetail[])
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { RadarView, type RadarData } from "./_components/radar-view";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandSlug: string }>;

function normalizeForMatch(name: string): string {
  return name
    .toLowerCase()
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[ıİI]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[şŞ]/g, "s")
    .replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9]/g, "");
}

function computeNextMonday(from: Date): Date {
  const d = new Date(from);
  const day = d.getUTCDay();
  const offset = day === 0 ? 1 : 8 - day;
  d.setUTCDate(d.getUTCDate() + offset);
  d.setUTCHours(8, 0, 0, 0);
  return d;
}

type CompetitorDetail = { name?: string; position?: string; sentiment?: string };

export default async function RadarPage({
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
      competitors: {
        orderBy: [{ isPrimary: "desc" }, { mentionScore: "desc" }],
        take: 10, // UI için makul sınır
      },
      scans: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 1,
        include: { results: { include: { prompt: true } } },
      },
    },
  });
  if (!brand) redirect("/dashboard");

  const latestScan = brand.scans[0];

  // Primary rakipler (max 3) — yoksa en yüksek mention score ilk 3
  const primaryCompetitors = brand.competitors.filter((c) => c.isPrimary);
  const displayCompetitors =
    primaryCompetitors.length > 0
      ? primaryCompetitors.slice(0, 3)
      : brand.competitors.slice(0, 3);

  if (!latestScan || displayCompetitors.length === 0) {
    return (
      <RadarView
        data={null}
        brand={{ slug: brand.slug, name: brand.name }}
        hasCompetitors={displayCompetitors.length > 0}
        hasScan={!!latestScan}
        nextReportAt={computeNextMonday(new Date())}
      />
    );
  }

  // Promptlar → matrisin satırları
  const promptMap = new Map<
    string,
    { text: string; userMentioned: boolean; competitorHits: Set<string> }
  >();

  for (const r of latestScan.results) {
    const pKey = r.promptId;
    const rec = promptMap.get(pKey) ?? {
      text: r.prompt.text,
      userMentioned: false,
      competitorHits: new Set<string>(),
    };
    if (r.mentioned) rec.userMentioned = true;

    // PromptResult.competitors: CompetitorDetail[] — AI yanıtında bahsedilen
    // rakipler (her platform için ayrı)
    const compArr = (r.competitors ?? []) as unknown as CompetitorDetail[];
    if (Array.isArray(compArr)) {
      for (const detail of compArr) {
        const normalized = detail?.name ? normalizeForMatch(detail.name) : "";
        if (!normalized) continue;
        // Kayıtlı competitor ile eşleşme
        const matched = displayCompetitors.find((c) => {
          const candidates = [
            c.normalizedName,
            normalizeForMatch(c.name),
            c.normalizedDomain,
          ].filter(Boolean) as string[];
          return candidates.some((cand) => cand === normalized);
        });
        if (matched) rec.competitorHits.add(matched.id);
      }
    }

    promptMap.set(pKey, rec);
  }

  const matrixRows = Array.from(promptMap.values()).map((row) => ({
    text: row.text,
    userMentioned: row.userMentioned,
    competitorMentions: displayCompetitors.map((c) =>
      row.competitorHits.has(c.id),
    ),
  }));

  // Önde / eşit / geride sayacı
  let aheadCount = 0;
  let tieCount = 0;
  let behindCount = 0;
  for (const row of matrixRows) {
    const compAny = row.competitorMentions.some(Boolean);
    if (row.userMentioned && !compAny) aheadCount += 1;
    else if (row.userMentioned && compAny) tieCount += 1;
    else if (!row.userMentioned && compAny) behindCount += 1;
    // ikisi de yoksa hiçbir kategoriye girmez
  }

  // Rakibin önde olduğu sorgular
  const competitorLeadingQueries = matrixRows
    .filter((row) => !row.userMentioned && row.competitorMentions.some(Boolean))
    .map((row) => ({
      text: row.text,
      leaders: displayCompetitors
        .filter((_, i) => row.competitorMentions[i])
        .map((c) => c.name),
    }));

  const data: RadarData = {
    competitors: displayCompetitors.map((c) => ({
      id: c.id,
      name: c.name,
      domain: c.domain,
      isPrimary: c.isPrimary,
    })),
    matrix: matrixRows,
    summary: {
      aheadCount,
      tieCount,
      behindCount,
      totalQueries: matrixRows.length,
    },
    competitorLeadingQueries,
  };

  return (
    <RadarView
      data={data}
      brand={{ slug: brand.slug, name: brand.name }}
      hasCompetitors
      hasScan
      nextReportAt={computeNextMonday(new Date())}
    />
  );
}
