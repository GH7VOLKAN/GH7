import { prisma } from "@/lib/db";
import { captureError } from "@/lib/monitoring";
import { getAvailableProviders } from "./provider-registry";
import { analyzeResponse } from "./analyzer";
import { calculateAndStoreScore } from "./score-calculator";
import { updateCompetitorScores } from "./competitor-scorer";
import { discoverSourceDomains } from "./source-discoverer";
import { verifyScanChecklistItems } from "./checklist-verifier";
import { sendNotification } from "@/lib/notifications/send";
import { makeCacheKey } from "@/lib/redis";
import { withCache } from "@/lib/cache";
import { generateQueryVariations } from "@/lib/query-variation";
import { feedScanToQueryPages } from "@/lib/query-pages/feed";
import type { AIProvider } from "./providers/base";
import type { AnalysisResult, AIResponse } from "./types";

// Process prompts in parallel batches for speed
const PROMPT_BATCH_SIZE = 5;

// In-memory fallback cache (1 hour TTL) — used when Redis is unavailable
const memCache = new Map<string, { data: AIResponse; expiresAt: number }>();
const MEM_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Cached AI call — SHA256 key, 6-hour Redis TTL (via withCache) + 1-hour in-memory fallback.
 * Same prompt+platform always returns cached response if available.
 * Cross-user safe: brandless prompts mean same key = same result.
 */
