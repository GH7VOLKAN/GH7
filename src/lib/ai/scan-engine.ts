import { prisma } from "@/lib/db";
import { captureError } from "@/lib/monitoring";
import { getAvailableProviders } from "./provider-registry";
import { analyzeResponse } from "./analyzer";
import { calculateAndStoreScore } from "./score-calculator";
import { updateCompetitorScores } from "./competitor-scorer";
import { discoverSourceDomains } from "./source-discoverer";
import { verifyScanChecklistItems } from "./checklist-verifier";
import { sendNotification } from "@/lib/notifications/send";
import { generateQueryVariations } from "@/lib/query-variation";
import { feedScanToQueryPages } from "@/lib/query-pages/feed";
import { classifyResponseQuality, isWeakQuality, type ResponseQuality } from "./response-quality";
import { enhanceQueryForRetry } from "./query-enhancer";
import type { AIProvider } from "./providers/base";
import type { AnalysisResult, AIResponse } from "./types";

interface PromptPlatformOutcome {
  platform: string;
  analysis: AnalysisResult;
  aiResponse: AIResponse;
  responseQuality: ResponseQuality;
  retryAttempt: number;
}

// Process prompts in parallel batches for speed
const PROMPT_BATCH_SIZE = 5;

/**
 * Direct AI call — NO CACHE.
 *
 * Her sorgu her seferinde taze yanıt alır. Neden:
 * - Temperature 0.7 ile her yanıt farklı → mention rate ölçümü
 * - "100 kişi sorsa kaçında çıkarsın" simülasyonu
 * - Cache'lemek bu ölçümü bozar
 *
 * Cache sadece şuralarda kullanılır:
 * - PageSpeed (24 saat) — site performansı sık değişmez
 * - Sonar onboarding (12 saat) — firma profili kısa sürede değişmez
 * - Rate limiting — Redis ile
 */
async function sendPromptDirect(
  provider: AIProvider,
  promptText: string,
): Promise<AIResponse> {
  return provider.sendPrompt(promptText);
}

/**
 * Bir prompt'u tek bir platformda çalıştırır, analiz eder ve quality sınıflandırır.
 * PromptResult yazmaz — sonucu geriye döndürür ki retry logic kullanabilsin.
 */
