/**
 * Order Refund
 *
 * Kullanıcı "İade İste" tıkladığında çağrılır.
 * Sadece delivered durumundaki siparişler için geçerli (72 saat itiraz süresi içinde).
 *
 * İyzico'dan gerçek para iadesi yapılır.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { refundPayment } from "@/lib/iyzico/refund";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = (body.reason as string | undefined)?.slice(0, 500);

    const order = await prisma.serviceOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });
    }

    if (order.status !== "delivered") {
      return NextResponse.json(
        {
          error: `İade sadece teslim edilmiş siparişler için mümkün (mevcut: ${order.status})`,
        },
        { status: 400 }
      );
    }

    // 72 saat sınırı kontrolü
    if (order.autoApproveAt && new Date() > order.autoApproveAt) {
      return NextResponse.json(
        { error: "72 saat itiraz süreniz geçmiş, bu sipariş otomatik onaylandı" },
        { status: 400 }
      );
    }

    if (!order.iyzicoPaymentRef) {
      return NextResponse.json(
        { error: "Ödeme referansı bulunamadı, lütfen destek ekibiyle iletişime geçin" },
        { status: 500 }
      );
    }

    // İyzico'dan para iadesi
    const refundResult = await refundPayment(order.iyzicoPaymentRef, order.amount);

    if (!refundResult.success) {
      return NextResponse.json(
        {
          error: `İade başarısız: ${refundResult.errorMessage ?? "bilinmeyen hata"}. Destek ekibiyle iletişime geçin.`,
        },
        { status: 500 }
      );
    }

    // ServiceOrder.status = refunded
    await prisma.serviceOrder.update({
      where: { id },
      data: {
        status: "refunded",
        adminNotes: reason
          ? `Kullanıcı iade sebebi: ${reason}`
          : "Kullanıcı iade talep etti.",
      },
    });

    // Admin bildirim
    const brand = await prisma.brand.findFirst({
      where: { profileId: user.id },
      select: { id: true },
    });

    if (brand) {
      await prisma.notification.create({
        data: {
          brandId: brand.id,
          type: "order_refunded",
          title: "Sipariş iade edildi",
          message: `Sipariş #${id.slice(0, 8)} müşteri talebi üzerine iade edildi. ${reason ? `Sebep: ${reason}` : ""}`,
          data: { orderId: id, reason },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[order-refund] Error for ${id}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "İade işlemi başarısız" },
      { status: 500 }
    );
  }
}
