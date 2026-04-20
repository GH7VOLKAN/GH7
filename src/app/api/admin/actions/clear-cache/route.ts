/**
 * POST /api/admin/actions/clear-cache
 *
 * Upstash Redis'teki tüm cache pattern'lerini temizler.
 * (discovery-*, audit:*, website-analysis:*, rate-limit dahil)
 *
 * Admin-only.
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      return NextResponse.json(
        { error: "Redis not configured" },
        { status: 500 },
      );
    }
    const redis = new Redis({ url, token });

    // FLUSHDB tüm key'leri siler
    await redis.flushdb();

    return NextResponse.json({ success: true, message: "Tüm cache temizlendi" });
  } catch (err) {
    console.error("[admin/clear-cache]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cache clear failed" },
      { status: 500 },
    );
  }
}