async function runPromptOnProvider(params: {
  provider: AIProvider;
  promptText: string;
  variationCount: number;
  brandName: string;
  globalIdx: number;
  retryAttempt: number;
}): Promise<PromptPlatformOutcome> {
  const { provider, promptText, variationCount, brandName, globalIdx, retryAttempt } = params;
  const platformTimer = Date.now();

  const variations = generateQueryVariations(promptText).slice(0, variationCount);

  const variationResults = await Promise.allSettled(
    variations.map((v) => sendPromptDirect(provider, v)),
  );

  const fulfilledResponses = variationResults
    .filter((r): r is PromiseFulfilledResult<AIResponse> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((r) => !r.error);

  const allResponses = variationResults
    .filter((r): r is PromiseFulfilledResult<AIResponse> => r.status === "fulfilled")
    .map((r) => r.value);

  const aiResponse: AIResponse =
    fulfilledResponses.length > 0
      ? fulfilledResponses[0]
      : allResponses.length > 0
        ? allResponses[0]
        : { platform: provider.platform, content: "", error: "Tüm varyasyonlar başarısız oldu" } as AIResponse;

  if (variations.length > 1) {
    console.log(
      `[scan-engine] ${provider.platform} prompt ${globalIdx}${retryAttempt > 0 ? ` (retry)` : ""}: ${variations.length} varyasyon, ${fulfilledResponses.length} başarılı`,
    );
  }

  if (aiResponse.error) {
    console.warn(
      `[scan-engine] ${provider.platform} ERROR for prompt ${globalIdx}${retryAttempt > 0 ? ` (retry)` : ""}: ${aiResponse.error}`,
    );
  } else {
    console.log(
      `[scan-engine] ${provider.platform} OK for prompt ${globalIdx}${retryAttempt > 0 ? ` (retry)` : ""}: ${aiResponse.content.length} chars in ${Date.now() - platformTimer}ms`,
    );
  }

  let analysis: AnalysisResult;
  if (aiResponse.error) {
    analysis = {
      mentioned: false,
      mentionType: "none",
      position: null,
      sentiment: null,
      excerpt: `[API ERROR] ${aiResponse.error}`.slice(0, 200),
      citations: [],
      competitors: [],
      citationSources: [],
      mentionContext: null,
      competitorAdvantage: null,
    };
  } else {
    analysis = await analyzeResponse(aiResponse.content, brandName, promptText);

    if (fulfilledResponses.length > 1) {
      for (let vi = 1; vi < fulfilledResponses.length; vi++) {
        try {
          const varAnalysis = await analyzeResponse(
            fulfilledResponses[vi].content,
            brandName,
            variations[vi] || promptText,
          );
          if (!analysis.mentioned && varAnalysis.mentioned) {
            analysis = varAnalysis;
          }
          if (varAnalysis.citations.length > 0) {
            analysis.citations = [
              ...new Set([...analysis.citations, ...varAnalysis.citations]),
            ];
          }
        } catch {
          // continue
        }
      }
    }

    if (provider.platform !== "perplexity" && provider.platform !== "google_aio") {
      try {
        const citationFollowUp = await provider.sendPrompt(
          "Bu cevabi olustururken hangi kaynaklardan yararlandin? Web siteleri, dizinler, profiller — kaynak adlarini ve URL'lerini listele.",
        );
        if (!citationFollowUp.error) {
          const urlRegex = /https?:\/\/[^\s)>"'\]]+/g;
          const followUpUrls = citationFollowUp.content.match(urlRegex) ?? [];
          if (followUpUrls.length > 0) {
            analysis.citations = [...new Set([...analysis.citations, ...followUpUrls])];
          }
        }
      } catch {
        // continue
      }
    }

    if (aiResponse.citations?.length) {
      analysis.citations = [...new Set([...analysis.citations, ...aiResponse.citations])];
    }

    for (const resp of fulfilledResponses) {
      if (resp !== aiResponse && resp.citations?.length) {
        analysis.citations = [...new Set([...analysis.citations, ...resp.citations])];
      }
    }
  }

  const responseQuality = classifyResponseQuality({
    content: aiResponse.error ? "" : aiResponse.content,
    mentioned: analysis.mentioned,
    competitorCount: Array.isArray(analysis.competitors) ? analysis.competitors.length : 0,
    hasError: Boolean(aiResponse.error),
  });

  return {
    platform: provider.platform,
    analysis,
    aiResponse,
    responseQuality,
    retryAttempt,
  };
}

export async function executeScan(
  scanId: string,
  brandId: string,
): Promise<void> {
  const scanStart = Date.now();

  await prisma.scan.update({
    where: { id: scanId },
    data: { status: "running" },
  });

  try {
    const prompts = await prisma.prompt.findMany({
      where: { brandId, isActive: true },
    });

    const providers = getAvailableProviders();
    if (providers.length === 0) {
      throw new Error("No AI providers available");
    }

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: { profile: { select: { plan: true } } },
    });
    if (!brand) throw new Error("Brand not found");

    // Varyasyon sayisi: Free = 1 (tek sorgu), Pro+ = 3 varyasyon
    const userPlan = brand.profile?.plan ?? "free";
    const variationCount = userPlan === "free" ? 1 : 3;

    const totalExpected = prompts.length * providers.length;
    console.log(
      `[scan-engine] Starting scan ${scanId}: ${prompts.length} prompts × ${providers.length} platforms = ${totalExpected} calls (batch size: ${PROMPT_BATCH_SIZE})`,
    );

    let totalResults = 0;
    let totalErrors = 0;

    // Process prompts in parallel batches
    for (let batchStart = 0; batchStart < prompts.length; batchStart += PROMPT_BATCH_SIZE) {
      const batch = prompts.slice(batchStart, batchStart + PROMPT_BATCH_SIZE);
      const batchNum = Math.floor(batchStart / PROMPT_BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(prompts.length / PROMPT_BATCH_SIZE);
      const batchTimer = Date.now();

      // Brand context for retry query enhancement
      const brandCity = brand.city ?? brand.serviceRegions?.[0];
      const brandUserType = brand.userType as
        | "firma"
        | "kisi"
        | "eticaret"
        | "yurtdisi"
        | undefined;

      // Run all prompts in this batch concurrently
      const batchResults = await Promise.allSettled(
        batch.map(async (prompt, promptIdx) => {
          const globalIdx = batchStart + promptIdx + 1;

          // 1) Initial run — all platforms in parallel
          const initialSettled = await Promise.allSettled(
            providers.map((provider) =>
              runPromptOnProvider({
                provider,
                promptText: prompt.text,
                variationCount,
                brandName: brand.name,
                globalIdx,
                retryAttempt: 0,
              }),
            ),
          );

          const outcomes: PromptPlatformOutcome[] = initialSettled
            .filter((r): r is PromiseFulfilledResult<PromptPlatformOutcome> => r.status === "fulfilled")
            .map((r) => r.value);

          const failed = initialSettled.filter((r) => r.status === "rejected");
          totalErrors += failed.length;
          for (const f of failed) {
            captureError((f as PromiseRejectedResult).reason, {
              context: "scan-engine-platform",
              scanId,
              promptIndex: globalIdx,
            });
          }

          // 2) Retry logic — 3+ platform weak quality dönerse enhanced query ile weak platformlarda tek retry
          const weakPlatforms = outcomes
            .filter((o) => isWeakQuality(o.responseQuality))
            .map((o) => o.platform);

          if (weakPlatforms.length >= 3) {
            const enhancedQuery = enhanceQueryForRetry(prompt.text, {
              name: brand.name,
              city: brandCity,
              userType: brandUserType,
            });
            console.log(
              `[scan-engine] Prompt ${globalIdx}: ${weakPlatforms.length} weak platform, retry with enhanced query: "${enhancedQuery.slice(0, 80)}…"`,
            );

            const retryProviders = providers.filter((p) => weakPlatforms.includes(p.platform));
            const retrySettled = await Promise.allSettled(
              retryProviders.map((provider) =>
                runPromptOnProvider({
                  provider,
                  promptText: enhancedQuery,
                  variationCount,
                  brandName: brand.name,
                  globalIdx,
                  retryAttempt: 1,
                }),
              ),
            );

            for (const rs of retrySettled) {
              if (rs.status !== "fulfilled") continue;
              const retryOutcome = rs.value;
              const idx = outcomes.findIndex((o) => o.platform === retryOutcome.platform);
              if (idx < 0) continue;

              // Retry direct_list dönerse orijinalin yerine al; diğer durumda sadece retryAttempt işaretle
              if (retryOutcome.responseQuality === "direct_list") {
                outcomes[idx] = retryOutcome;
              } else {
                // Retry sonucunu sakla ama orijinal weak sonucu koruyup retryAttempt=1 olarak işaretle
                outcomes[idx] = { ...outcomes[idx], retryAttempt: 1 };
              }
            }
          }

          // 3) Persist — tüm platform sonuçlarını yaz
          const now = new Date();
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          const scanWeek = Math.ceil(
            ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
          );
          const scanDay = now.getUTCDay() || 7;

          for (const o of outcomes) {
            try {
              await prisma.promptResult.create({
                data: {
                  scanId,
                  promptId: prompt.id,
                  platform: o.platform,
                  mentioned: o.analysis.mentioned,
                  position: o.analysis.position,
                  sentiment: o.analysis.sentiment,
                  excerpt: o.analysis.excerpt,
                  fullResponse: o.aiResponse.error
                    ? `[ERROR] ${o.aiResponse.error}`
                    : o.aiResponse.content,
                  citations: o.analysis.citations,
                  competitors: JSON.parse(JSON.stringify(o.analysis.competitors ?? [])),
                  citationSources:
                    o.analysis.citationSources.length > 0
                      ? JSON.parse(JSON.stringify(o.analysis.citationSources))
                      : undefined,
                  mentionType: o.analysis.mentionType,
                  mentionContext: o.analysis.mentionContext,
                  competitorAdvantage: o.analysis.competitorAdvantage,
                  responseQuality: o.responseQuality,
                  retryAttempt: o.retryAttempt,
                  scanWeek,
                  scanDay,
                } as never,
              });
              totalResults++;
            } catch (err) {
              captureError(err, {
                context: "scan-engine-persist",
                scanId,
                promptIndex: globalIdx,
                platform: o.platform,
              });
            }
          }
        }),
      );

      const batchMs = Date.now() - batchTimer;
      console.log(
        `[scan-engine] Batch ${batchNum}/${totalBatches} (${batch.length} prompts) done in ${batchMs}ms — ${totalResults}/${totalExpected} total`,
      );

      // Rate limiting: 2-3 saniye bekleme arası (spec F.8)
      if (batchStart + PROMPT_BATCH_SIZE < prompts.length) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }

    await calculateAndStoreScore(scanId, brandId);
    await updateCompetitorScores(scanId, brandId);
    await discoverSourceDomains(scanId, brandId);
    await verifyScanChecklistItems(scanId, brandId);

    // Smart alerts: detect mention losses, competitor surges, etc.
    const { generateSmartAlerts } = await import("@/lib/ai/smart-alerts");
    await generateSmartAlerts(scanId, brandId);

    // Impact tracking: measure effect of completed actions
    const { measureCompletionImpact } = await import("@/lib/ai/impact-tracker");
    await measureCompletionImpact(scanId, brandId);

    // Get current score for notification
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentScore = await prisma.scoreHistory.findUnique({
      where: { brandId_date: { brandId, date: today } },
    });
    const previousScore = await prisma.scoreHistory.findFirst({
      where: { brandId, date: { lt: today } },
      orderBy: { date: "desc" },
    });

    const score = currentScore?.mentionScore ?? 0;
    const diff = previousScore ? score - previousScore.mentionScore : 0;
    const diffText = diff !== 0 ? ` (${diff > 0 ? "+" : ""}${diff})` : "";

    const notificationType = diff > 0 ? "score_up" : diff < 0 ? "score_down" : "scan_completed";
    await sendNotification({
      brandId,
      type: notificationType,
      title: "Tarama tamamlandı",
      message: `Görünürlük Puanı: ${score}/100${diffText}`,
      data: {
        scanId,
        score,
        diff,
        ...(previousScore ? { oldScore: previousScore.mentionScore, newScore: score } : {}),
      },
    });

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "completed", completedAt: new Date() },
    });

    // Non-blocking: feed scan results to query pages pipeline
    feedScanToQueryPages(scanId, brandId).catch((err) =>
      console.error("[scan-engine] Query pages pipeline error:", err),
    );

    const totalMs = Date.now() - scanStart;
    console.log(
      `[scan-engine] Scan ${scanId} completed: ${totalResults} results (${totalErrors} errors) in ${Math.round(totalMs / 1000)}s, score: ${score}/100`,
    );
  } catch (error) {
    await sendNotification({
      brandId,
      type: "scan_failed",
      title: "Tarama başarısız",
      message: "Tarama sırasında bir hata oluştu.",
      data: { scanId },
    });

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "failed", completedAt: new Date() },
    });
    captureError(error, { context: "scan-engine", scanId, brandId });
  }
}
