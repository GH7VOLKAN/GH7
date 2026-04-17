import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { runAudit43 } from "@/lib/ai/audit-43";
import type { UserType } from "@/lib/ai/user-type-weights";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.serviceOrder.findUnique({
    where: { id },
    include: { package: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Brand bul
  const brand = await prisma.brand.findFirst({
    where: { profileId: order.userId },
  });
  if (!brand) {
    return NextResponse.json({ error: "Brand bulunamadı" }, { status: 404 });
  }

  try {
    const activePrompts = await prisma.prompt.findMany({
      where: { brandId: brand.id, isActive: true },
      select: { text: true },
      take: 10,
    });

    const audit = await runAudit43({
      url: brand.domain,
      brandName: brand.name,
      userType: (brand.userType ?? "firma") as UserType,
      sector: brand.sector ?? undefined,
      location: brand.city ?? undefined,
      keywords: activePrompts.map((p) => p.text),
      brandId: brand.id,
    });

    // Post-audit kaydı
    const savedAudit = await prisma.geoAudit.create({
      data: {
        url: brand.domain,
        brandName: brand.name,
        location: brand.city ?? null,
        sector: brand.sector ?? null,
        userType: brand.userType ?? "firma",
        overallScore: audit.overallScore,
        competitorScore: audit.competitorScore ?? null,
        auditItems: audit.items as unknown as Prisma.InputJsonValue,
        categoryScores: audit.categoryScores as unknown as Prisma.InputJsonValue,
        estimatedMonthlyLoss: audit.estimatedMonthlyLoss,
        estimatedYearlyLoss: audit.estimatedYearlyLoss,
        isFree: false,
        userId: order.userId,
        source: "post-audit",
      },
    });

    // Order'a post-audit bilgilerini yaz
    const fixedItems = order.package.auditItemsFixed as string[];
    await prisma.serviceOrder.update({
      where: { id },
      data: {
        postAuditId: savedAudit.id,
        postScore: audit.overallScore,
        itemsFixed: (fixedItems ?? []) as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      success: true,
      postAuditId: savedAudit.id,
      postScore: audit.overallScore,
      preScore: order.preScore,
      delta: order.preScore ? audit.overallScore - order.preScore : null,
    });
  } catch (err) {
    console.error(`[admin/run-post-audit] Error for ${id}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Post-audit başarısız" },
      { status: 500 }
    );
  }
}
