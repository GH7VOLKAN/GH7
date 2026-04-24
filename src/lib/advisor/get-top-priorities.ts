/**
 * Advisor "30 Günlük Yol Haritası" bölümünden ilk N aksiyonu çıkarır
 * (Brief H-polish Aşama 1). Dashboard ana sayfada "Bu Hafta Öncelikler"
 * bölümünde kullanılır.
 *
 * Parser tolere edicidir:
 * - "## 30 Günlük Yol Haritası" başlığını bulur, altındaki tüm bullet'ları toplar
 * - Haftalık alt başlıkları (**1. Hafta — …**) atlar, altındaki - / * satırları toplar
 * - Başlık bulunmazsa tüm içerikteki ilk N bullet'ı döndürür (fallback)
 */
import { prisma } from "@/lib/db";

export type AdvisorPriority = {
  text: string;
  weekLabel?: string;
};

const ROADMAP_HEADING_PATTERNS = [
  /^##\s*30\s*g(?:ü|u)nl(?:ü|u)k\s*yol\s*haritas(?:ı|i)/i,
  /^##\s*yol\s*haritas(?:ı|i)/i,
];

function isRoadmapHeading(line: string): boolean {
  return ROADMAP_HEADING_PATTERNS.some((re) => re.test(line.trim()));
}

function isAnyH2(line: string): boolean {
  return /^##\s+/.test(line.trim());
}

function extractBullet(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
    return trimmed.slice(2).trim();
  }
  return null;
}

function extractWeekHeading(line: string): string | null {
  const trimmed = line.trim();
  // "**1. Hafta — Tema**" veya "**Hafta 1 — …**"
  const match = trimmed.match(/^\*\*([^*]+)\*\*\s*:?$/);
  if (!match) return null;
  if (/hafta/i.test(match[1])) return match[1].trim();
  return null;
}

export function parseAdvisorPriorities(
  content: string,
  limit = 3,
): AdvisorPriority[] {
  const lines = content.split("\n");
  const priorities: AdvisorPriority[] = [];

  let inRoadmap = false;
  let currentWeek: string | undefined;

  for (const line of lines) {
    if (!inRoadmap) {
      if (isRoadmapHeading(line)) inRoadmap = true;
      continue;
    }
    // Başka bir ## başlığı gördüğümüzde roadmap biter
    if (isAnyH2(line) && !isRoadmapHeading(line)) break;

    const week = extractWeekHeading(line);
    if (week) {
      currentWeek = week;
      continue;
    }

    const bullet = extractBullet(line);
    if (bullet) {
      priorities.push({ text: bullet, weekLabel: currentWeek });
      if (priorities.length >= limit) break;
    }
  }

  // Fallback: roadmap başlığı bulunamadı → herhangi bir bullet topla
  if (priorities.length === 0) {
    for (const line of lines) {
      const bullet = extractBullet(line);
      if (bullet) {
        priorities.push({ text: bullet });
        if (priorities.length >= limit) break;
      }
    }
  }

  return priorities;
}

export async function getTopPriorities(
  brandId: string,
  limit = 3,
): Promise<AdvisorPriority[]> {
  const latest = await prisma.advisorReport.findFirst({
    where: { brandId, reportType: { in: ["first", "monthly"] } },
    orderBy: { generatedAt: "desc" },
    select: { content: true },
  });
  if (!latest) return [];
  return parseAdvisorPriorities(latest.content, limit);
}
