/**
 * Competitor Dedup Migration Script
 *
 * Mevcut duplicate rakipleri temizler ve tüm kayıtlara normalizedName + normalizedDomain ekler.
 *
 * Kullanım:
 *   npx tsx prisma/migrations/dedupe-competitors.ts          # DRY RUN (rapor verir, değiştirmez)
 *   npx tsx prisma/migrations/dedupe-competitors.ts --apply  # Gerçekten merge + sil
 */

import { PrismaClient } from "@prisma/client";
import type { Competitor } from "@prisma/client";
import {
  normalizeForMatching,
  extractRootDomain,
  brandMatchFuzzy,
} from "../../src/lib/utils/turkish";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

function mergePlatforms(
  a: Record<string, number>,
  b: Record<string, number>
): Record<string, number> {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, number> = {};
  for (const k of keys) out[k] = Math.max(a[k] ?? 0, b[k] ?? 0);
  return out;
}

async function main() {
  const mode = APPLY ? "APPLY MODE" : "DRY RUN";
  console.log(`🧹 Competitor dedup — ${mode}\n`);

  const brands = await prisma.brand.findMany({ select: { id: true, name: true } });
  console.log(`Scanning ${brands.length} brands...\n`);

  let totalDuplicateGroups = 0;
  let totalDuplicateRows = 0;
  let totalNormalizedUpdates = 0;

  for (const brand of brands) {
    const competitors = await prisma.competitor.findMany({
      where: { brandId: brand.id },
      orderBy: { createdAt: "asc" }, // en eski = canonical
    });

    if (competitors.length === 0) continue;

    // Fuzzy grupla
    const groups: Competitor[][] = [];
    for (const c of competitors) {
      let matched = false;
      for (const group of groups) {
        const rep = group[0];
        const repDomain = rep.domain ? extractRootDomain(rep.domain) : "";
        const cDomain = c.domain ? extractRootDomain(c.domain) : "";

        // Domain match (güçlü sinyal)
        if (repDomain && cDomain && repDomain === cDomain) {
          group.push(c);
          matched = true;
          break;
        }
        // Fuzzy name match
        if (brandMatchFuzzy(rep.name, c.name)) {
          group.push(c);
          matched = true;
          break;
        }
      }
      if (!matched) groups.push([c]);
    }

    const duplicateGroups = groups.filter((g) => g.length > 1);

    if (duplicateGroups.length > 0) {
      console.log(
        `\n[${brand.name}] ${duplicateGroups.length} duplicate grup bulundu:`
      );
    }

    for (const group of duplicateGroups) {
      const [canonical, ...dupes] = group;
      totalDuplicateGroups++;
      totalDuplicateRows += dupes.length;

      console.log(
        `  → canonical: "${canonical.name}" (${canonical.id.slice(0, 8)}, score: ${canonical.mentionScore})`
      );
      for (const d of dupes) {
        console.log(
          `    merge: "${d.name}" (${d.id.slice(0, 8)}, score: ${d.mentionScore})`
        );
      }

      if (APPLY) {
        // Canonical'ı en iyi verilerle güncelle
        const maxMention = Math.max(...group.map((g) => g.mentionScore));
        const maxReadiness = Math.max(...group.map((g) => g.readinessScore));
        const mergedPlatforms = group.reduce(
          (acc, g) => {
            const p = (g.platforms as Record<string, number> | null) ?? {};
            return mergePlatforms(acc, p);
          },
          {} as Record<string, number>
        );
        const mergedProducts = Array.from(
          new Set(group.flatMap((g) => g.products ?? []))
        );
        // En bilgi dolu reason'ı al
        const bestReason =
          group
            .map((g) => g.reason)
            .filter((r): r is string => typeof r === "string" && r.length > 0)
            .sort((a, b) => b.length - a.length)[0] ?? null;
        // Source priority: manual > ai_discovered > scan_discovered > free_audit > discovery
        const sourcePriority: Record<string, number> = {
          manual: 5,
          ai_discovered: 4,
          scan_discovered: 3,
          free_audit: 2,
          discovery: 1,
        };
        const bestSource = group
          .map((g) => g.source)
          .sort(
            (a, b) => (sourcePriority[b] ?? 0) - (sourcePriority[a] ?? 0)
          )[0];
        // En uzun (en açıklayıcı) name ve domain
        const bestName = group
          .map((g) => g.name)
          .sort((a, b) => b.length - a.length)[0];
        const bestDomain =
          group
            .map((g) => g.domain)
            .filter((d) => d && d.length > 0)
            .sort((a, b) => b.length - a.length)[0] ?? "";

        await prisma.competitor.update({
          where: { id: canonical.id },
          data: {
            name: bestName,
            normalizedName: normalizeForMatching(bestName),
            domain: bestDomain,
            normalizedDomain: bestDomain ? extractRootDomain(bestDomain) : null,
            mentionScore: maxMention,
            readinessScore: maxReadiness,
            platforms: mergedPlatforms,
            reason: bestReason,
            products: mergedProducts,
            source: bestSource,
          },
        });

        // Duplicate'leri sil
        await prisma.competitor.deleteMany({
          where: { id: { in: dupes.map((d) => d.id) } },
        });
      }
    }

    // Duplicate olmayan kayıtları da normalize field'larla güncelle
    if (APPLY) {
      for (const group of groups) {
        const c = group[0];
        if (!c.normalizedName) {
          await prisma.competitor.update({
            where: { id: c.id },
            data: {
              normalizedName: normalizeForMatching(c.name),
              normalizedDomain: c.domain ? extractRootDomain(c.domain) : null,
            },
          });
          totalNormalizedUpdates++;
        }
      }
    }
  }

  console.log(`\n════════════════════════════════════════`);
  console.log(`SUMMARY`);
  console.log(`════════════════════════════════════════`);
  console.log(`Duplicate groups:       ${totalDuplicateGroups}`);
  console.log(`Total duplicate rows:   ${totalDuplicateRows}`);
  if (APPLY) {
    console.log(`Rows deleted:           ${totalDuplicateRows}`);
    console.log(`Normalized updates:     ${totalNormalizedUpdates}`);
    console.log(`\n✅ Migration completed.`);
  } else {
    console.log(`\n⚠️  DRY RUN — Nothing changed.`);
    console.log(`Re-run with --apply to merge duplicates.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
