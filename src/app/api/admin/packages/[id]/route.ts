import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updates: {
    price?: number;
    isActive?: boolean;
    description?: string;
    estimatedScoreBoost?: number;
    deliveryDays?: number;
  } = {};

  if (typeof body.price === "number" && body.price > 0) updates.price = body.price;
  if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
  if (typeof body.description === "string") updates.description = body.description;
  if (typeof body.estimatedScoreBoost === "number") {
    updates.estimatedScoreBoost = body.estimatedScoreBoost;
  }
  if (typeof body.deliveryDays === "number" && body.deliveryDays > 0) {
    updates.deliveryDays = body.deliveryDays;
  }

  await prisma.servicePackage.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json({ success: true });
}
