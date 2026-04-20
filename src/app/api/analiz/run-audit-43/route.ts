import { NextRequest, NextResponse, after } from "next/server";
import { cookies } from "next/headers";
import { runAudit43 } from "@/lib/ai/audit-43";
import { generatePersonalAnalysis } from "@/lib/ai/personal-analysis";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { normalizeDomain, extractRootDomain } from "@/lib/utils/turkish";
import { checkRateLimit } from "@/lib/rate-limit";
import { executeScan } from "@/lib/ai/scan-engine";
import { getAvailablePlatforms } from "@/lib/ai/provider-registry";
import { isAdmin } from "@/lib/admin";
import { normalizePhoneNumber } from "@/lib/sms/netgsm";
import type { UserType } from "@/lib/ai/user-type-weights";
import { Prisma } from "@prisma/client";

const ACTIVE_BRAND_COOKIE = "gh7_active_brand_id";

export const runtime = "nodejs";
// 300s (5 dk): user audit + 3 rakip paralel audit + DataForSEO çağrıları
// + personalAnalysis (Claude) + Brand write = 2-4 dk sürüyor.
// 120s yetmiyordu → client timeout → Brand yazılamadan redirect.
export const maxDuration = 300;

/**
 * Request IP adresini header'lardan çıkarır (Vercel/Cloudflare proxy arkasında).
 */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  try {
    // Body'yi önce oku (phone bilgisi admin bypass için gerek)
    const body = await req.json();
    const bodyPhoneNormalized = body?.phone
      ? normalizePhoneNumber(String(body.phone))
      : null;
    const isAdminRequest = bodyPhoneNormalized
      ? isAdmin({ phone: bodyPhoneNormalized })
      : false;

    if (isAdminRequest) {
      console.log(
        `[api/run-audit-43] ADMIN BYPASS — phone=${bodyPhoneNormalized?.slice(0, 4)}**** (rate limit + freeAuditUsed atlandı)`,
      );
    }

    // IP bazlı audit başlatma rate limit — admin atlar
    if (!isAdminRequest) {
      const clientIp = getClientIp(req);
      if (clientIp !== "unknown") {
        const rl = await checkRateLimit(
          `audit_start:${clientIp}`,
          3, // 3 audit
          24 * 60, // 24 saat
        );
        if (!rl.allowed) {
          const resetIn = Math.ceil(
            (rl.resetAt.getTime() - Date.now()) / (60 * 60 * 1000),
          );
          return NextResponse.json(
            {
              error: `IP adresinizden çok fazla analiz denemesi yapıldı. ${resetIn} saat sonra tekrar deneyin.`,
              rateLimited: true,
              resetAt: rl.resetAt.toISOString(),
            },
            { status: 429 },
          );
        }
      }
    }
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
      selectedCompetitors,
      discoveryResult,
      email: bodyEmail,
      phone: bodyPhone,
    } = body as {
      url?: string;
      brandName?: string;
      userType?: UserType;
      sector?: string;
      location?: string;
      competitorUrl?: string;
      keywords?: string[];
      source?: string;
      email?: string;
      phone?: string;
      discoveredCompetitors?: Array<{
        name: string;
        url?: string;
        reason?: string;
      }>;
      /**
       * Kullanıcının işaretlediği ana 3 rakip. runAudit43 bu rakiplerin
       * her biri için paralel audit çalıştırır (competitorValues doldurur).
       * Yoksa discoveredCompetitors'tan ilk 3 otomatik kullanılır.
       */
      selectedCompetitors?: Array<{
        name: string;
        url: string;
      }>;
      // Perplexity discovery sonucu — Brand'ı zenginleştirmek ve Prompt
      // tablosuna targetQueries yazmak için kullanılır.
      discoveryResult?: {
        sector?: string;
        description?: string;
        products?: string[];
        services?: string[];
        expertise?: string[];
        targetQueries?: Array<{ query: string; language?: string }>;
        location?: { city?: string; district?: string };
        targetCountries?: string[];
        siteLanguages?: string[];
        priceSegment?: string;
        category?: string;
      };
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

    // FALLBACK: Session cookie yoksa ama body'de email/phone varsa,
    // onlardan Profile.id bulup userId olarak kullan. Bu Brand oluşturmanın
    // garanti altına alınması için kritik — session cookie set etme timing
    // sorunu yaşarsak bile Brand yazılır, /panel redirect loop'u kırılır.
    if (!userId && (bodyEmail || bodyPhone)) {
      try {
        const orConds: Array<Record<string, unknown>> = [];
        if (bodyEmail) orConds.push({ email: bodyEmail.toLowerCase().trim() });
        if (bodyPhone) orConds.push({ phone: bodyPhone });
        const profile = await prisma.profile.findFirst({
          where: { OR: orConds },
          select: { id: true },
        });
        if (profile) {
          userId = profile.id;
          console.log(
            `[api/run-audit-43] Session yok, body fallback ile userId=${userId} bulundu`,
          );
        }
      } catch (err) {
        console.warn("[api/run-audit-43] Body fallback profile lookup failed:", err);
      }
    }

    console.log(
      `[api/run-audit-43] start url=${url} brand="${brandName}" userType=${userType} userId=${userId ?? "null"}`,
    );

    // Ana 3 rakip kararı: selectedCompetitors varsa onu al, yoksa discovery'den ilk 3'ü
    const primaryCompetitors: Array<{ name: string; url: string }> = [];
    if (selectedCompetitors && selectedCompetitors.length > 0) {
      for (const c of selectedCompetitors.slice(0, 3)) {
        if (c.name && c.url) {
          primaryCompetitors.push({ name: c.name.trim(), url: c.url.trim() });
        }
      }
    } else if (discoveredCompetitors && discoveredCompetitors.length > 0) {
      // Default: discovery'deki ilk 3 rakip (URL'si olanlar)
      for (const c of discoveredCompetitors) {
        if (primaryCompetitors.length >= 3) break;
        if (c.name && c.url) {
          primaryCompetitors.push({ name: c.name.trim(), url: c.url.trim() });
        }
      }
    }

    console.log(
      `[api/run-audit-43] Primary competitors: ${primaryCompetitors.length} → ${primaryCompetitors.map((c) => c.name).join(", ")}`,
    );

    // Run 43-item audit (user + 3 rakip paralel)
    const auditResult = await runAudit43({
      url,
      brandName,
      userType,
      sector,
      location,
      competitorUrl,
      competitors: primaryCompetitors,
      keywords,
    });

    // Generate personal analysis (non-blocking — if fails, continue without it)
    const personalAnalysis = await generatePersonalAnalysis(auditResult, {
      usePremium: false, // Free tier uses Sonnet
    });

    // Brand upsert try bloğundan dışarıya taşınacak değişkenler
    let createdBrandId: string | null = null;
    let createdBrandName: string | null = null;

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

    // Authenticated user: freeAuditUsed işaretle + Brand kaydını upsert et
    if (userId) {
      // Admin: freeAuditUsed'ı işaretleme (sınırsız analiz).
      // Normal kullanıcı: aynı telefon/e-posta ile tekrar /analiz denenirse
      // can-start engel olur.
      if (!isAdminRequest) {
        try {
          await prisma.profile.update({
            where: { id: userId },
            data: {
              freeAuditUsed: true,
              freeAuditUsedAt: new Date(),
              lastLoginAt: new Date(),
            },
          });
        } catch (err) {
          console.warn("[api/run-audit-43] freeAuditUsed update failed:", err);
        }
      } else {
        try {
          await prisma.profile.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
          });
        } catch {}
      }

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

          // 3) Yeni brand oluştur — discovery sonucu varsa onunla zenginleştir
          const discoverySector = discoveryResult?.sector ?? sector ?? null;
          const discoveryProducts = discoveryResult?.products ?? [];
          const discoveryServices = discoveryResult?.services ?? [];
          const discoveryExpertise = discoveryResult?.expertise ?? [];
          const discoveryCity =
            discoveryResult?.location?.city ?? location ?? null;

          // Service regions: location + discovery city birleşimi
          const regions = new Set<string>();
          if (location) regions.add(location);
          if (discoveryCity) regions.add(discoveryCity);

          // Competitor names/domains: discoveredCompetitors'tan
          const compNames = (discoveredCompetitors ?? [])
            .map((c) => c.name)
            .filter(Boolean);
          const compDomains = (discoveredCompetitors ?? [])
            .map((c) => c.url)
            .filter((u): u is string => !!u);

          brand = await prisma.brand.create({
            data: {
              profileId: userId,
              name: brandName,
              domain: normalizedDomain,
              sector: discoverySector,
              userType,
              type: userType === "kisi" ? "kisisel" : "firma",
              isDefault: true,
              serviceRegions: Array.from(regions),
              // Ürün + hizmet + uzmanlık — discovery'den
              businessCategories: [
                ...discoveryProducts,
                ...discoveryServices,
              ].slice(0, 20),
              specialties: discoveryExpertise.slice(0, 10),
              strengths: [],
              weaknesses: [],
              competitorNames: compNames,
              competitorDomains: compDomains,
              // Sonar ham verisi — ayarlar/profil sayfasında kullanmak için
              sonarAnalysis: discoveryResult
                ? (discoveryResult as unknown as Prisma.InputJsonValue)
                : Prisma.JsonNull,
            },
          });
          console.log(
            `[api/run-audit-43] Created new Brand id=${brand.id} name="${brandName}" domain="${normalizedDomain}" for user=${userId}`,
          );
        } else {
          // Mevcut brand'ı güncelle (default yap + konum/sector + discovery)
          const updateData: Record<string, unknown> = { isDefault: true };
          if (location && !brand.serviceRegions?.includes(location)) {
            updateData.serviceRegions = [...(brand.serviceRegions ?? []), location];
          }
          if (brandName && brand.name !== brandName) {
            updateData.name = brandName;
          }
          const newSector = discoveryResult?.sector ?? sector;
          if (newSector && !brand.sector) {
            updateData.sector = newSector;
          }
          if (discoveryResult) {
            const discoveryProducts = discoveryResult.products ?? [];
            const discoveryServices = discoveryResult.services ?? [];
            if (discoveryProducts.length > 0 || discoveryServices.length > 0) {
              updateData.businessCategories = [
                ...discoveryProducts,
                ...discoveryServices,
              ].slice(0, 20);
            }
            if ((discoveryResult.expertise ?? []).length > 0) {
              updateData.specialties = discoveryResult.expertise!.slice(0, 10);
            }
            updateData.sonarAnalysis =
              discoveryResult as unknown as Prisma.InputJsonValue;
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

        // DISCOVERY SORGULARINI PROMPT TABLOSUNA YAZ
        // Kullanıcı dashboard'a geldiğinde "Senin Yerine Kim?" sayfasında
        // 10+ sorgu görür. Bu sorgular daha sonra weekly scan'de kullanılır.
        let promptsCreated = false;
        if (discoveryResult?.targetQueries && discoveryResult.targetQueries.length > 0) {
          try {
            // Mevcut prompt'ları silip yenilerini yaz (ilk analiz)
            const existingPrompts = await prisma.prompt.count({
              where: { brandId: brand.id },
            });
            if (existingPrompts === 0) {
              await prisma.prompt.createMany({
                data: discoveryResult.targetQueries.slice(0, 15).map((q) => ({
                  brandId: brand!.id,
                  text: q.query,
                  tags: q.language ? [q.language] : [],
                  source: "sonar",
                  isActive: true,
                })),
              });
              promptsCreated = true;
              console.log(
                `[api/run-audit-43] Created ${discoveryResult.targetQueries.length} prompts for brand ${brand.id}`,
              );
            }
          } catch (err) {
            console.warn("[api/run-audit-43] Prompt create failed:", err);
          }
        }

        // OTO-SCAN TETİKLE: ilk audit sonrası 5 AI platformuna sorgu at
        // PromptResult tablosu dolsun → /panel/aramalar ve /panel/genel'de
        // platform yanıtları görünsün.
        if (promptsCreated) {
          console.log(
            `[api/run-audit-43] Auto-scan trigger: prompts yazıldı brandId=${brand.id}`,
          );
          try {
            const platforms = getAvailablePlatforms();
            console.log(
              `[api/run-audit-43] Available AI platforms: ${platforms.length} → ${platforms.join(", ")}`,
            );
            if (platforms.length === 0) {
              console.error(
                "[api/run-audit-43] ⚠️ KRİTİK: Hiçbir AI provider aktif değil — env var'ları (OPENAI_API_KEY, GH7_ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, PERPLEXITY_API_KEY, SERPAPI_KEY) kontrol edin. Scan atlandı.",
              );
            } else {
              const running = await prisma.scan.findFirst({
                where: { brandId: brand.id, status: "running" },
              });
              if (running) {
                console.log(
                  `[api/run-audit-43] Running scan var (${running.id}) — yenisi eklenmedi.`,
                );
              } else {
                const autoScan = await prisma.scan.create({
                  data: {
                    brandId: brand.id,
                    status: "pending",
                    type: "free_test",
                  },
                });
                console.log(
                  `[api/run-audit-43] Auto-scan queued scanId=${autoScan.id} brandId=${brand.id} platforms=${platforms.length}`,
                );
                // Background execution — response hemen dönsün
                after(async () => {
                  const scanStart = Date.now();
                  try {
                    console.log(
                      `[api/run-audit-43] executeScan() başlıyor scanId=${autoScan.id}`,
                    );
                    await executeScan(autoScan.id, brand!.id);
                    const elapsed = Date.now() - scanStart;
                    const finalScan = await prisma.scan.findUnique({
                      where: { id: autoScan.id },
                      include: { _count: { select: { results: true } } },
                    });
                    console.log(
                      `[api/run-audit-43] ✅ Auto-scan completed scanId=${autoScan.id} status=${finalScan?.status} results=${finalScan?._count.results} elapsed=${elapsed}ms`,
                    );
                  } catch (e) {
                    const elapsed = Date.now() - scanStart;
                    console.error(
                      `[api/run-audit-43] ❌ Auto-scan FAILED scanId=${autoScan.id} elapsed=${elapsed}ms error:`,
                      e instanceof Error ? `${e.name}: ${e.message}` : String(e),
                    );
                    if (e instanceof Error && e.stack) {
                      console.error(
                        `[api/run-audit-43] Stack:`,
                        e.stack.slice(0, 500),
                      );
                    }
                    try {
                      await prisma.scan.update({
                        where: { id: autoScan.id },
                        data: { status: "failed", completedAt: new Date() },
                      });
                    } catch (updateErr) {
                      console.error(
                        `[api/run-audit-43] Scan failed mark edilemedi:`,
                        updateErr,
                      );
                    }
                  }
                });
              }
            }
          } catch (err) {
            console.error("[api/run-audit-43] Auto-scan trigger exception:", err);
          }
        } else {
          console.log(
            `[api/run-audit-43] promptsCreated=false — zaten prompt vardı veya targetQueries boş. Scan atlandı.`,
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

        // Ana 3 rakibi isPrimary=true olarak işaretle
        // (audit motorunun çalıştığı rakipler → dashboard'da karşılaştırma)
        if (primaryCompetitors.length > 0) {
          try {
            // Önce tüm rakiplerin isPrimary'sini false yap (temiz başla)
            await prisma.competitor.updateMany({
              where: { brandId: brand.id },
              data: { isPrimary: false },
            });

            // Seçilen rakipleri primary yap (name eşleşmesiyle)
            for (const c of primaryCompetitors) {
              await prisma.competitor.updateMany({
                where: {
                  brandId: brand.id,
                  name: { equals: c.name, mode: "insensitive" },
                },
                data: { isPrimary: true },
              });
            }
            console.log(
              `[api/run-audit-43] ${primaryCompetitors.length} rakip isPrimary=true olarak işaretlendi`,
            );
          } catch (err) {
            console.warn(
              "[api/run-audit-43] isPrimary update failed:",
              err,
            );
          }
        }

        // KRİTİK: Yeni/güncellenen brand'i aktif yap — cookie'yi yaz.
        // Aksi halde getActiveBrand() eski brand'i (önceki cookie) döner.
        try {
          const cookieStore = await cookies();
          cookieStore.set(ACTIVE_BRAND_COOKIE, brand.id, {
            httpOnly: false,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
          console.log(
            `[api/run-audit-43] Active brand cookie set: ${brand.id} (${brand.name})`,
          );
          createdBrandId = brand.id;
          createdBrandName = brand.name;
        } catch (err) {
          console.warn("[api/run-audit-43] Cookie set failed:", err);
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
      brandId: createdBrandId, // frontend switch fallback için
      brandName: createdBrandName,
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
