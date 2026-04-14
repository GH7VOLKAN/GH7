import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Impact Tracker — Measures the effect of completed actions/checklist items.
 *
 * After each scan, checks for completed actions that have a "before" snapshot
 * but no "after" result yet. Compares current scan metrics with the snapshot
 * to show the user what changed after they took action.
 *
 * Called from scan-engine.ts post-processing, after generateSmartAlerts.
 */

interface ImpactSnapshot {
  mentionScore: number;
  scanIdBefore: string | null;
  completedAt: string;
}

interface ImpactResult {
  mentionScoreAfter: number;
  delta: number;
  scanIdAfter: string;
  measuredAt: string;
}

export async function measureCompletionImpact(
  scanId: string,
  brandId: string
): Promise<void> {
  try {
    // Get current mention score
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentScore = await prisma.scoreHistory.findFirst({
      where: { brandId },
      orderBy: { date: "desc" },
    });

    if (!currentScore) return;

    const mentionScoreAfter = currentScore.mentionScore;

    // ── Measure ActionTask impact ────────────────────
    const pendingActions = await prisma.actionTask.findMany({
      where: {
        brandId,
        completed: true,
        impactSnapshot: { not: Prisma.JsonNull },
        impactResult: { equals: Prisma.JsonNull },
      },
    });

    for (const action of pendingActions) {
      const snapshot = action.impactSnapshot as unknown as ImpactSnapshot;
      if (!snapshot?.completedAt) continue;

      // Only measure if at least 1 day has passed since completion
      const completedDate = new Date(snapshot.completedAt);
      const daysSinceCompletion = Math.floor(
        (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceCompletion < 1) continue;

      const result: ImpactResult = {
        mentionScoreAfter,
        delta: mentionScoreAfter - (snapshot.mentionScore ?? 0),
        scanIdAfter: scanId,
        measuredAt: new Date().toISOString(),
      };

      await prisma.actionTask.update({
        where: { id: action.id },
        data: { impactResult: result as unknown as Prisma.InputJsonValue },
      });
    }

    // ── Measure ChecklistItem impact ─────────────────
    const pendingChecklist = await prisma.checklistItem.findMany({
      where: {
        brandId,
        userMarkedDone: true,
        impactSnapshot: { not: Prisma.JsonNull },
        impactResult: { equals: Prisma.JsonNull },
      },
    });

    for (const item of pendingChecklist) {
      const snapshot = item.impactSnapshot as unknown as ImpactSnapshot;
      if (!snapshot?.completedAt) continue;

      const completedDate = new Date(snapshot.completedAt);
      const daysSinceCompletion = Math.floor(
        (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceCompletion < 1) continue;

      const result: ImpactResult = {
        mentionScoreAfter,
        delta: mentionScoreAfter - (snapshot.mentionScore ?? 0),
        scanIdAfter: scanId,
        measuredAt: new Date().toISOString(),
      };

      await prisma.checklistItem.update({
        where: { id: item.id },
        data: { impactResult: result as unknown as Prisma.InputJsonValue },
      });
    }
  } catch (error) {
    // Impact tracking should never break the scan flow
    console.error("[impact-tracker] Error measuring impact:", error);
  }
}
