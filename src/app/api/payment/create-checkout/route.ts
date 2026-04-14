/**
 * POST /api/payment/create-checkout
 *
 * İyzico checkout formu oluşturur.
 * Body: { plan: "pro" | "business" | "agency", period: "monthly" | "yearly" }
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { createCheckoutForm } from "@/lib/iyzico/checkout";
import { getPlanPrice, type PlanPeriod } from "@/lib/iyzico/plans";
import type { PlanType } from "@/lib/plans";

const VALID_PLANS: Array<Exclude<PlanType, "free">> = ["pro", "business", "agency"];
const VALID_PERIODS: PlanPeriod[] = ["monthly", "yearly"];

export async function POST(request: Request) {
  try {
    // Auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Body parse
    const body = await request.json();
    const plan = body.plan as Exclude<PlanType, "free">;
    const period = (body.period || "monthly") as PlanPeriod;

    if (!VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });
    }
    if (!VALID_PERIODS.includes(period)) {
      return NextResponse.json({ error: "Geçersiz dönem" }, { status: 400 });
    }

    // Profile bilgileri (upsert to ensure it exists)
    const profile = await prisma.profile.upsert({
      where: { id: user.id },
      update: { email: user.email ?? "" },
      create: {
        id: user.id,
        email: user.email ?? "",
        fullName: user.user_metadata?.full_name ?? null,
        avatarUrl: user.user_metadata?.avatar_url ?? null,
      },
    });

    const price = getPlanPrice(plan, period);

    // Payment kaydı oluştur (pending)
    const payment = await prisma.payment.create({
      data: {
        profileId: user.id,
        plan,
        amount: price,
        currency: "TRY",
        status: "pending",
        period,
      },
    });

    // İyzico checkout form
    const { token, checkoutFormContent } = await createCheckoutForm(
      {
        id: user.id,
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone,
      },
      plan,
      period,
    );

    // Token'ı payment'a kaydet
    await prisma.payment.update({
      where: { id: payment.id },
      data: { iyzicoToken: token },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      token,
      checkoutFormContent,
    });
  } catch (err) {
    console.error("[create-checkout] Error:", err);
    return NextResponse.json(
      { error: "Ödeme formu oluşturulamadı" },
      { status: 500 },
    );
  }
}
