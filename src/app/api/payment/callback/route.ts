/**
 * POST /api/payment/callback
 *
 * İyzico checkout sonrası callback.
 * İyzico bu URL'e POST ile token gönderir, biz doğrulayıp planı aktive ederiz.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { retrieveCheckoutForm } from "@/lib/iyzico/checkout";
import { activatePlan } from "@/lib/iyzico/activate-plan";
import type { PlanType } from "@/lib/plans";
import type { PlanPeriod } from "@/lib/iyzico/plans";

/**
 * Fire-and-forget: Pro aktivasyon pipeline'ini tetikle.
 * Payment response'u BLOKLAMAZ — arka planda calisir.
 */
async function fireProActivation(brandId: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cronSecret = process.env.CRON_SECRET;

  try {
    fetch(`${appUrl}/api/brands/activate-pro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {}),
      },
      body: JSON.stringify({ brandId }),
    }).catch((err) => {
      console.error("[payment/callback] Pro activation fire-and-forget failed:", err);
    });
  } catch (err) {
    console.error("[payment/callback] Pro activation trigger failed:", err);
  }
}

export async function POST(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    // İyzico POST body'den token al (form-urlencoded)
    const formData = await request.formData();
    const token = formData.get("token") as string;

    if (!token) {
      console.error("[payment/callback] Token bulunamadı");
      return NextResponse.redirect(`${appUrl}/dashboard/ayarlar?payment=failed`);
    }

    // İyzico'dan ödeme sonucunu doğrula
    const result = await retrieveCheckoutForm(token);

    // Token ile eşleşen payment kaydını bul
    const payment = await prisma.payment.findFirst({
      where: { iyzicoToken: token },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      console.error("[payment/callback] Payment kaydı bulunamadı, token:", token);
      return NextResponse.redirect(`${appUrl}/dashboard/ayarlar?payment=failed`);
    }

    if (result.status === "success" && result.paymentStatus === "SUCCESS") {
      // Ödeme başarılı
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "success",
          iyzicoPaymentId: result.paymentId,
        },
      });

      // Plan aktive et
      await activatePlan(
        payment.profileId,
        payment.plan as Exclude<PlanType, "free">,
        payment.period as PlanPeriod,
      );

      console.log(`[payment/callback] Ödeme başarılı: ${payment.profileId} → ${payment.plan}`);

      // Pro+ plan icin tam aktivasyon pipeline'ini tetikle (fire-and-forget)
      if (payment.plan !== "free") {
        const brand = await prisma.brand.findFirst({
          where: { profileId: payment.profileId, isDefault: true },
        });
        if (brand) {
          console.log(`[payment/callback] Triggering Pro activation for brand "${brand.name}" (${brand.id})`);
          await fireProActivation(brand.id);
        } else {
          // Default brand yoksa ilk brand'i bul
          const anyBrand = await prisma.brand.findFirst({
            where: { profileId: payment.profileId },
            orderBy: { createdAt: "desc" },
          });
          if (anyBrand) {
            console.log(`[payment/callback] Triggering Pro activation for brand "${anyBrand.name}" (${anyBrand.id})`);
            await fireProActivation(anyBrand.id);
          }
        }
      }

      return NextResponse.redirect(`${appUrl}/dashboard/ayarlar?payment=success`);
    } else {
      // Ödeme başarısız
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });

      console.error("[payment/callback] Ödeme başarısız:", result.status, result.paymentStatus);
      return NextResponse.redirect(`${appUrl}/dashboard/ayarlar?payment=failed`);
    }
  } catch (err) {
    console.error("[payment/callback] Error:", err);
    return NextResponse.redirect(`${appUrl}/dashboard/ayarlar?payment=failed`);
  }
}
