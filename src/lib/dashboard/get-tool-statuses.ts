/**
 * Dashboard ana sayfa araç kartları için canlı durum satırları
 * (Brief H-polish Aşama 1). Her ToolCard için "statusLine" + "statusIcon"
 * döner — hepsi aynı Prisma çağrılarından paralelde toplanır.
 */
import { prisma } from "@/lib/db";

export type ToolStatusIcon = "ok" | "warn" | "empty";

export type ToolStatus = {
  statusLine: string;
  statusIcon: ToolStatusIcon;
};

export type DashboardToolStatuses = {
  insight: ToolStatus;
  audit: ToolStatus;
  tracker: ToolStatus;
  radar: ToolStatus;
  advisor: ToolStatus;
  studio: ToolStatus;
};

function relativeDays(date: Date | null): string {
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Bugün";
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  return `${Math.floor(diffDays / 30)} ay önce`;
}

export async function getDashboardToolStatuses(
  brandId: string,
  brandCount: number,
  planLabel: string,
): Promise<DashboardToolStatuses> {
  const [latestScan, latestAudit, auditItemStats, competitors, latestReport] =
    await Promise.all([
      prisma.scan.findFirst({
        where: { brandId, status: "completed" },
        orderBy: { completedAt: "desc" },
        select: {
          score: true,
          scoreTotal: true,
          completedAt: true,
          results: {
            include: {
              prompt: true,
            },
          },
        },
      }),
      prisma.audit.findFirst({
        where: { brandId, status: "completed" },
        orderBy: { completedAt: "desc" },
        select: { id: true, totalScore: true, completedAt: true },
      }),
      prisma.audit.findFirst({
        where: { brandId },
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          status: true,
          passedCount: true,
          warningCount: true,
          criticalCount: true,
        },
      }),
      prisma.competitor.findMany({
        where: { brandId },
        select: { id: true, name: true, isPrimary: true, normalizedName: true, normalizedDomain: true },
      }),
      prisma.advisorReport.findFirst({
        where: { brandId, reportType: { in: ["first", "monthly"] } },
        orderBy: { generatedAt: "desc" },
        select: { id: true, generatedAt: true },
      }),
    ]);

  // INSIGHT
  const insight: ToolStatus = latestScan
    ? {
        statusLine: `${latestScan.score ?? 0}/${latestScan.scoreTotal ?? 25} skor`,
        statusIcon: "ok",
      }
    : { statusLine: "Analiz bekleniyor", statusIcon: "empty" };

  // AUDIT
  let audit: ToolStatus;
  if (!auditItemStats) {
    audit = { statusLine: "Denetim başlat", statusIcon: "empty" };
  } else {
    const passed = auditItemStats.passedCount ?? 0;
    const warn = auditItemStats.warningCount ?? 0;
    const crit = auditItemStats.criticalCount ?? 0;
    const total = passed + warn + crit;
    if (total === 0) {
      audit = { statusLine: "Denetim başlat", statusIcon: "empty" };
    } else {
      audit = {
        statusLine: `${passed}/${total} geçti`,
        statusIcon: crit > 0 ? "warn" : "ok",
      };
    }
  }

  // TRACKER
  const tracker: ToolStatus = latestScan?.completedAt
    ? {
        statusLine: `Son ölçüm: ${relativeDays(latestScan.completedAt)}`,
        statusIcon: "ok",
      }
    : { statusLine: "Ölçüm bekleniyor", statusIcon: "empty" };

  // RADAR — ahead/behind hesabı
  let radar: ToolStatus;
  if (competitors.length === 0) {
    radar = { statusLine: "Rakip ekle", statusIcon: "empty" };
  } else if (!latestScan) {
    radar = {
      statusLine: `${competitors.length} rakip · ölçüm bekleniyor`,
      statusIcon: "empty",
    };
  } else {
    // Basit ahead sayacı: son scan'de rakip mention'ı olmayan, user mention'ı olan promptlar
    const normalize = (n: string) =>
      n
        .toLowerCase()
        .replace(/[çÇ]/g, "c")
        .replace(/[ğĞ]/g, "g")
        .replace(/[ıİI]/g, "i")
        .replace(/[öÖ]/g, "o")
        .replace(/[şŞ]/g, "s")
        .replace(/[üÜ]/g, "u")
        .replace(/[^a-z0-9]/g, "");

    const primaryCompetitors = competitors.filter((c) => c.isPrimary);
    const displayCompetitors =
      primaryCompetitors.length > 0
        ? primaryCompetitors.slice(0, 3)
        : competitors.slice(0, 3);

    type Row = { user: boolean; comp: boolean };
    const rows = new Map<string, Row>();
    for (const r of latestScan.results) {
      const row = rows.get(r.promptId) ?? { user: false, comp: false };
      if (r.mentioned) row.user = true;
      const arr = (r.competitors ?? []) as Array<{ name?: string }>;
      if (Array.isArray(arr)) {
        for (const d of arr) {
          const norm = d?.name ? normalize(d.name) : "";
          if (!norm) continue;
          if (
            displayCompetitors.some((c) => {
              const cands = [
                c.normalizedName,
                normalize(c.name),
                c.normalizedDomain,
              ].filter(Boolean) as string[];
              return cands.some((x) => x === norm);
            })
          ) {
            row.comp = true;
          }
        }
      }
      rows.set(r.promptId, row);
    }
    let ahead = 0;
    for (const row of rows.values()) if (row.user && !row.comp) ahead += 1;

    radar = {
      statusLine: `${competitors.length} rakip · ${ahead} önde`,
      statusIcon: "ok",
    };
  }

  // ADVISOR
  const advisor: ToolStatus = latestReport
    ? { statusLine: "Rapor hazır", statusIcon: "ok" }
    : { statusLine: "Rapor üret", statusIcon: "empty" };

  // STUDIO
  const studio: ToolStatus = {
    statusLine: `${brandCount} marka · ${planLabel}`,
    statusIcon: "ok",
  };

  return { insight, audit, tracker, radar, advisor, studio };
}
