import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { createOrderCheckoutForm } from "@/lib/iyzico/order-checkout";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Auth kontrolü
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { packageId, auditId } = body as {
      packageId?: string;
      auditId?: string;
    };

    if (!packageId) {
      return NextResponse.json({ error: "packageId required" }, { status: 400 });
    }

    // Profile upsert (ensure exists)
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

    // Package bul
    const pkg = await prisma.servicePackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg || !pkg.isActive) {
      return NextResponse.json(
        { error: "Paket bulunamadı veya aktif değil" },
        { status: 404 }
      );
    }

    // Pre-audit score (varsa)
    let preScore: number | null = null;
    if (auditId) {
      const audit = await prisma.geoAudit.findUnique({
        where: { id: auditId },
        select: { overallScore: true, userId: true },
      });
      if (audit && audit.userId === profile.id) {
        preScore = audit.overallScore;
      }
    }

    // ServiceOrder oluştur (pending)
    const order = await prisma.serviceOrder.create({
      data: {
        userId: profile.id,
        packageId: pkg.id,
        auditId: auditId ?? null,
        status: "pending",
        amount: pkg.price,
        preScore,
      },
    });

    // İyzico checkout form oluştur
    const checkout = await createOrderCheckoutForm({
      profileId: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      phone: profile.phone,
      orderId: order.id,
      packageName: pkg.name,
      price: pkg.price,
    });

    // Order'a token kaydet
    await prisma.serviceOrder.update({
      where: { id: order.id },
      data: { iyzicoTokenRef: checkout.token },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      token: checkout.token,
      checkoutFormContent: checkout.checkoutFormContent,
    });
  } catch (err) {
    console.error("[api/orders/create] Error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Sipariş oluşturulamadı",
      },
      { status: 500 }
    );
  }
}
