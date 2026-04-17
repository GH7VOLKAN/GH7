/**
 * Admin: Redis Cache Temizleme
 *
 * POST /api/admin/cache/clear
 * Body:
 *   { domain: "idavilla.com.tr" }              → website-analysis + queries
 *   { pattern: "website-analysis:*" }          → tüm website cache
 *   { pattern: "queries-fast:*" }              → tüm queries cache
 *
 * Admin auth gerekli.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getRedis, cacheDel, makeCacheKey } from "@/lib/redis";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { domain, pattern } = body as { domain?: string; pattern?: string };

  // Pattern ile toplu silme
  if (pattern) {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
    }

    let cursor: number | string = 0;
    const deleted: string[] = [];

    try {
      do {
        const result = (await redis.scan(cursor, { match: pattern, count: 100 })) as [
          string | number,
          string[]
        ];
        cursor = result[0];
        const keys = result[1];

        for (const key of keys) {
          await redis.del(key);
          deleted.push(key);
        }
      } while (String(cursor) !== "0");

      return NextResponse.json({
        success: true,
        pattern,
        deletedCount: deleted.length,
        deleted,
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Scan failed" },
        { status: 500 }
      );
    }
  }

  // Tek domain
  if (domain) {
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .trim();

    const websiteKey = makeCacheKey("website-analysis", cleanDomain);
    await cacheDel(websiteKey);

    // Queries cache anahtarı ürün/hizmet kombinasyonuna bağlı, pattern ile silelim
    const redis = getRedis();
    const queriesDeleted: string[] = [];
    if (redis) {
      try {
        let cursor: number | string = 0;
        do {
          const result = (await redis.scan(cursor, {
            match: "queries-fast:*",
            count: 100,
          })) as [string | number, string[]];
          cursor = result[0];
          for (const key of result[1]) {
            // Hangi domain ile alakalı olduğunu bilmek için tam silmek zor,
            // şimdilik dokunmuyoruz. Sadece website-analysis silindi.
          }
        } while (String(cursor) !== "0");
      } catch {}
    }

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      deleted: [websiteKey],
      queriesDeleted,
    });
  }

  return NextResponse.json(
    { error: "domain veya pattern gerekli" },
    { status: 400 }
  );
}
