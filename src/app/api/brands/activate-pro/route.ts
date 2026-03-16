/**
 * POST /api/brands/activate-pro
 *
 * Pro plana gecis sonrasi tam pipeline'i baslat.
 * Payment callback'ten fire-and-forget olarak cagirilir.
 *
 * Internal endpoint — CRON_SECRET ile korunur.
 */

import { NextResponse, after } from "next/server";
import { triggerProActivation } from "@/lib/ai/pro-activation";

export const maxDuration = 300; // 5 min max for Vercel Pro

export async function POST(request: Request) {
  // Internal endpoint — sadece sunucu tarafindan cagirilir
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { brandId } = (await request.json()) as { brandId: string };

  if (!brandId) {
    return NextResponse.json({ error: "brandId required" }, { status: 400 });
  }

  // Run the full pipeline in the background using after()
  after(async () => {
    try {
      await triggerProActivation(brandId);
    } catch (err) {
      console.error("[activate-pro] Pipeline failed:", err);
    }
  });

  return NextResponse.json({ status: "activation_started", brandId });
}
