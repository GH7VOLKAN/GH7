import { NextRequest, NextResponse } from "next/server";
import { runAudit43 } from "@/lib/ai/audit-43";
import { generatePersonalAnalysis } from "@/lib/ai/personal-analysis";
import { prisma } from "@/lib/db";
import type { UserType } from "@/lib/ai/user-type-weights";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const maxDuration = 120; // 2 min

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      url,
      brandName,
      userType,
      sector,
      location,
      competitorUrl,
      keywords,
      userId,
      source,
      discoveredCompetitors,
    } = body as {
      url?: string;
      brandName?: string;
      userType?: UserType;
      sector?: string;
      location?: string;
      competitorUrl?: string;
      keywords?: string[];
      userId?: string;
      source?: string;
      discoveredCompetitors?: Array<{
        name: string;
        url?: string;
        reason?: string;
      }>;
    };

    if (!url || !brandName || !userType) {
      return NextResponse.json(
        { error: "url, brandName, userType required" },
        { status: 400 }
      );
    }

    const validUserTypes: UserType[] = ["firma", "kisi", "eticaret", "yurtdisi"];
    if (!validUserTypes.includes(userType)) {
      return NextResponse.json(
        { error: `Invalid userType: ${userType}. Must be one of ${validUserTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Run 43-item audit
    const auditResult = await runAudit43({
      url,
      brandName,
      userType,
      sector,
      location,
      competitorUrl,
      keywords,
    });

    // Generate Opus personal analysis (non-blocking — if fails, continue without it)
    const personalAnalysis = await generatePersonalAnalysis(auditResult, {
      usePremium: false, // Free tier uses Sonnet
    });

    // Persist to GeoAudit
    const savedAudit = await prisma.geoAudit.create({
      data: {
        url,
        brandName,
        location: location ?? null,
        sector: sector ?? null,
        userType,
        overallScore: auditResult.overallScore,
        competitorScore: auditResult.competitorScore ?? null,
        competitorName: auditResult.competitorName ?? null,
        competitorUrl: auditResult.competitorUrl ?? null,
        auditItems: auditResult.items as unknown as Prisma.InputJsonValue,
        categoryScores: auditResult.categoryScores as unknown as Prisma.InputJsonValue,
        estimatedMonthlyLoss: auditResult.estimatedMonthlyLoss,
        estimatedYearlyLoss: auditResult.estimatedYearlyLoss,
        personalAnalysis: personalAnalysis?.personalAnalysis ?? null,
        categorySummaries: (personalAnalysis?.categorySummaries ??
          null) as unknown as Prisma.InputJsonValue,
        rawDataforseo: (auditResult.rawDataforseo ??
          null) as unknown as Prisma.InputJsonValue,
        rawAiVisibility: (auditResult.rawAiVisibility ??
          null) as unknown as Prisma.InputJsonValue,
        isFree: !userId,
        userId: userId ?? null,
        source: source ?? null,
      },
    });

    // Giriş yapmış kullanıcıların rakiplerini Competitor tablosuna kaydet
    if (userId) {
      try {
        const brand = await prisma.brand.findFirst({
          where: { profileId: userId },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });

        if (brand) {
          const { upsertCompetitor } = await import(
            "@/lib/ai/competitor-matching"
          );

          // Kullanıcının manuel girdiği rakip
          if (competitorUrl) {
            const { extractRootDomain } = await import("@/lib/utils/turkish");
            const name =
              auditResult.competitorName || extractRootDomain(competitorUrl);
            if (name) {
              await upsertCompetitor({
                brandId: brand.id,
                name,
                domain: competitorUrl,
                source: "free_audit",
                reason: "Free audit karşılaştırması",
              });
            }
          }

          // Discovery'den gelen rakipler (frontend'den payload ile gelebilir)
          if (discoveredCompetitors && discoveredCompetitors.length > 0) {
            for (const c of discoveredCompetitors.slice(0, 5)) {
              if (!c.name) continue;
              await upsertCompetitor({
                brandId: brand.id,
                name: c.name,
                domain: c.url,
                source: "discovery",
                reason: c.reason ?? "Perplexity keşfi",
              });
            }
          }
        }
      } catch (err) {
        // Non-fatal: audit sonucu yine de dönsün
        console.error(
          "[api/run-audit-43] Competitor upsert failed:",
          err
        );
      }
    }

    return NextResponse.json({
      auditId: savedAudit.id,
      userId: userId ?? null,
      overallScore: auditResult.overallScore,
      categoryScores: auditResult.categoryScores,
      competitorScore: auditResult.competitorScore,
      competitorName: auditResult.competitorName,
      items: auditResult.items,
      estimatedMonthlyLoss: auditResult.estimatedMonthlyLoss,
      estimatedYearlyLoss: auditResult.estimatedYearlyLoss,
      personalAnalysis: personalAnalysis?.personalAnalysis,
      categorySummaries: personalAnalysis?.categorySummaries,
    });
  } catch (err) {
    console.error("[api/run-audit-43] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Audit failed" },
      { status: 500 }
    );
  }
}
