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
  const body = await req.json().catch(() => ({}));
  const note = (body.note as string | undefined)?.slice(0, 2000) ?? "";

  await prisma.serviceOrder.update({
    where: { id },
    data: { adminNotes: note },
  });

  return NextResponse.json({ success: true });
}
