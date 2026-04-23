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
import {
  generateAuditInstructionsForBatch,
  AUDIT_BATCHES,
  AUDIT_BATCH_COUNT,
} from "./provider";

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

    // ═══ ADIM 4: Dur — batch'leri kullanıcı manuel tetikler ═══
    // Vercel 300s timeout önleme: 43 madde tek çağrıda yerine 3 manuel
    // batch. Pipeline burada durur, status "awaiting-opus". UI batch
    // çalıştırma kartları gösterir → her kart /api/audit/run-batch tetikler.
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: "awaiting-opus",
        progress: 75,
        currentStep:
          "Değerlendirme hazır — marka-özel talimatlar için batch'leri çalıştır.",
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

// ───────────────────────────────────────────────────────
// Single batch Opus action (manuel tetikli UX)
// ───────────────────────────────────────────────────────

export type BatchState = "pending" | "running" | "done" | "failed";

export type BatchProgressSummary = {
  index: number;
  label: string;
  indexFrom: number;
  indexTo: number;
  state: BatchState;
  itemCount: number;
  doneCount: number;
};

/**
 * AuditItem'lardan her batch'in durumunu türet.
 * Not: currentState "Tarama devam ediyor..." default ise Opus o batch'e
 * henüz yazmamış. Non-default = done.
 */
export function summarizeBatchProgress(
  items: Array<{ itemIndex: number; currentState: string }>,
): BatchProgressSummary[] {
  return AUDIT_BATCHES.map((batch, index) => {
    const batchItems = items.filter(
      (i) => i.itemIndex >= batch.indexFrom && i.itemIndex <= batch.indexTo,
    );
    const doneCount = batchItems.filter(
      (i) => i.currentState && i.currentState !== "Tarama devam ediyor...",
    ).length;
    return {
      index,
      label: batch.label,
      indexFrom: batch.indexFrom,
      indexTo: batch.indexTo,
      state: (doneCount === batchItems.length
        ? "done"
        : doneCount > 0
          ? "running"
          : "pending") as BatchState,
      itemCount: batchItems.length,
      doneCount,
    };
  });
}

/**
 * Tek bir Opus batch'i çalıştırır. Audit status'ü "generating" yapar,
 * bitince DB'ye yazar ve gerekli status geçişini yapar.
 */
export async function runAuditOpusBatch(
  auditId: string,
  batchIndex: number,
): Promise<{ ok: boolean; message: string }> {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: { brand: true },
  });
  if (!audit) throw new Error(`Audit ${auditId} bulunamadı`);

  if (audit.status === "generating") {
    return { ok: false, message: "Başka bir batch zaten çalışıyor." };
  }
  if (!["awaiting-opus", "completed"].includes(audit.status)) {
    return {
      ok: false,
      message: `Audit status '${audit.status}' — batch çalıştırılamaz.`,
    };
  }

  const batch = AUDIT_BATCHES[batchIndex];
  if (!batch) {
    return { ok: false, message: `Geçersiz batchIndex ${batchIndex}` };
  }

  await prisma.audit.update({
    where: { id: auditId },
    data: {
      status: "generating",
      currentStep: `Batch ${batchIndex + 1}/${AUDIT_BATCH_COUNT}: ${batch.label}`,
    },
  });

  try {
    const auditItems = await prisma.auditItem.findMany({
      where: { auditId },
      orderBy: { itemIndex: "asc" },
      select: {
        itemCode: true,
        itemIndex: true,
        title: true,
        descriptionStatic: true,
        status: true,
        rawMetrics: true,
      },
    });

    const dataForSeoRaw = audit.dataForSeoRaw as
      | { robotsTxt: unknown; llmsTxt: unknown; llmsFullTxt: unknown; onPageSummary: unknown; backlinks: unknown }
      | null;
    const perplexityRaw = audit.perplexityRaw as
      | { mentions: unknown }
      | null;

    const batchResult = await generateAuditInstructionsForBatch(
      {
        brandName: audit.brand.name,
        domain: audit.brand.domain,
        sector: audit.brand.sector,
        city: audit.brand.city,
        dataForSeoSummary: dataForSeoRaw ?? {},
        perplexityMentions: perplexityRaw?.mentions ?? [],
        masterItems: auditItems.map((item) => ({
          code: item.itemCode,
          title: item.title,
          descriptionStatic: item.descriptionStatic,
          currentStatus: item.status,
          rawMetrics: item.rawMetrics,
          itemIndex: item.itemIndex,
        })),
      },
      batchIndex,
    );

    // Her item'a Opus output'u yaz
    for (const opusItem of batchResult.items) {
      await prisma.auditItem.updateMany({
        where: { auditId, itemCode: opusItem.code },
        data: {
          currentState: opusItem.currentState,
          instructions: JSON.parse(JSON.stringify(opusItem.instructions)),
          impactText: opusItem.impactText,
          expectedGain: opusItem.expectedGain ?? null,
        },
      });
    }

    // Mevcut opusRaw'ı accumulate et (array)
    const prevOpusRaw = Array.isArray(audit.opusRaw) ? audit.opusRaw : [];
    const newOpusRaw = [
      ...(prevOpusRaw as unknown[]),
      ...batchResult.items,
    ];

    // Accumulate cost
    const prevCost = audit.costUsd ? Number(audit.costUsd) : 0;
    const newCost = prevCost + batchResult.costUsd;

    await prisma.audit.update({
      where: { id: auditId },
      data: {
        opusRaw: JSON.parse(JSON.stringify(newOpusRaw)),
        costUsd: newCost,
      },
    });

    // Tüm batch'ler done mu?
    const updatedItems = await prisma.auditItem.findMany({
      where: { auditId },
      select: { itemIndex: true, currentState: true },
    });
    const summary = summarizeBatchProgress(updatedItems);
    const allDone = summary.every((b) => b.state === "done");

    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: allDone ? "completed" : "awaiting-opus",
        progress: allDone
          ? 100
          : 75 + Math.round(25 * (summary.filter((b) => b.state === "done").length / AUDIT_BATCH_COUNT)),
        currentStep: allDone
          ? "Tamamlandı"
          : `${summary.filter((b) => b.state === "done").length}/${AUDIT_BATCH_COUNT} batch tamamlandı — diğerlerini çalıştır.`,
        completedAt: allDone ? new Date() : null,
      },
    });

    return {
      ok: true,
      message: allDone
        ? "Tüm batch'ler tamamlandı."
        : `Batch ${batchIndex + 1}/${AUDIT_BATCH_COUNT} tamamlandı.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[audit-pipeline] batch ${batchIndex} failed:`, err);

    // Audit status'ü geri al — user tekrar deneyebilsin
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: "awaiting-opus",
        errorMessage: `Batch ${batchIndex + 1} hatası: ${msg}`.slice(0, 1000),
      },
    });

    return { ok: false, message: msg };
  }
}
