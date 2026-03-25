import { NextRequest, NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { emailWeeklyReport } = body;

    const data: Record<string, unknown> = {};
    if (typeof emailWeeklyReport === "boolean") {
      data.emailWeeklyReport = emailWeeklyReport;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.profile.update({
      where: { id: activeBrand.profile.id },
      data,
    });

    return NextResponse.json({
      emailWeeklyReport: updated.emailWeeklyReport,
    });
  } catch (error) {
    console.error("[api/panel/profile]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
