/**
 * GH7.ai — Pro Activation Pipeline
 *
 * Pro plana gecis sonrasi otomatik tetiklenen tam pipeline:
 * 1. 50 prompt uret (Sonar 5-sorgu + Sonnet)
 * 2. Ilk tarama baslat (50 prompt x 4 platform)
 * 3. Tarama sonuclarindan rakipleri otomatik kesfet
 * 4. Ilk 5 rakip icin Sonar sorgusu
 * 5. Opus "neden onde" analizi
 * 6. GEO audit calistir
 * 7. Gelisim plani olustur
 *
 * ~15 dakika surebilir, payment response'u BLOKLAMAZ.
 */

import { prisma } from "@/lib/db";
import { generateSmartPrompts } from "./prompt-generator";
import { executeScan } from "./scan-engine";
import { discoverCompetitors } from "./competitor-discoverer";
import { analyzeWhyCompetitorAhead } from "./competitor-analyzer";
import { runSiteAudit } from "./site-auditor";
import { runPersonalAudit } from "./personal-auditor";
import { persistAuditResults } from "./audit-persister";
import { generateActionPlan } from "./action-plan-generator";
import { sendNotification } from "@/lib/notifications/send";
import { getPlanLimits } from "@/lib/plans";

interface ActivationProgress {
  step: string;
  success: boolean;
  detail?: string;
}

/**
 * Tam Pro aktivasyon pipeline'i calistir.
 *
 * Bu fonksiyon uzun surer (~15 dk). Payment callback'ten
 * fire-and-forget olarak cagirilmalidir.
 */