async function cachedSendPrompt(
  provider: AIProvider,
  promptText: string,
): Promise<AIResponse> {
  // Cache key includes week number — spec F.7: SHA256(prompt + platform + week_number)
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  const cacheKey = makeCacheKey("ai", provider.platform, promptText, String(weekNum));

  // 1. Check in-memory fallback first (fastest)
  const memEntry = memCache.get(cacheKey);
  if (memEntry && memEntry.expiresAt > Date.now()) {
    return memEntry.data;
  }

  // 2. Use withCache for Redis + fetcher (graceful fallback if Redis unavailable)
  const { data: response } = await withCache<AIResponse>(
    cacheKey,
    6 * 60 * 60, // 6 hours
    () => provider.sendPrompt(promptText),
  );

  // 3. Cache successful responses in memory layer too
  if (!response.error) {
    memCache.set(cacheKey, { data: response, expiresAt: Date.now() + MEM_TTL });
  }

  return response;
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

      // Run all prompts in this batch concurrently
      const batchResults = await Promise.allSettled(
        batch.map(async (prompt, promptIdx) => {
          const globalIdx = batchStart + promptIdx + 1;

          // For each prompt, run all platforms in parallel
          const platformResults = await Promise.allSettled(
            providers.map(async (provider) => {
              const platformTimer = Date.now();

              // Sorgu varyasyonlari: Pro+ icin 3, Free icin 1
              const variations = generateQueryVariations(prompt.text).slice(0, variationCount);

              // Tum varyasyonlari paralel gonder
              const variationResults = await Promise.allSettled(
                variations.map((v) => cachedSendPrompt(provider, v)),
              );

              // Basarili sonuclari topla
              const fulfilledResponses = variationResults
                .filter((r): r is PromiseFulfilledResult<AIResponse> => r.status === "fulfilled")
                .map((r) => r.value)
                .filter((r) => !r.error);

              // Fallback: hicbir varyasyon basarili olmazsa, hata sonucu kullan
              const allResponses = variationResults
                .filter((r): r is PromiseFulfilledResult<AIResponse> => r.status === "fulfilled")
                .map((r) => r.value);

              // Ana yaniti sec: basarili olanlardan ilkini kullan, yoksa ilk hata yanitini
              const aiResponse = fulfilledResponses.length > 0
                ? fulfilledResponses[0]
                : allResponses.length > 0
                  ? allResponses[0]
                  : { platform: provider.platform, content: "", error: "Tüm varyasyonlar başarısız oldu" } as AIResponse;

              if (variations.length > 1) {
                console.log(
                  `[scan-engine] ${provider.platform} prompt ${globalIdx}: ${variations.length} varyasyon, ${fulfilledResponses.length} başarılı`,
                );
              }

              if (aiResponse.error) {
                console.warn(
                  `[scan-engine] ${provider.platform} ERROR for prompt ${globalIdx}: ${aiResponse.error}`,
                );
              } else {
                console.log(
                  `[scan-engine] ${provider.platform} OK for prompt ${globalIdx}: ${aiResponse.content.length} chars in ${Date.now() - platformTimer}ms`,
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
                // Ana varyasyonun analizini yap
                analysis = await analyzeResponse(
                  aiResponse.content,
                  brand.name,
                  prompt.text,
                );

                // Ek basarili varyasyonlarin analizini yap ve en iyi sonucu sec
                // mentioned=true olan varsa onu tercih et (daha guclu sinyal)
                if (fulfilledResponses.length > 1) {
                  for (let vi = 1; vi < fulfilledResponses.length; vi++) {
                    try {
                      const varAnalysis = await analyzeResponse(
                        fulfilledResponses[vi].content,
                        brand.name,
                        variations[vi] || prompt.text,
                      );
                      // Eger ana analiz mentioned=false ama varyasyon mentioned=true ise, varyasyonu kullan
                      if (!analysis.mentioned && varAnalysis.mentioned) {
                        analysis = varAnalysis;
                      }
                      // Citation'lari her zaman birleştir
                      if (varAnalysis.citations.length > 0) {
                        analysis.citations = [
                          ...new Set([...analysis.citations, ...varAnalysis.citations]),
                        ];
                      }
                    } catch {
                      // Varyasyon analizi basarisiz olursa devam et
                    }
                  }
                }

                // Perplexity ve Google AIO zaten citation donduruyor, diger platformlara takip sorusu sor
                // Google AIO SerpAPI üzerinden zaten kaynak veriyor
                if (provider.platform !== "perplexity" && provider.platform !== "google_aio") {
                  try {
                    const citationFollowUp = await provider.sendPrompt(
                      "Bu cevabi olustururken hangi kaynaklardan yararlandin? Web siteleri, dizinler, profiller — kaynak adlarini ve URL'lerini listele."
                    );
                    if (!citationFollowUp.error) {
                      const urlRegex = /https?:\/\/[^\s)>"'\]]+/g;
                      const followUpUrls = citationFollowUp.content.match(urlRegex) ?? [];
                      if (followUpUrls.length > 0) {
                        analysis.citations = [
                          ...new Set([...analysis.citations, ...followUpUrls]),
                        ];
                      }
                    }
                  } catch {
                    // Citation takip sorusu basarisiz olursa devam et
                  }
                }

                if (aiResponse.citations?.length) {
                  analysis.citations = [
                    ...new Set([...analysis.citations, ...aiResponse.citations]),
                  ];
                }

                // Tum varyasyonlarin citation'larini da ekle
                for (const resp of fulfilledResponses) {
                  if (resp !== aiResponse && resp.citations?.length) {
                    analysis.citations = [
                      ...new Set([...analysis.citations, ...resp.citations]),
                    ];
                  }
                }
              }

              // Hafta numarası ve gün hesapla (mention rate takibi için)
              const now = new Date();
              const startOfYear = new Date(now.getFullYear(), 0, 1);
              const scanWeek = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
              const scanDay = now.getUTCDay() || 7; // 1=Pzt ... 7=Paz

              await prisma.promptResult.create({
                data: {
                  scanId,
                  promptId: prompt.id,
                  platform: provider.platform,
                  mentioned: analysis.mentioned,
                  position: analysis.position,
                  sentiment: analysis.sentiment,
                  excerpt: analysis.excerpt,
                  fullResponse: aiResponse.error ? `[ERROR] ${aiResponse.error}` : aiResponse.content.slice(0, 3000),
                  citations: analysis.citations,
                  competitors: JSON.parse(JSON.stringify(analysis.competitors ?? [])),
                  citationSources: analysis.citationSources.length > 0 ? JSON.parse(JSON.stringify(analysis.citationSources)) : undefined,
                  mentionType: analysis.mentionType,
                  mentionContext: analysis.mentionContext,
                  competitorAdvantage: analysis.competitorAdvantage,
                  scanWeek,
                  scanDay,
                },
              });

              totalResults++;
            }),
          );

          const failed = platformResults.filter((r) => r.status === "rejected");
          totalErrors += failed.length;
          for (const f of failed) {
            captureError(f.reason, { context: "scan-engine-platform", scanId, promptIndex: globalIdx });
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
