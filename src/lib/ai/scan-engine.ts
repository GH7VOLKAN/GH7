import { prisma } from "@/lib/db";
import { getAvailableProviders } from "./provider-registry";
import { analyzeResponse } from "./analyzer";
import { calculateAndStoreScore } from "./score-calculator";
import { updateCompetitorScores } from "./competitor-scorer";
import { discoverSourceDomains } from "./source-discoverer";
import type { AnalysisResult } from "./types";

export async function executeScan(
  scanId: string,
  brandId: string,
): Promise<void> {
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

    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) throw new Error("Brand not found");

    // Process prompts sequentially, platforms in parallel per prompt
    for (const prompt of prompts) {
      const platformResults = await Promise.allSettled(
        providers.map(async (provider) => {
          const aiResponse = await provider.sendPrompt(prompt.text);

          let analysis: AnalysisResult;
          if (aiResponse.error) {
            analysis = {
              mentioned: false,
              position: null,
              sentiment: null,
              excerpt: null,
              citations: [],
            };
          } else {
            analysis = await analyzeResponse(
              aiResponse.content,
              brand.name,
              prompt.text,
            );
            // Merge provider-native citations (Perplexity)
            if (aiResponse.citations?.length) {
              analysis.citations = [
                ...new Set([...analysis.citations, ...aiResponse.citations]),
              ];
            }
          }

          await prisma.promptResult.create({
            data: {
              scanId,
              promptId: prompt.id,
              platform: provider.platform,
              mentioned: analysis.mentioned,
              position: analysis.position,
              sentiment: analysis.sentiment,
              excerpt: analysis.excerpt,
              citations: analysis.citations,
            },
          });
        }),
      );

      for (const result of platformResults) {
        if (result.status === "rejected") {
          console.error("[scan-engine] Platform error:", result.reason);
        }
      }
    }

    await calculateAndStoreScore(scanId, brandId);
    await updateCompetitorScores(scanId, brandId);
    await discoverSourceDomains(scanId, brandId);

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

    await prisma.notification.create({
      data: {
        brandId,
        type: "scan_completed",
        title: "Tarama tamamlandı",
        message: `AI Bahsedilme Skoru: ${score}/100${diffText}`,
        data: { scanId, score, diff },
      },
    });

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "completed", completedAt: new Date() },
    });

    console.log(`[scan-engine] Scan ${scanId} completed`);
  } catch (error) {
    await prisma.notification.create({
      data: {
        brandId,
        type: "scan_failed",
        title: "Tarama başarısız",
        message: "Tarama sırasında bir hata oluştu.",
        data: { scanId },
      },
    });

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "failed", completedAt: new Date() },
    });
    console.error("[scan-engine] Scan failed:", error);
  }
}
