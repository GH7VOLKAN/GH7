/**
 * Redis Cache Temizleme Scripti
 *
 * Kullanım:
 *   npx tsx scripts/clear-cache.ts idavilla.com.tr
 *   npx tsx scripts/clear-cache.ts idavilla.com.tr isitmax.com
 *   npx tsx scripts/clear-cache.ts --all-website     (tüm website-analysis)
 *   npx tsx scripts/clear-cache.ts --all-queries     (tüm queries-fast)
 */

import { cacheDel, makeCacheKey, getRedis } from "../src/lib/redis";

async function clearDomainCache(domain: string) {
  const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();

  const websiteKey = makeCacheKey("website-analysis", cleanDomain);
  await cacheDel(websiteKey);
  console.log(`  ✓ Silindi: ${websiteKey}  (${cleanDomain})`);
}

async function clearPattern(pattern: string) {
  const redis = getRedis();
  if (!redis) {
    console.error("Redis bağlantısı yok.");
    return;
  }

  let cursor: number | string = 0;
  let totalDeleted = 0;

  do {
    // Upstash scan API — returns { cursor, keys }
    const result = (await redis.scan(cursor, { match: pattern, count: 100 })) as [
      string | number,
      string[]
    ];
    cursor = result[0];
    const keys = result[1];

    if (keys.length > 0) {
      for (const key of keys) {
        await redis.del(key);
        console.log(`  ✓ Silindi: ${key}`);
        totalDeleted++;
      }
    }
  } while (String(cursor) !== "0");

  console.log(`\nToplam ${totalDeleted} key silindi.`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Kullanım:");
    console.log("  npx tsx scripts/clear-cache.ts <domain> [domain2 ...]");
    console.log("  npx tsx scripts/clear-cache.ts --all-website");
    console.log("  npx tsx scripts/clear-cache.ts --all-queries");
    process.exit(1);
  }

  if (args[0] === "--all-website") {
    console.log("Tüm website-analysis cache'i temizleniyor...");
    await clearPattern("website-analysis:*");
    return;
  }

  if (args[0] === "--all-queries") {
    console.log("Tüm queries-fast cache'i temizleniyor...");
    await clearPattern("queries-fast:*");
    return;
  }

  console.log(`${args.length} domain için cache temizleniyor...\n`);
  for (const domain of args) {
    await clearDomainCache(domain);
  }
  console.log("\n✅ Tamamlandı.");
}

main().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
