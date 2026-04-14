import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/notifications/send";
import { extractCompetitorNames } from "@/lib/ai/types";

/**
 * Smart Alerts — Proactive notifications after each scan.
 *
 * Detects 4 types of significant changes:
 * 1. mention_lost     — brand was mentioned last scan, now it's not
 * 2. competitor_surge  — a competitor appeared in 3+ new queries
 * 3. score_drop_major  — mentionScore dropped 10+ points
 * 4. new_competitor    — previously unseen competitor discovered
 *
 * Called from scan-engine.ts post-processing, after verifyScanChecklistItems.
 */

const DEDUP_DAYS = 7; // Don't re-alert for same prompt+platform within 7 days

export async function generateSmartAlerts(
  scanId: string,
  brandId: string
): Promise<void> {
  try {
    // Get previous completed scan
    const previousScan = await prisma.scan.findFirst({
      where: { brandId, status: "completed", id: { not: scanId } },
      orderBy: { completedAt: "desc" },
    });

    if (!previousScan) return; // First scan — nothing to compare

    // Get results for both scans
    const [currentResults, previousResults] = await Promise.all([
      prisma.promptResult.findMany({
        where: { scanId },
        include: { prompt: { select: { text: true } } },
      }),
      prisma.promptResult.findMany({
        where: { scanId: previousScan.id },
        include: { prompt: { select: { text: true } } },
      }),
    ]);

    // Build lookup maps
    const prevMap = new Map<string, (typeof previousResults)[0]>();
    for (const r of previousResults) {
      prevMap.set(`${r.promptId}::${r.platform}`, r);
    }

    const currMap = new Map<string, (typeof currentResults)[0]>();
    for (const r of currentResults) {
      currMap.set(`${r.promptId}::${r.platform}`, r);
    }

    // ── 1. MENTION LOST ────────────────────────────────────
    await detectMentionLost(brandId, currMap, prevMap);

    // ── 2. COMPETITOR SURGE ────────────────────────────────
    await detectCompetitorSurge(brandId, currentResults, previousResults);

    // ── 3. SCORE DROP MAJOR ────────────────────────────────
    await detectScoreDrop(brandId);

    // ── 4. NEW COMPETITOR ──────────────────────────────────
    await detectNewCompetitor(brandId);
  } catch (error) {
    // Smart alerts should never break the scan flow
    console.error("[smart-alerts] Error generating alerts:", error);
  }
}

// ── 1. Mention Lost ─────────────────────────────────────────
async function detectMentionLost(
  brandId: string,
  currMap: Map<string, { promptId: string; platform: string; mentioned: boolean; prompt: { text: string } }>,
  prevMap: Map<string, { promptId: string; platform: string; mentioned: boolean; prompt: { text: string } }>
): Promise<void> {
  const lostMentions: { prompt: string; platform: string }[] = [];

  // Check recent alerts for dedup
  const recentAlerts = await prisma.notification.findMany({
    where: {
      brandId,
      type: "mention_lost",
      createdAt: { gte: new Date(Date.now() - DEDUP_DAYS * 24 * 60 * 60 * 1000) },
    },
    select: { data: true },
  });

  const recentAlertKeys = new Set<string>();
  for (const alert of recentAlerts) {
    const data = alert.data as { keys?: string[] } | null;
    if (data?.keys) {
      for (const key of data.keys) recentAlertKeys.add(key);
    }
  }

  for (const [key, prevResult] of prevMap) {
    const currResult = currMap.get(key);
    if (
      prevResult.mentioned === true &&
      currResult &&
      currResult.mentioned === false &&
      !recentAlertKeys.has(key)
    ) {
      lostMentions.push({
        prompt: prevResult.prompt.text,
        platform: prevResult.platform,
      });
    }
  }

  if (lostMentions.length === 0) return;

  const platformNames: Record<string, string> = {
    chatgpt: "ChatGPT",
    claude: "Claude",
    gemini: "Gemini",
    perplexity: "Perplexity",
    google_aio: "Google AIO",
  };

  const details = lostMentions
    .slice(0, 5)
    .map((m) => `${platformNames[m.platform] ?? m.platform}: "${m.prompt}"`)
    .join("\n");

  const keys = lostMentions.map((m) => `${m.prompt}::${m.platform}`);

  await sendNotification({
    brandId,
    type: "mention_lost",
    title: `${lostMentions.length} sorguda bahsedilme kaybettiniz`,
    message: `Son taramada ${lostMentions.length} sorgu+platform kombinasyonunda artık bahsedilmiyorsunuz.\n\n${details}`,
    data: {
      count: lostMentions.length,
      details: lostMentions.slice(0, 10),
      keys,
    },
  });
}

