import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [planCounts, recentPayments, failedPayments, churnedUsers] =
    await Promise.all([
      // Plan distribution
      prisma.profile.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),

      // Recent 50 payments
      prisma.payment.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: { profile: { select: { email: true } } },
      }),

      // At-risk: grace period set and not yet expired
      prisma.profile.findMany({
        where: {
          gracePeriodEnd: { not: null, gte: now },
        },
        select: {
          id: true,
          email: true,
          plan: true,
          gracePeriodEnd: true,
        },
        orderBy: { gracePeriodEnd: "asc" },
      }),

      // Churn: plan is free but planEndDate within last 30 days (downgraded)
      prisma.profile.findMany({
        where: {
          plan: "free",
          planEndDate: { gte: thirtyDaysAgo, lte: now },
        },
        select: {
          id: true,
          email: true,
          planEndDate: true,
        },
        orderBy: { planEndDate: "desc" },
      }),
    ]);

  // Plan distribution map
  const plans: Record<string, number> = {
    free: 0,
    pro: 0,
    business: 0,
    agency: 0,
  };
  for (const row of planCounts) {
    const key = row.plan.toLowerCase();
    if (key in plans) {
      plans[key] = row._count.plan;
    }
  }

  // MRR in kurus
  const mrr = plans.pro * 2495 + plans.business * 7495 + plans.agency * 19995;

  // Format payments
  const payments = recentPayments.map((p) => ({
    id: p.id,
    email: p.profile.email,
    plan: p.plan,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    date: p.createdAt,
  }));

  return NextResponse.json({
    mrr,
    plans,
    payments,
    failedPayments,
    churnedUsers,
  });
}
