/**
 * Audit pipeline orchestrator (Brief G Aşama 2).
 *
 * Akış:
 * 1. DataForSEO On-Page crawl + robots/llms/llms-full/backlinks
 * 2. Perplexity Sonar brand mention test sorguları
 * 3. 43 madde evaluation (evaluators.ts)
 * 4. Audit.totalScore hesabı
 *
 * Aşama 3'te bundan sonra Opus çağrısı (marka-özel talimat) eklenecek.
 * Aşama 2 sonunda audit status "completed" olur (Opus aşama 3'te generating/completed'a geçecek).
 */

import { prisma } from "@/lib/db";
import {
  runOnPageScan,
  runBacklinksCheck,
  checkRobotsTxt,
  checkLlmsTxt,
  checkLlmsFullTxt,
} from "./dataforseo";
import { checkBrandMention } from "./perplexity";
import { evaluateItem, type EvalInput } from "./evaluators";
import { AUDIT_MASTER_ITEMS } from "./master-items";

async function updateProgress(
  auditId: string,
  data: { status?: string; progress?: number; currentStep?: string },
) {
  await prisma.audit.update({ where: { id: auditId }, data });
}

function buildTestQueries(brand: {
  name: string;
  sector: string | null;
  city: string | null;
}): string[] {
  const name = brand.name.trim();
  const sector = brand.sector?.trim();
  const city = brand.city?.trim() || "Türkiye";

  const queries = [
    `${name} hakkında bilgi`,
    `${name} nasıl?`,
    `${name} iletişim`,
  ];
  if (sector) {
    queries.push(`${sector} önerisi ${city}`);
    queries.push(`En iyi ${sector} ${city}`.trim());
  }
  return queries.filter((q) => q.length > 5);
}

export async function runAuditPipeline(auditId: string): Promise<void> {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: { brand: true },
  });
  if (!audit) throw new Error(`Audit ${auditId} bulunamadı`);

  try {
    // ═══ ADIM 1: DataForSEO tarama ═══
    await updateProgress(auditId, {
      status: "crawling",
      progress: 10,
      currentStep: "Site taranıyor...",
    });

    const domain = audit.brand.domain;

    // Paralel fetch: robots, llms, llms-full
    const [robotsTxt, llmsTxt, llmsFullTxt] = await Promise.all([
      checkRobotsTxt(domain),
      checkLlmsTxt(domain),
      checkLlmsFullTxt(domain),
    ]);

    // On-Page crawl (en uzun süren — ~60s)
    const onPage = await runOnPageScan(domain);

    await updateProgress(auditId, {
      progress: 40,
      currentStep: "Backlink verisi toplanıyor...",
    });

    const backlinks = await runBacklinksCheck(domain);

    // ═══ ADIM 2: Perplexity AI mention ═══
    await updateProgress(auditId, {
      status: "analyzing",
      progress: 60,
      currentStep: "AI platformlarda görünürlük ölçülüyor...",
    });

    const testQueries = buildTestQueries(audit.brand);
    const perplexityResults = await checkBrandMention(
      audit.brand.name,
      domain,
      testQueries,
    );

    // Ham veriyi kaydet (JSON serialize edip Prisma InputJsonValue'ye çevir)
    const dataForSeoRaw = JSON.parse(
      JSON.stringify({
        robotsTxt,
        llmsTxt,
        llmsFullTxt,
        onPageSummary: onPage.summary,
        backlinks,
      }),
    );
    const perplexityRaw = JSON.parse(
      JSON.stringify({ mentions: perplexityResults }),
    );

    await prisma.audit.update({
      where: { id: auditId },
      data: {
        dataForSeoRaw,
        perplexityRaw,
        progress: 75,
        currentStep: "43 madde değerlendiriliyor...",
      },
    });

    // ═══ ADIM 3: 43 madde evaluation ═══
    const evalInput: EvalInput = {
      domain,
      brandName: audit.brand.name,
      sector: audit.brand.sector,
      dataForSeo: {
        onPage,
        backlinks,
        robotsTxt,
        llmsTxt,
        llmsFullTxt,
      },
      perplexity: { mentions: perplexityResults },
    };

    let passedCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    for (const masterItem of AUDIT_MASTER_ITEMS) {
      const evalResult = evaluateItem(masterItem, evalInput);

      await prisma.auditItem.updateMany({
        where: { auditId, itemCode: masterItem.code },
        data: {
          status: evalResult.status,
          rawMetrics: JSON.parse(JSON.stringify(evalResult.rawMetrics)),
        },
      });

      if (evalResult.status === "passed") passedCount++;
      else if (evalResult.status === "critical") criticalCount++;
      else warningCount++;
    }

    const totalScore = Math.round(
      (passedCount / AUDIT_MASTER_ITEMS.length) * 100,
    );

    // ═══ ADIM 4: Opus (Aşama 3'te eklenecek) ═══
    // TODO: await generateOpusInstructions(auditId, evalInput, items);

    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: "completed",
        progress: 100,
        currentStep: "Tamamlandı (Opus Aşama 3'te)",
        completedAt: new Date(),
        totalScore,
        passedCount,
        warningCount,
        criticalCount,
      },
    });
  } catch (err) {
    console.error("[audit-pipeline] failed:", err);
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: "failed",
        failedAt: new Date(),
        errorMessage: String(err instanceof Error ? err.message : err),
      },
    });
    throw err;
  }
}
