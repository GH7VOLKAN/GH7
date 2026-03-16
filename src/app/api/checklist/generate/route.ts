import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { CHECKLIST_DEFAULTS, type ChecklistDefault } from "@/lib/checklist-defaults";

export const maxDuration = 60;

/**
 * POST /api/checklist/generate
 * Input:  { brandId }
 *
 * Spec Görev 8: Gelişim Planı'nı audit + tarama + rakip verisinden kişiselleştir.
 * - Audit sonuçlarından eksikleri al → her eksik 1 madde
 * - Tarama sonuçlarından mention rate düşük alanlar → madde
 * - Rakip fark analizi → madde
 * - Toplam 22 madde (varsayılanlar + kişiselleştirilmiş açıklamalar)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { brandId } = await request.json();

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, profileId: user.id },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  const plan = profile?.plan ?? "free";
  const isFree = plan === "free";

  try {
    // 1. Audit sonuçlarını çek
    const auditChecks = await prisma.auditCheck.findMany({
      where: { category: { brandId } },
      include: { category: true },
    });

    const failingChecks = auditChecks.filter((c) => c.status === "fail" || c.status === "partial");

    // 2. Tarama sonuçlarını çek — mention rate düşük alanlar
    const latestScan = await prisma.scan.findFirst({
      where: { brandId, status: "completed" },
      orderBy: { completedAt: "desc" },
    });

    let lowMentionAreas: string[] = [];
    if (latestScan) {
      const results = await prisma.promptResult.findMany({
        where: { scanId: latestScan.id },
        include: { prompt: { select: { businessArea: true } } },
      });

      // Group by businessArea
      const areaStats: Record<string, { mentioned: number; total: number }> = {};
      for (const r of results) {
        const area = r.prompt.businessArea ?? "Genel";
        if (!areaStats[area]) areaStats[area] = { mentioned: 0, total: 0 };
        areaStats[area].total++;
        if (r.mentioned) areaStats[area].mentioned++;
      }

      lowMentionAreas = Object.entries(areaStats)
        .filter(([, stats]) => stats.total > 0 && (stats.mentioned / stats.total) < 0.3)
        .map(([area]) => area);
    }

    // 3. Rakip fark analizi
    const topCompetitor = await prisma.competitor.findFirst({
      where: { brandId },
      orderBy: { mentionScore: "desc" },
    });

    // 4. Kişiselleştir: Mevcut checklist default'larına audit/tarama bilgisi ekle
    const personalizedItems: Array<{
      layer: number;
      itemNumber: string;
      simpleTitle: string;
      simpleDescription: string;
      status: string;
      difficulty: string;
      impact: string;
      feasibilityScore: number;
      estimatedTime: string;
      technicalDetail: object;
      selfServiceSteps: string[];
      canAgencyDo: boolean;
      agencyPrice: string | null;
    }> = [];

    for (const def of CHECKLIST_DEFAULTS) {
      let description = def.simpleDescription;
      let status: string = isFree && def.layer === 3 ? "locked" : "missing";

      // Match audit failures to checklist items
      const relatedAuditIssue = findRelatedAuditIssue(def, failingChecks);
      if (relatedAuditIssue) {
        description += ` — Site kontrolünde tespit: ${relatedAuditIssue.label} ${relatedAuditIssue.status === "fail" ? "eksik" : "kısmen eksik"}.`;
      }

      // Add competitor context if applicable
      if (topCompetitor && def.layer >= 2) {
        description += ` Rakibin ${topCompetitor.name}'ın mention skoru: ${topCompetitor.mentionScore}. Bu adımı tamamlayarak farkı kapatabilirsin.`;
      }

      // Check if already audit-verified
      if (relatedAuditIssue && relatedAuditIssue.status === "pass") {
        status = "complete";
      }

      personalizedItems.push({
        layer: def.layer,
        itemNumber: def.itemNumber,
        simpleTitle: def.simpleTitle,
        simpleDescription: description,
        status,
        difficulty: def.difficulty,
        impact: def.impact,
        feasibilityScore: def.feasibilityScore,
        estimatedTime: def.estimatedTime,
        technicalDetail: JSON.parse(JSON.stringify(def.technicalDetail)),
        selfServiceSteps: def.selfServiceSteps,
        canAgencyDo: def.canAgencyDo,
        agencyPrice: def.agencyPrice,
      });
    }

    // Delete existing checklist items and recreate with personalized data
    await prisma.checklistItem.deleteMany({ where: { brandId } });
    await prisma.checklistItem.createMany({
      data: personalizedItems.map((item) => ({
        brandId,
        layer: item.layer,
        itemNumber: item.itemNumber,
        simpleTitle: item.simpleTitle,
        simpleDescription: item.simpleDescription,
        status: item.status,
        difficulty: item.difficulty,
        impact: item.impact,
        feasibilityScore: item.feasibilityScore,
        estimatedTime: item.estimatedTime,
        technicalDetail: item.technicalDetail,
        selfServiceSteps: item.selfServiceSteps,
        canAgencyDo: item.canAgencyDo,
        agencyPrice: item.agencyPrice,
      })),
    });

    return NextResponse.json({
      success: true,
      itemCount: personalizedItems.length,
      auditIssues: failingChecks.length,
      lowMentionAreas,
      topCompetitor: topCompetitor?.name ?? null,
    });
  } catch (err) {
    console.error("[checklist/generate] Failed:", err);
    return NextResponse.json(
      { error: "Gelişim planı oluşturulurken hata oluştu" },
      { status: 500 },
    );
  }
}

/**
 * Map audit check failures to checklist items based on keywords
 */
function findRelatedAuditIssue(
  def: ChecklistDefault,
  auditChecks: Array<{ label: string; status: string; detail: string | null }>,
): { label: string; status: string } | null {
  const titleLower = def.simpleTitle.toLowerCase();
  const descLower = def.simpleDescription.toLowerCase();

  for (const check of auditChecks) {
    const labelLower = check.label.toLowerCase();

    // Match based on keywords
    if (
      (titleLower.includes("schema") && labelLower.includes("bilgi")) ||
      (titleLower.includes("faq") && labelLower.includes("soru")) ||
      (titleLower.includes("llms") && labelLower.includes("llms")) ||
      (titleLower.includes("robots") && labelLower.includes("robot")) ||
      (titleLower.includes("sitemap") && labelLower.includes("sitemap")) ||
      (titleLower.includes("ssl") && labelLower.includes("https")) ||
      (titleLower.includes("meta") && labelLower.includes("meta")) ||
      (titleLower.includes("performans") && labelLower.includes("performans")) ||
      (descLower.includes("open graph") && labelLower.includes("open graph")) ||
      (descLower.includes("sosyal medya") && labelLower.includes("sosyal"))
    ) {
      return { label: check.label, status: check.status };
    }
  }

  return null;
}
