import { NextRequest, NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { sendAgencyPackageEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const body = await req.json();
    const { agencyEmail } = body;

    if (!agencyEmail || typeof agencyEmail !== "string") {
      return NextResponse.json(
        { error: "agencyEmail is required" },
        { status: 400 },
      );
    }

    await sendAgencyPackageEmail(agencyEmail, {
      contactName: activeBrand.profile.fullName ?? activeBrand.profile.email,
      brandCount: 1,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/panel/agency-report]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