// ── 2. Competitor Surge ─────────────────────────────────────
async function detectCompetitorSurge(
  brandId: string,
  currentResults: { competitors: unknown; promptId: string }[],
  previousResults: { competitors: unknown; promptId: string }[]
): Promise<void> {
  // Count unique prompts per competitor for both scans
  const countPrompts = (results: { competitors: unknown; promptId: string }[]) => {
    const counts = new Map<string, Set<string>>();
    for (const r of results) {
      const names = extractCompetitorNames(r.competitors);
      for (const name of names) {
        const normalized = name.trim().toLowerCase();
        if (!normalized) continue;
        if (!counts.has(normalized)) counts.set(normalized, new Set());
        counts.get(normalized)!.add(r.promptId);
      }
    }
    return counts;
  };

  const currentCounts = countPrompts(currentResults);
  const previousCounts = countPrompts(previousResults);

  const surges: { name: string; newQueries: number; totalQueries: number }[] = [];

  for (const [name, currentPrompts] of currentCounts) {
    const prevCount = previousCounts.get(name)?.size ?? 0;
    const currentCount = currentPrompts.size;
    const newQueries = currentCount - prevCount;

    if (newQueries >= 3) {
      // Find the display name (original case)
      const displayName =
        currentResults
          .flatMap((r) => extractCompetitorNames(r.competitors))
          .find((n) => n.trim().toLowerCase() === name) ?? name;

      surges.push({ name: displayName, newQueries, totalQueries: currentCount });
    }
  }

  if (surges.length === 0) return;

  for (const surge of surges.slice(0, 3)) {
    await sendNotification({
      brandId,
      type: "competitor_surge",
      title: `${surge.name} hızla yükseliyor`,
      message: `${surge.name} bu taramada ${surge.newQueries} yeni sorguda daha bahsedilmeye başladı. Toplam ${surge.totalQueries} sorguda görünüyor.`,
      data: {
        competitorName: surge.name,
        newQueries: surge.newQueries,
        totalQueries: surge.totalQueries,
      },
    });
  }
}

// ── 3. Score Drop Major ─────────────────────────────────────
async function detectScoreDrop(brandId: string): Promise<void> {
  const scores = await prisma.scoreHistory.findMany({
    where: { brandId },
    orderBy: { date: "desc" },
    take: 2,
  });

  if (scores.length < 2) return;

  const current = scores[0].mentionScore;
  const previous = scores[1].mentionScore;
  const drop = previous - current;

  if (drop >= 10) {
    await sendNotification({
      brandId,
      type: "score_drop_major",
      title: `GEO skorunuz ${drop} puan düştü`,
      message: `GEO skorunuz ${previous}'den ${current}'e düştü. Bu önemli bir düşüş — aksiyonlarınızı kontrol etmenizi öneririz.`,
      data: {
        previousScore: previous,
        currentScore: current,
        drop,
      },
    });
  }
}

// ── 4. New Competitor ───────────────────────────────────────
async function detectNewCompetitor(brandId: string): Promise<void> {
  // Find competitors discovered in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const newCompetitors = await prisma.competitor.findMany({
    where: {
      brandId,
      source: "ai_discovered",
      discoveredAt: { gte: oneDayAgo },
    },
    select: { name: true, domain: true },
  });

  if (newCompetitors.length === 0) return;

  const names = newCompetitors.map((c) => c.name).join(", ");

  await sendNotification({
    brandId,
    type: "new_competitor",
    title: `${newCompetitors.length} yeni rakip keşfedildi`,
    message: `AI platformlarında yeni rakipler tespit edildi: ${names}. Rakip İstihbarat sayfasından detayları inceleyin.`,
    data: {
      competitors: newCompetitors.map((c) => ({ name: c.name, domain: c.domain })),
    },
  });
}
