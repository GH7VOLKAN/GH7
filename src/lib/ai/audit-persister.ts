import { prisma } from "@/lib/db";
import type { AuditResult } from "./site-auditor";

export async function persistAuditResults(
  brandId: string,
  result: AuditResult,
): Promise<void> {
  // Delete existing audit data for this brand
  await prisma.auditCategory.deleteMany({ where: { brandId } });

  // Insert new categories + checks
  let totalEarned = 0;
  let totalMax = 0;

  for (const cat of result.categories) {
    const catScore = cat.checks.reduce((sum, c) => sum + c.score, 0);
    totalEarned += catScore;
    totalMax += cat.checks.length * 10;

    await prisma.auditCategory.create({
      data: {
        brandId,
        name: cat.name,
        score: catScore,
        checks: {
          create: cat.checks.map((c) => ({
            label: c.label,
            status: c.status,
            score: c.score,
            detail: c.detail,
            recommendation: c.recommendation,
            raasEligible: c.raasEligible,
          })),
        },
      },
    });
  }

  // Calculate readiness score (0-100)
  const readinessScore =
    totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;

  // Upsert today's ScoreHistory with readinessScore
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get current mentionScore from latest entry
  const latestScore = await prisma.scoreHistory.findFirst({
    where: { brandId },
    orderBy: { date: "desc" },
  });
  const mentionScore = latestScore?.mentionScore ?? 0;

  await prisma.scoreHistory.upsert({
    where: { brandId_date: { brandId, date: today } },
    update: { readinessScore },
    create: { brandId, date: today, mentionScore, readinessScore },
  });
}
