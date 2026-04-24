/**
 * Backfill mevcut AuditItem kayıtlarının boyut/subBoyut/servesLayer alanlarını
 * master-items.ts'teki legacyCode eşleştirmesi ile doldurur (Brief N v4 Aşama 2).
 *
 * Kullanım:
 *   npx tsx scripts/backfill-audit-boyut.ts
 *
 * Idempotent — boyut NULL olan kayıtları günceller, dolu olanları atlar.
 */
import { PrismaClient, AuditBoyut, ServesLayer } from "@prisma/client";
import { AUDIT_MASTER_ITEMS } from "../src/lib/audit/master-items";

const prisma = new PrismaClient();

type MatchResult = {
  boyut: AuditBoyut;
  subBoyut: string;
  servesLayer: ServesLayer;
};

function findMatch(itemCode: string): MatchResult | null {
  const master = AUDIT_MASTER_ITEMS.find(
    (m) => m.code === itemCode || m.legacyCode === itemCode,
  );
  if (!master) return null;
  return {
    boyut: master.boyut as AuditBoyut,
    subBoyut: master.subBoyut,
    servesLayer: master.servesLayer as ServesLayer,
  };
}

async function main() {
  const items = await prisma.auditItem.findMany({
    where: { boyut: null },
    select: { id: true, itemCode: true },
  });

  console.log(`Backfill edilecek AuditItem: ${items.length}`);

  let matched = 0;
  let skipped = 0;
  const unknownCodes = new Set<string>();

  for (const item of items) {
    const match = findMatch(item.itemCode);
    if (!match) {
      unknownCodes.add(item.itemCode);
      skipped++;
      continue;
    }
    await prisma.auditItem.update({
      where: { id: item.id },
      data: {
        boyut: match.boyut,
        subBoyut: match.subBoyut,
        servesLayer: match.servesLayer,
      },
    });
    matched++;
  }

  console.log(`✓ Güncellendi: ${matched}`);
  console.log(`⚠ Atlandı (master'da eşleşme yok): ${skipped}`);
  if (unknownCodes.size > 0) {
    console.log(`  Eşleşmeyen kodlar: ${[...unknownCodes].join(", ")}`);
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
