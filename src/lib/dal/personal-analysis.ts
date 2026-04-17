/**
 * Personal Analysis DAL
 *
 * En son GeoAudit kaydından:
 * - Opus/Sonnet tarafından üretilen `personalAnalysis` (narrative)
 * - 6 kategori için `categorySummaries` (özetler + kritik aksiyonlar)
 * - 43 madde detayı (auditItems)
 * - Kategori skorları (categoryScores)
 * - Tahmini kayıp (estimatedMonthlyLoss, estimatedYearlyLoss)
 */

import { prisma } from "@/lib/db";
import { cache } from "react";

export interface CategorySummary {
  category: string;
  summary: string;
  criticalAction: string;
}

export interface LatestAuditData {
  id: string;
  overallScore: number;
  competitorScore: number | null;
  competitorName: string | null;
  personalAnalysis: string | null;
  categorySummaries: CategorySummary[];
  auditItems: unknown; // Audit43Result JSON
  categoryScores: Record<string, number>;
  estimatedMonthlyLoss: number | null;
  estimatedYearlyLoss: number | null;
  userType: string;
  sector: string | null;
  createdAt: Date;
}

/**
 * Bir marka için en son GeoAudit kaydını getirir.
 * Matching: userId eşleşir VE (domain VEYA brandName) marka ile eşleşir.
 */
export const getLatestAudit = cache(
  async (
    userId: string,
    brandDomain: string,
    brandName: string,
  ): Promise<LatestAuditData | null> => {
    const audit = await prisma.geoAudit.findFirst({
      where: {
        userId,
        OR: [
          { url: { contains: brandDomain, mode: "insensitive" } },
          { brandName: { equals: brandName, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    if (!audit) return null;

    const categorySummaries =
      (audit.categorySummaries as unknown as CategorySummary[] | null) ?? [];
    const categoryScores =
      (audit.categoryScores as Record<string, number> | null) ?? {};

    return {
      id: audit.id,
      overallScore: audit.overallScore,
      competitorScore: audit.competitorScore,
      competitorName: audit.competitorName,
      personalAnalysis: audit.personalAnalysis,
      categorySummaries,
      auditItems: audit.auditItems,
      categoryScores,
      estimatedMonthlyLoss: audit.estimatedMonthlyLoss,
      estimatedYearlyLoss: audit.estimatedYearlyLoss,
      userType: audit.userType,
      sector: audit.sector,
      createdAt: audit.createdAt,
    };
  },
);
