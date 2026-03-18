/**
 * POST /api/payment/checkout
 *
 * Iyzico checkout form session olusturur.
 * Bu endpoint, subscription webhook entegrasyonu icin
 * iyzicoCustomerRef ve iyzicoSubscriptionRef degerlerini de kaydeder.
 *
 * Body: { plan: "pro" | "business" | "agency", period?: "monthly" | "yearly" }
 *
 * Env:
 *   IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL (default sandbox)
 *
 * Plans (monthly TRY):
 *   pro:      2.495
 *   business: 7.495
 *   agency:  19.995
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
    // ── Auth ──────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Body parse ───────────────────────────────────
    const body = await request.json();
    const plan = body.plan as Exclude<PlanType, "free">;
    const period = (body.period || "monthly") as PlanPeriod;

    if (!VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: "Gecersiz plan" }, { status: 400 });
    }
    if (!VALID_PERIODS.includes(period)) {
      return NextResponse.json({ error: "Gecersiz donem" }, { status: 400 });
    }

    // ── Profile ──────────────────────────────────────
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil bulunamadi" }, { status: 404 });
    }

    const price = getPlanPrice(plan, period);

    // ── Payment record (pending) ─────────────────────
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

    // ── Iyzico checkout form ─────────────────────────
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

    // ── Save token + customer ref ────────────────────
    await prisma.payment.update({
      where: { id: payment.id },
      data: { iyzicoToken: token },
    });

    // Store customer reference for webhook matching
    if (!profile.iyzicoCustomerRef) {
      await prisma.profile.update({
        where: { id: user.id },
        data: { iyzicoCustomerRef: user.id },
      });
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      token,
      checkoutFormContent,
    });
  } catch (err) {
    console.error("[payment/checkout] Error:", err);
    return NextResponse.json(
      { error: "Odeme formu olusturulamadi" },
      { status: 500 },
    );
  }
}
