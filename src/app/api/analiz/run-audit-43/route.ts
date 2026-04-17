import { NextRequest, NextResponse } from "next/server";
import { runAudit43 } from "@/lib/ai/audit-43";
import { generatePersonalAnalysis } from "@/lib/ai/personal-analysis";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { normalizeDomain, extractRootDomain } from "@/lib/utils/turkish";
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

    // Session-based userId (SMS OTP'yle auth olmuş kullanıcı)
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch (err) {
      console.warn("[api/run-audit-43] Supabase session read failed:", err);
    }

    console.log(
      `[api/run-audit-43] start url=${url} brand="${brandName}" userType=${userType} userId=${userId ?? "null"}`,
    );

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

    // Generate personal analysis (non-blocking — if fails, continue without it)
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

    // Authenticated user: Brand kaydını upsert et (yeni domain → yeni brand veya domain eşleşen brand'ı güncelle)
    if (userId) {
      try {
        const normalizedDomain = normalizeDomain(url);

        // 1) Bu domain için profile'da bir brand var mı?
        let brand = await prisma.brand.findFirst({
          where: {
            profileId: userId,
            domain: normalizedDomain,
          },
        });

        // 2) Yoksa: kullanıcının mevcut default brand'ını bul, eski default'u kapat
        if (!brand) {
          const existingDefault = await prisma.brand.findFirst({
            where: { profileId: userId, isDefault: true },
          });
          if (existingDefault) {
            await prisma.brand.update({
              where: { id: existingDefault.id },
              data: { isDefault: false },
            });
          }

          // 3) Yeni brand oluştur (girilen URL + brand adı + userType ile)
          brand = await prisma.brand.create({
            data: {
              profileId: userId,
              name: brandName,
              domain: normalizedDomain,
              sector: sector ?? null,
              userType,
              type: userType === "kisi" ? "kisisel" : "firma",
              isDefault: true,
              serviceRegions: location ? [location] : [],
              businessCategories: [],
              strengths: [],
              weaknesses: [],
              competitorNames: [],
              competitorDomains: [],
              specialties: [],
            },
          });
          console.log(
            `[api/run-audit-43] Created new Brand id=${brand.id} name="${brandName}" domain="${normalizedDomain}" for user=${userId}`,
          );
        } else {
          // Mevcut brand'ı güncelle (default yap + konum/sector)
          const updateData: Record<string, unknown> = { isDefault: true };
          if (location && !brand.serviceRegions?.includes(location)) {
            updateData.serviceRegions = [...(brand.serviceRegions ?? []), location];
          }
          if (brandName && brand.name !== brandName) {
            updateData.name = brandName;
          }
          if (sector && !brand.sector) {
            updateData.sector = sector;
          }
          brand = await prisma.brand.update({
            where: { id: brand.id },
            data: updateData,
          });
          // Eski default brand'ı kapat
          await prisma.brand.updateMany({
            where: {
              profileId: userId,
              id: { not: brand.id },
              isDefault: true,
            },
            data: { isDefault: false },
          });
          console.log(
            `[api/run-audit-43] Updated Brand id=${brand.id} domain="${normalizedDomain}" for user=${userId}`,
          );
        }

        // Rakipleri Competitor tablosuna kaydet
        const { upsertCompetitor } = await import(
          "@/lib/ai/competitor-matching"
        );

        // Kullanıcının manuel girdiği rakip
        if (competitorUrl) {
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
      } catch (err) {
        // Non-fatal: audit sonucu yine de dönsün
        console.error(
          "[api/run-audit-43] Brand/Competitor upsert failed:",
          err,
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
