import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const COST_PER_CALL: Record<string, number> = {
  chatgpt: 0.005,
  claude: 0.007,
  gemini: 0.003,
  perplexity: 0.005,
  google_aio: 0.005,
};

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayCounts, weekCounts, monthCounts, activeUsers] = await Promise.all([
    prisma.promptResult.groupBy({
      by: ["platform"],
      _count: { platform: true },
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.promptResult.groupBy({
      by: ["platform"],
      _count: { platform: true },
      where: { createdAt: { gte: weekStart } },
    }),
    prisma.promptResult.groupBy({
      by: ["platform"],
      _count: { platform: true },
      where: { createdAt: { gte: monthStart } },
    }),
    prisma.profile.count({
      where: { plan: { not: "free" } },
    }),
  ]);

  // Build platform breakdown
  const allPlatforms = Object.keys(COST_PER_CALL);
  const platforms: Record<string, { calls: { today: number; week: number; month: number }; cost: { today: number; week: number; month: number } }> = {};

  for (const p of allPlatforms) {
    const todayRow = todayCounts.find((r) => r.platform === p);
    const weekRow = weekCounts.find((r) => r.platform === p);
    const monthRow = monthCounts.find((r) => r.platform === p);

    const tCalls = todayRow?._count.platform ?? 0;
    const wCalls = weekRow?._count.platform ?? 0;
    const mCalls = monthRow?._count.platform ?? 0;
    const rate = COST_PER_CALL[p];

    platforms[p] = {
      calls: { today: tCalls, week: wCalls, month: mCalls },
      cost: {
        today: +(tCalls * rate).toFixed(4),
        week: +(wCalls * rate).toFixed(4),
        month: +(mCalls * rate).toFixed(4),
      },
    };
  }

  // Totals
  const totals = {
    today: { calls: 0, cost: 0 },
    week: { calls: 0, cost: 0 },
    month: { calls: 0, cost: 0 },
  };

  for (const p of Object.values(platforms)) {
    totals.today.calls += p.calls.today;
    totals.today.cost += p.cost.today;
    totals.week.calls += p.calls.week;
    totals.week.cost += p.cost.week;
    totals.month.calls += p.calls.month;
    totals.month.cost += p.cost.month;
  }

  totals.today.cost = +totals.today.cost.toFixed(4);
  totals.week.cost = +totals.week.cost.toFixed(4);
  totals.month.cost = +totals.month.cost.toFixed(4);

  const perUser = activeUsers > 0 ? +(totals.month.cost / activeUsers).toFixed(4) : 0;

  return NextResponse.json({ platforms, totals, perUser });
}
