/**
 * Order Payment Callback
 *
 * İyzico ödeme tamamlandıktan sonra buraya döner (server-side form POST).
 * Başarılı → ServiceOrder.status = "paid_holding"
 * Başarısız → status = "cancelled" veya "pending" (kullanıcı tekrar dener)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { retrieveCheckoutForm } from "@/lib/iyzico/checkout";

export const runtime = "nodejs";

async function processCallback(orderId: string, token: string | null) {
  const order = await prisma.serviceOrder.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { success: false, redirect: "/panel/hizmetler?error=order_not_found" };
  }

  if (!token) {
    return { success: false, redirect: `/panel/hizmetler?error=no_token&order=${orderId}` };
  }

  try {
    const result = await retrieveCheckoutForm(token);

    if (result.status !== "success" || result.paymentStatus !== "SUCCESS") {
      console.error(`[order-callback] Payment not successful for ${orderId}:`, result);
      await prisma.serviceOrder.update({
        where: { id: orderId },
        data: { status: "cancelled", adminNotes: `Ödeme başarısız: ${result.errorMessage ?? "bilinmeyen"}` },
      });
      return { success: false, redirect: `/panel/hizmetler?error=payment_failed&order=${orderId}` };
    }

    // paymentTransactionId (refund için gerekli)
    const paymentTransactionId =
      result.paymentItems?.[0]?.paymentTransactionId ?? result.paymentId;

    // Order'ı paid_holding yap
    await prisma.serviceOrder.update({
      where: { id: orderId },
      data: {
        status: "paid_holding",
        iyzicoPaymentRef: paymentTransactionId ?? result.paymentId,
      },
    });

    // Admin'e bildirim
    const brand = await prisma.brand.findFirst({
      where: { profileId: order.userId },
      select: { id: true },
    });

    if (brand) {
      await prisma.notification.create({
        data: {
          brandId: brand.id,
          type: "order_paid",
          title: "Yeni sipariş ödemesi alındı",
          message: `Sipariş #${orderId.slice(0, 8)} — ₺${order.amount.toLocaleString("tr-TR")} ödendi. İş başlatılmalı.`,
          data: { orderId, amount: order.amount },
        },
      });
    }

    return { success: true, redirect: `/panel/hizmetler?success=1&order=${orderId}` };
  } catch (err) {
    console.error(`[order-callback] Error for ${orderId}:`, err);
    return { success: false, redirect: `/panel/hizmetler?error=callback_error&order=${orderId}` };
  }
}

// İyzico POST ile form data gönderir
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await req.formData();
  const token = formData.get("token") as string | null;

  const result = await processCallback(id, token);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}${result.redirect}`, 303);
}

// GET fallback (bazı iyzico setup'ları GET kullanabilir)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");

  const result = await processCallback(id, token);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}${result.redirect}`, 303);
}
