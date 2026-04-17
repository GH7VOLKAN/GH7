/**
 * Order Approval
 *
 * Kullanıcı "Onayla ve Beğendim" tıkladığında çağrılır.
 * Status: delivered → approved_final
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

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
        { error: `Sipariş durumu uygun değil: ${order.status}` },
        { status: 400 }
      );
    }

    await prisma.serviceOrder.update({
      where: { id },
      data: {
        status: "approved_final",
        approvedAt: new Date(),
      },
    });

    // Admin'e bildirim
    const brand = await prisma.brand.findFirst({
      where: { profileId: user.id },
      select: { id: true },
    });

    if (brand) {
      await prisma.notification.create({
        data: {
          brandId: brand.id,
          type: "order_approved",
          title: "Müşteri siparişi onayladı",
          message: `Sipariş #${id.slice(0, 8)} müşteri tarafından onaylandı.`,
          data: { orderId: id },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[order-approve] Error for ${id}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Onay işlemi başarısız" },
      { status: 500 }
    );
  }
}
