/**
 * POST /api/analiz/finalize — Shazam analizi bitiminde Supabase'e yazma
 *
 * Akış:
 *   1. Brand findFirst(profileId, domain) → update veya create
 *   2. Scan create(status: "running", score, scoreTotal, commentary ...)
 *   3. Her query için Prompt create
 *   4. Her answer için PromptResult create (scanId + promptId'li)
 *   5. Seçilen rakipler için Competitor create (isPrimary: true)
 *   6. Scan update(status: "completed", completedAt: now)
 *
 * Döner: { ok, brandId, scanId, redirect: "/dashboard" }
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { AnalyzeResult, SelectedCompetitor } from "@/lib/analiz/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type FinalizeBody = {
  profileId?: string;
  analyzeInput?: {
    door?: string;
    domain?: string;
    fullName?: string;
    city?: string;
    targetMarket?: string;
    targetLanguage?: string;
  };
  analyzeResult?: AnalyzeResult;
  selectedCompetitors?: SelectedCompetitor[];
};

function slugifyForDomain(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + ".placeholder"
  );
}

function normalizeDomainInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .trim();
}

export async function POST(req: Request) {
  let body: FinalizeBody;
  try {
    body = (await req.json()) as FinalizeBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Geçersiz JSON" },
      { status: 400 },
    );
  }

  const { profileId, analyzeInput, analyzeResult, selectedCompetitors } = body;

  if (!profileId) {
    return NextResponse.json(
      { ok: false, error: "profileId gerekli." },
      { status: 400 },
    );
  }
  if (!analyzeResult?.firmProfile) {
    return NextResponse.json(
      { ok: false, error: "Analiz sonucu eksik." },
      { status: 400 },
    );
  }
  if (!selectedCompetitors || selectedCompetitors.length === 0) {
    return NextResponse.json(
      { ok: false, error: "En az 1 rakip seçilmeli." },
      { status: 400 },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
  });
  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "Profile bulunamadı." },
      { status: 404 },
    );
  }

  const fp = analyzeResult.firmProfile;
  const door = analyzeInput?.door ?? "firma";

  // Brand domain — firma/eticaret/yurtdisi için analyzeInput.domain,
  // kişi için slug(fullName)
  const brandDomain = analyzeInput?.domain
    ? normalizeDomainInput(analyzeInput.domain)
    : slugifyForDomain(fp.name || analyzeInput?.fullName || "brand");

  const brandName = fp.name || analyzeInput?.fullName || brandDomain;

  try {
    // ═══ Atomic transaction — hata olursa hepsi rollback ═══
    const txResult = await prisma.$transaction(
      async (tx) => {
        // ─── 1. Brand findFirst + update/create ───
        const existingBrand = await tx.brand.findFirst({
          where: { profileId, domain: brandDomain },
        });

        const brandData = {
          name: brandName,
          sector: fp.sector || null,
          city: fp.location?.city || analyzeInput?.city || null,
          type: door === "kisi" ? "kisisel" : "firma",
          userType: door,
          strengths: fp.distinctives || [],
          sonarAnalysis: {
            rawContext: fp.rawContext || "",
            products: fp.products || [],
            distinctives: fp.distinctives || [],
            location: fp.location || {},
            generatedAt: analyzeResult.generatedAt,
          } as object,
          isDefault: true,
          autoScan: false,
          scanInterval: "manual",
        };

        const brand = existingBrand
          ? await tx.brand.update({
              where: { id: existingBrand.id },
              data: brandData,
            })
          : await tx.brand.create({
              data: {
                ...brandData,
                profileId,
                domain: brandDomain,
              },
            });

        // ─── 2. Scan create (running) ───
        const totalQueries = analyzeResult.queries.length;
        const scoreTotal = totalQueries * 5;
        const score = analyzeResult.userMentions.totalMentions;

        const scan = await tx.scan.create({
          data: {
            brandId: brand.id,
            type: "free_test",
            status: "running",
            score,
            scoreTotal,
            totalMentions: score,
            totalQueries,
            commentary: analyzeResult.commentary || null,
            healingAttempted: analyzeResult.healingAttempted || false,
            startedAt: new Date(analyzeResult.generatedAt),
          },
        });

        // ─── 3. Prompts + 4. PromptResults ───
        let promptCount = 0;
        let resultCount = 0;
        for (const query of analyzeResult.queries) {
          const prompt = await tx.prompt.create({
            data: {
              brandId: brand.id,
              text: query.text,
              tags: query.generation === 2 ? ["second_pass"] : [],
              source: "ai_generated",
              isActive: true,
              lastScanAt: new Date(),
            },
          });
          promptCount++;

          for (const answer of query.answers) {
            await tx.promptResult.create({
              data: {
                scanId: scan.id,
                promptId: prompt.id,
                platform: answer.provider,
                mentioned: answer.mentionedYou,
                fullResponse: answer.text || "",
                excerpt: answer.text ? answer.text.slice(0, 280) : null,
                competitors:
                  answer.mentionedCompetitors.length > 0
                    ? (answer.mentionedCompetitors.map((name) => ({
                        name,
                      })) as unknown as object)
                    : undefined,
              },
            });
            resultCount++;
          }
        }

        // ─── 5. Competitors (seçilen 3, isPrimary: true) ───
        // Önce bu Brand'ın eski primary'lerini kaldır
        await tx.competitor.updateMany({
          where: { brandId: brand.id, isPrimary: true },
          data: { isPrimary: false },
        });

        for (const comp of selectedCompetitors) {
          const compDomain = comp.url
            ? normalizeDomainInput(comp.url)
            : slugifyForDomain(comp.name);

          const existingComp = await tx.competitor.findFirst({
            where: { brandId: brand.id, domain: compDomain },
          });

          if (existingComp) {
            await tx.competitor.update({
              where: { id: existingComp.id },
              data: {
                name: comp.name,
                isPrimary: true,
                source: comp.isNew ? "manual" : "free_audit",
              },
            });
          } else {
            await tx.competitor.create({
              data: {
                brandId: brand.id,
                name: comp.name,
                domain: compDomain,
                source: comp.isNew ? "manual" : "free_audit",
                isPrimary: true,
                relevance: "direct",
                discoveredAt: new Date(),
              },
            });
          }
        }

        // ─── 6. Scan completed ───
        await tx.scan.update({
          where: { id: scan.id },
          data: {
            status: "completed",
            completedAt: new Date(),
          },
        });

        return {
          brandId: brand.id,
          scanId: scan.id,
          brandAction: existingBrand ? "updated" : "created",
          promptCount,
          resultCount,
        };
      },
      {
        maxWait: 10_000, // 10s acquire lock wait
        timeout: 45_000, // 45s tx total (5N prompt results dahil)
      },
    );

    console.log(
      `[finalize] tx ok — brand ${txResult.brandAction}=${txResult.brandId}, scan=${txResult.scanId}, ${txResult.promptCount} prompts + ${txResult.resultCount} results + ${selectedCompetitors.length} competitors`,
    );

    return NextResponse.json({
      ok: true,
      brandId: txResult.brandId,
      scanId: txResult.scanId,
      redirect: "/dashboard",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[finalize] tx rollback, error:", msg);
    return NextResponse.json(
      { ok: false, error: "Finalize hatası: " + msg },
      { status: 500 },
    );
  }
}
