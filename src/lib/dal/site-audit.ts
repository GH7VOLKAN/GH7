import { prisma } from "@/lib/db";
import { cache } from "react";
import type { CheckStatus } from "@/lib/types";

export interface AuditCheckData {
  id: string;
  label: string;
  status: CheckStatus;
  score: number;
  maxScore: number;
  detail: string | null;
  recommendation: string | null;
  raasEligible: boolean;
}

export interface AuditCategoryData {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  checks: AuditCheckData[];
}

export const getSiteAuditData = cache(async (brandId: string) => {
  const categories = await prisma.auditCategory.findMany({
    where: { brandId },
    include: {
      checks: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const auditCategories: AuditCategoryData[] = categories.map((cat) => {
    const checks: AuditCheckData[] = cat.checks.map((ch) => ({
      id: ch.id,
      label: ch.label,
      status: ch.status as CheckStatus,
      score: ch.score,
      maxScore: 10,
      detail: ch.detail,
      recommendation: ch.recommendation,
      raasEligible: ch.raasEligible,
    }));

    return {
      id: cat.id,
      name: cat.name,
      score: cat.score,
      maxScore: checks.length * 10,
      checks,
    };
  });

  const allChecks = categories.flatMap((c) => c.checks);
  const passCount = allChecks.filter((c) => c.status === "pass").length;
  const failCount = allChecks.filter((c) => c.status === "fail").length;
  const partialCount = allChecks.filter((c) => c.status === "partial").length;
  const totalScore = categories.reduce((s, c) => s + c.score, 0);

  return {
    auditCategories,
    totalScore,
    targetScore: 80,
    passCount,
    failCount,
    partialCount,
    totalChecks: allChecks.length,
    raasEligibleCount: allChecks.filter((c) => c.raasEligible).length,
  };
});
