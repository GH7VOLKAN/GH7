/**
 * GET /api/audit/stream?auditId=X — SSE streaming endpoint.
 *
 * Mimari: audit.status "awaiting-opus" ise 43 maddeyi 5'li gruplar
 * halinde paralel Qwen call, her sonuç geldiğinde DB'ye yaz + SSE event
 * publish. Client EventSource ile dinler, UI canlı güncellenir.
 *
 * Runtime: Node (Prisma ile uyumlu). Vercel streaming response active
 * olduğu sürece maxDuration limit'ini zorlamaz — yine de güvenlik için
 * 300s. 43 item / 5 parallel × ~25s per call ≈ 4 min.
 *
 * Event tipleri:
 *   "start"        → { totalItems, phase1Score }
 *   "item"         → { itemCode, itemIndex, currentState, instructions[], impactText, expectedGain }
 *   "item-failed"  → { itemCode, itemIndex, error }
 *   "complete"     → { totalCost, passedCount, warningCount, criticalCount }
 *   "error"        → { message }
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { generateInstructionsForItem } from "@/lib/audit/provider";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const GROUP_SIZE = 5;

type SseWriter = {
  send: (event: string, data: unknown) => void;
  close: () => void;
};

function createSseWriter(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
): SseWriter {
  return {
    send: (event, data) => {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      writer.write(encoder.encode(payload)).catch(() => {});
    },
    close: () => {
      writer.close().catch(() => {});
    },
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const auditId = url.searchParams.get("auditId");
  if (!auditId) {
    return new Response("auditId required", { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Audit + ownership check
  const audit = await prisma.audit.findFirst({
    where: { id: auditId, profileId: user.id },
    include: { brand: true, items: { orderBy: { itemIndex: "asc" } } },
  });
  if (!audit) {
    return new Response("Audit not found", { status: 404 });
  }

  // Sadece awaiting-opus ve partial completed stream edilebilir
  if (!["awaiting-opus", "completed", "generating"].includes(audit.status)) {
    return new Response(
      `Audit status "${audit.status}" — stream için awaiting-opus olmalı`,
      { status: 400 },
    );
  }

  // Opus henüz üretmediği item'ları bul (currentState default'ta olan)
  const pendingItems = audit.items.filter(
    (i) => i.currentState === "Tarama devam ediyor...",
  );

  // Zaten tüm item'lar hazırsa direkt complete
  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  const sse = createSseWriter(writer, encoder);

  // Async pipeline (response hemen döner, writer arkaplanda yazar)
  (async () => {
    try {
      await prisma.audit.update({
        where: { id: auditId },
        data: { status: "generating", currentStep: "Stream başladı" },
      });

      sse.send("start", {
        totalItems: audit.items.length,
        pendingItems: pendingItems.length,
        phase1Score: audit.totalScore ?? 0,
      });

      const req = {
        brandName: audit.brand.name,
        domain: audit.brand.domain,
        sector: audit.brand.sector,
        city: audit.brand.city,
        dataForSeoSummary: audit.dataForSeoRaw ?? {},
        perplexityMentions:
          (audit.perplexityRaw as { mentions?: unknown } | null)?.mentions ??
          [],
        masterItems: audit.items.map((item) => ({
          code: item.itemCode,
          title: item.title,
          descriptionStatic: item.descriptionStatic,
          currentStatus: item.status,
          rawMetrics: item.rawMetrics,
          itemIndex: item.itemIndex,
        })),
      };

      let totalCost = 0;
      let failedCount = 0;
      let skippedPassedCount = 0;

      // Passed maddeler için statik template (Qwen çağrısı atla, token tasarrufu)
      const PASSED_TEMPLATE = {
        currentState: "Bu madde siteniz için optimum durumda.",
        instructions: [] as Array<{ step: number; text: string; code?: string }>,
        impactText: "Geçildi, işlem gerekmez.",
        expectedGain: "+0",
      };

      // 5'li gruplar halinde paralel işle
      for (let i = 0; i < pendingItems.length; i += GROUP_SIZE) {
        const group = pendingItems.slice(i, i + GROUP_SIZE);

        await Promise.all(
          group.map(async (item) => {
            // ═══ Passed şortcut: Qwen çağrısı atla ═══
            if (item.status === "passed") {
              await prisma.auditItem.update({
                where: { id: item.id },
                data: {
                  currentState: PASSED_TEMPLATE.currentState,
                  instructions: PASSED_TEMPLATE.instructions,
                  impactText: PASSED_TEMPLATE.impactText,
                  expectedGain: PASSED_TEMPLATE.expectedGain,
                },
              });
              skippedPassedCount++;
              sse.send("item", {
                itemCode: item.itemCode,
                itemIndex: item.itemIndex,
                currentState: PASSED_TEMPLATE.currentState,
                instructions: PASSED_TEMPLATE.instructions,
                impactText: PASSED_TEMPLATE.impactText,
                expectedGain: PASSED_TEMPLATE.expectedGain,
                skipped: true,
              });
              return;
            }

            // ═══ Warning/critical için Qwen çağrısı ═══
            const masterItem = req.masterItems.find(
              (m) => m.code === item.itemCode,
            );
            if (!masterItem) return;

            try {
              const result = await generateInstructionsForItem(
                req,
                masterItem,
              );
              totalCost += result.costUsd;

              await prisma.auditItem.update({
                where: { id: item.id },
                data: {
                  currentState: result.item.currentState,
                  instructions: JSON.parse(
                    JSON.stringify(result.item.instructions),
                  ),
                  impactText: result.item.impactText,
                  expectedGain: result.item.expectedGain ?? null,
                },
              });

              sse.send("item", {
                itemCode: item.itemCode,
                itemIndex: item.itemIndex,
                currentState: result.item.currentState,
                instructions: result.item.instructions,
                impactText: result.item.impactText,
                expectedGain: result.item.expectedGain,
                skipped: false,
              });
            } catch (err) {
              failedCount++;
              const msg = err instanceof Error ? err.message : String(err);
              console.error(`[stream] ${item.itemCode} failed:`, msg);
              sse.send("item-failed", {
                itemCode: item.itemCode,
                itemIndex: item.itemIndex,
                error: msg.slice(0, 200),
              });
            }
          }),
        );
      }

      // Final audit update
      const updatedItems = await prisma.auditItem.findMany({
        where: { auditId },
        select: { currentState: true },
      });
      const allDone = updatedItems.every(
        (i) => i.currentState !== "Tarama devam ediyor...",
      );

      const prevCost = audit.costUsd ? Number(audit.costUsd) : 0;
      await prisma.audit.update({
        where: { id: auditId },
        data: {
          status: allDone ? "completed" : "awaiting-opus",
          progress: 100,
          currentStep: allDone
            ? "Tamamlandı"
            : `${pendingItems.length - failedCount}/${pendingItems.length} madde hazır — eksiklere tekrar dene`,
          completedAt: allDone ? new Date() : null,
          costUsd: prevCost + totalCost,
          errorMessage:
            failedCount > 0
              ? `${failedCount} madde Qwen'den alınamadı`
              : null,
        },
      });

      sse.send("complete", {
        totalCost,
        failedCount,
        skippedPassedCount,
        totalItems: audit.items.length,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[stream] fatal:", err);
      sse.send("error", { message: msg });
      try {
        await prisma.audit.update({
          where: { id: auditId },
          data: {
            status: "failed",
            failedAt: new Date(),
            errorMessage: msg.slice(0, 1000),
          },
        });
      } catch {
        // ignore
      }
    } finally {
      sse.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "connection": "keep-alive",
      "x-accel-buffering": "no", // nginx/proxy buffering kapat
    },
  });
}
