import { NextRequest, NextResponse } from "next/server";
import { runDiscovery } from "@/lib/ai/website-analyzer";
import { isValidCompanyType } from "@/lib/ai/discovery-types";
import type { DiscoveryInput } from "@/lib/ai/discovery-types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { input?: Partial<DiscoveryInput> };
    const input = body.input;

    if (!input || !isValidCompanyType(input.companyType)) {
      return NextResponse.json(
        { error: "companyType required (firma|kisi|eticaret|yurtdisi)" },
        { status: 400 }
      );
    }

    const result = await runDiscovery(input as DiscoveryInput);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/run-discovery] Error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Discovery failed",
      },
      { status: 500 }
    );
  }
}
