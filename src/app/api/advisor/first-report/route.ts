/**
 * POST /api/advisor/first-report
 *
 * Marka için ilk Advisor raporunu Qwen ile üretir ve AdvisorReport tablosuna
 * kaydeder. Body: { brandSlug: string }.
 *
 * Guard: Aynı marka için "first" tipinde bir rapor varsa 409 döner
 * (?regenerate=1 ile override). Scan/audit yoksa düşük-veri stub üretir.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import {
  generateFirstAdvisorReport,
  type AdvisorInputSnapshot,
} from "@/lib/advisor/generate-first-report";

export const maxDuration = 120;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    brandSlug?: string;
  };
  const brandSlug = body.brandSlug;
  if (!brandSlug) {
    return NextResponse.json({ error: "brandSlug required" }, { status: 400 });
  }

  const url = new URL(request.url);
  const regenerate = url.searchParams.get("regenerate") === "1";

  const brand = await prisma.brand.findFirst({
    where: { profileId: user.id, slug: brandSlug },
    include: {
      competitors: {
        orderBy: [{ isPrimary: "desc" }, { mentionScore: "desc" }],
        take: 5,
      },
      scans: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 1,
        include: { results: { include: { prompt: true } } },
      },
    },
  });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // Duplicate guard
  if (!regenerate) {
    const existing = await prisma.advisorReport.findFirst({
      where: { brandId: brand.id, reportType: "first" },
      orderBy: { generatedAt: "desc" },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: "already_exists",
          reportId: existing.id,
          message:
            "İlk rapor zaten üretilmiş. ?regenerate=1 ile yeniden üretebilirsiniz.",
        },
        { status: 409 },
      );
    }
  }

  // Latest audit
  const latestAudit = await prisma.audit.findFirst({
    where: { brandId: brand.id, status: "completed" },
    orderBy: { completedAt: "desc" },
    include: {
      items: {
        where: { status: "critical" },
        select: { itemCode: true, title: true },
        take: 10,
      },
    },
  });

  // Scan snapshot
  const latestScan = brand.scans[0];
  let scanSnapshot: AdvisorInputSnapshot["scan"] = null;
  if (latestScan) {
    const platformMap = new Map<string, { mentioned: number; total: number }>();
    const promptMap = new Map<
      string,
      { text: string; mentioned: number; total: number }
    >();
    for (const r of latestScan.results) {
      const p = platformMap.get(r.platform) ?? { mentioned: 0, total: 0 };
      p.total += 1;
      if (r.mentioned) p.mentioned += 1;
      platformMap.set(r.platform, p);

      const q = promptMap.get(r.promptId) ?? {
        text: r.prompt.text,
        mentioned: 0,
        total: 0,
      };
      q.total += 1;
      if (r.mentioned) q.mentioned += 1;
      promptMap.set(r.promptId, q);
    }
    const queries = Array.from(promptMap.values());
    scanSnapshot = {
      score: latestScan.score,
      scoreTotal: latestScan.scoreTotal,
      totalQueries: latestScan.totalQueries ?? queries.length,
      totalMentions: latestScan.totalMentions,
      measuredAt:
        (latestScan.completedAt ?? latestScan.startedAt)?.toISOString() ?? null,
      platformBreakdown: Array.from(platformMap.entries()).map(([k, v]) => ({
        platform: k,
        mentioned: v.mentioned,
        total: v.total,
      })),
      topQueries: [...queries]
        .sort((a, b) => b.mentioned / b.total - a.mentioned / a.total)
        .slice(0, 5),
      weakQueries: [...queries]
        .sort((a, b) => a.mentioned / a.total - b.mentioned / b.total)
        .slice(0, 5),
    };
  }

  const input: AdvisorInputSnapshot = {
    brand: {
      name: brand.name,
      domain: brand.domain,
      sector: brand.sector,
      city: brand.city,
    },
    scan: scanSnapshot,
    audit: latestAudit
      ? {
          totalScore: latestAudit.totalScore,
          passedCount: latestAudit.passedCount,
          warningCount: latestAudit.warningCount,
          criticalCount: latestAudit.criticalCount,
          criticalItems: latestAudit.items.map((i) => ({
            code: i.itemCode,
            title: i.title,
          })),
        }
      : null,
    competitors: brand.competitors.map((c) => ({
      name: c.name,
      isPrimary: c.isPrimary,
    })),
  };

  try {
    const result = await generateFirstAdvisorReport(input);

    const report = await prisma.advisorReport.create({
      data: {
        brandId: brand.id,
        reportType: "first",
        content: result.content,
        inputSnapshot: input as unknown as object,
        costUsd: result.costUsd,
        tokensInput: result.usage.input_tokens,
        tokensOutput: result.usage.output_tokens,
      },
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      costUsd: result.costUsd,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[advisor/first-report] failed:", message);

    // Fallback stub — user still sees something
    await prisma.advisorReport.create({
      data: {
        brandId: brand.id,
        reportType: "failed_stub",
        content: `## Rapor Üretilemedi\n\nŞu anda Qwen üzerinden rapor üretirken bir hata oluştu.\n\nSebep: ${message}\n\nBirkaç dakika sonra tekrar deneyebilirsin.`,
        inputSnapshot: input as unknown as object,
      },
    });

    return NextResponse.json(
      { error: "generation_failed", message },
      { status: 500 },
    );
  }
}