export async function triggerProActivation(brandId: string): Promise<void> {
  const startTime = Date.now();
  const progress: ActivationProgress[] = [];

  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    include: {
      profile: { select: { plan: true } },
      prompts: { where: { isActive: true }, select: { id: true } },
    },
  });

  if (!brand) {
    console.error(`[pro-activation] Brand not found: ${brandId}`);
    return;
  }

  const plan = brand.profile?.plan ?? "free";
  const planLimits = getPlanLimits(plan);
  const brandType = brand.type as "firma" | "kisisel";

  console.log(`[pro-activation] Starting full pipeline for "${brand.name}" (${brandId}), plan: ${plan}`);

  // ── Step 1: Generate 50 prompts (Sonar 5-query + Sonnet) ──
  try {
    // Mevcut promptlari sil ve yeniden uret (free'den upgrade ediyorsa 5 prompt vardi)
    const existingCount = brand.prompts.length;
    const targetCount = planLimits.maxPrompts; // Pro = 50

    if (existingCount < targetCount) {
      console.log(`[pro-activation] Step 1: Generating ${targetCount} prompts (currently ${existingCount})...`);

      // Mevcut promptlari sil
      await prisma.prompt.deleteMany({ where: { brandId } });

      const smartPrompts = await generateSmartPrompts(
        {
          name: brand.name,
          domain: brand.domain,
          sector: brand.sector,
          city: brand.city,
          type: brandType,
          profession: brand.profession,
          specialties: brand.specialties,
          competitorNames: brand.competitorNames,
        },
        targetCount,
      );

      if (smartPrompts.length > 0) {
        await prisma.prompt.createMany({
          data: smartPrompts.map((p) => ({
            brandId,
            text: p.text,
            tags: p.tags,
            source: p.source,
            category: p.category,
            isActive: true,
          })),
        });
        progress.push({ step: "prompts", success: true, detail: `${smartPrompts.length} prompt uretildi` });
      } else {
        progress.push({ step: "prompts", success: false, detail: "Prompt uretilemedi" });
      }
    } else {
      progress.push({ step: "prompts", success: true, detail: `Mevcut ${existingCount} prompt yeterli` });
    }
  } catch (err) {
    console.error("[pro-activation] Step 1 (prompts) failed:", err);
    progress.push({ step: "prompts", success: false, detail: String(err) });
  }

  // ── Step 2: Run first scan (50 prompts x 4 platforms) ──
  let scanId: string | null = null;
  try {
    console.log("[pro-activation] Step 2: Starting first scan...");

    const scan = await prisma.scan.create({
      data: { brandId, status: "pending" },
    });
    scanId = scan.id;

    await executeScan(scan.id, brandId);
    progress.push({ step: "scan", success: true, detail: `Scan ${scan.id} tamamlandi` });
  } catch (err) {
    console.error("[pro-activation] Step 2 (scan) failed:", err);
    progress.push({ step: "scan", success: false, detail: String(err) });
  }

  // ── Step 3: Auto-detect competitors from scan results ──
  try {
    console.log("[pro-activation] Step 3: Discovering competitors...");

    const result = await discoverCompetitors({
      name: brand.name,
      domain: brand.domain,
      sector: brand.sector,
      city: brand.city,
      type: brandType,
      specialties: brand.specialties,
      competitorNames: brand.competitorNames,
    });

    if (result.competitors.length > 0) {
      // Mevcut rakipleri sil, yenilerini ekle
      await prisma.competitor.deleteMany({ where: { brandId } });

      await prisma.competitor.createMany({
        data: result.competitors.map((c) => ({
          brandId,
          name: c.name,
          domain: c.domain,
          mentionScore: 0,
          readinessScore: 0,
          platforms: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0 },
          reason: c.reason,
          products: c.products,
          relevance: c.relevance,
          source: "ai_discovered",
          discoveredAt: new Date(),
        })),
      });

      progress.push({ step: "competitors", success: true, detail: `${result.competitors.length} rakip kesfedildi` });
    } else {
      progress.push({ step: "competitors", success: true, detail: "Rakip bulunamadi" });
    }
  } catch (err) {
    console.error("[pro-activation] Step 3 (competitors) failed:", err);
    progress.push({ step: "competitors", success: false, detail: String(err) });
  }

  // ── Step 4 & 5: Sonar queries on top 5 competitors + Opus "neden onde" analysis ──
  try {
    const competitors = await prisma.competitor.findMany({
      where: { brandId },
      orderBy: { mentionScore: "desc" },
      take: 5,
    });

    if (competitors.length > 0 && scanId) {
      console.log(`[pro-activation] Steps 4-5: Analyzing ${competitors.length} competitors...`);

      // Get brand's current score
      const latestScore = await prisma.scoreHistory.findFirst({
        where: { brandId },
        orderBy: { date: "desc" },
      });
      const brandScore = latestScore?.mentionScore ?? 0;

      for (const competitor of competitors) {
        try {
          // Find prompt results where this competitor appears
          const promptResults = await prisma.promptResult.findMany({
            where: {
              scanId,
              fullResponse: { contains: competitor.name },
            },
            include: { prompt: { select: { text: true } } },
            take: 15,
          });

          const appearances = promptResults.map((r) => ({
            promptText: r.prompt.text,
            platform: r.platform,
            excerpt: r.excerpt ?? r.fullResponse?.slice(0, 300) ?? "",
          }));

          // Run Opus "neden onde" analysis
          if (appearances.length > 0 || competitor.mentionScore > brandScore) {
            const analysis = await analyzeWhyCompetitorAhead(
              brand.name,
              competitor.name,
              brandScore,
              competitor.mentionScore,
              appearances,
              [], // competitorOnlySources — filled later by scan engine
            );

            // Store analysis as reason field
            await prisma.competitor.update({
              where: { id: competitor.id },
              data: {
                reason: `${analysis.summary}\n\nGucllu: ${analysis.strengths.join("; ")}\nZayif: ${analysis.weaknesses.join("; ")}`,
              },
            });
          }
        } catch (compErr) {
          console.error(`[pro-activation] Competitor analysis failed for ${competitor.name}:`, compErr);
        }
      }

      progress.push({ step: "competitor_analysis", success: true, detail: `${competitors.length} rakip analiz edildi` });
    } else {
      progress.push({ step: "competitor_analysis", success: true, detail: "Rakip analizi icin veri yok" });
    }
  } catch (err) {
    console.error("[pro-activation] Steps 4-5 (competitor analysis) failed:", err);
    progress.push({ step: "competitor_analysis", success: false, detail: String(err) });
  }

  // ── Step 6: GEO audit ──
  let auditResult = null;
  try {
    console.log("[pro-activation] Step 6: Running GEO audit...");

    auditResult = brandType === "kisisel"
      ? await runPersonalAudit({
          name: brand.name,
          domain: brand.domain,
          profession: brand.profession,
          city: brand.city,
          sector: brand.sector,
          specialties: brand.specialties,
        })
      : await runSiteAudit(brand.domain);

    await persistAuditResults(brandId, auditResult);
    progress.push({ step: "audit", success: true, detail: "GEO audit tamamlandi" });
  } catch (err) {
    console.error("[pro-activation] Step 6 (audit) failed:", err);
    progress.push({ step: "audit", success: false, detail: String(err) });
  }

  // ── Step 7: Generate gelisim plani (action plan) ──
  try {
    if (auditResult) {
      console.log("[pro-activation] Step 7: Generating gelisim plani...");

      const latestScore = await prisma.scoreHistory.findFirst({
        where: { brandId },
        orderBy: { date: "desc" },
      });
      const mentionScore = latestScore?.mentionScore ?? 0;

      await generateActionPlan(
        {
          id: brandId,
          name: brand.name,
          domain: brand.domain,
          type: brandType,
          sector: brand.sector,
          city: brand.city,
          profession: brand.profession,
          specialties: brand.specialties,
        },
        auditResult,
        mentionScore,
      );

      progress.push({ step: "action_plan", success: true, detail: "Gelisim plani olusturuldu" });
    } else {
      progress.push({ step: "action_plan", success: false, detail: "Audit sonucu yok, plan uretilemedi" });
    }
  } catch (err) {
    console.error("[pro-activation] Step 7 (action plan) failed:", err);
    progress.push({ step: "action_plan", success: false, detail: String(err) });
  }

  // ── Summary ──
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const successCount = progress.filter((p) => p.success).length;

  console.log(`[pro-activation] Pipeline completed for "${brand.name}" in ${elapsed}s — ${successCount}/${progress.length} steps succeeded`);
  for (const p of progress) {
    console.log(`  [${p.success ? "OK" : "FAIL"}] ${p.step}: ${p.detail ?? ""}`);
  }

  // Notify user
  try {
    await sendNotification({
      brandId,
      type: "scan_completed",
      title: "Pro aktivasyon tamamlandi",
      message: `Tum analizleriniz hazir! ${successCount}/${progress.length} adim basariyla tamamlandi.`,
      data: { progress },
    });
  } catch {
    // Notification failure is non-fatal
  }
}
