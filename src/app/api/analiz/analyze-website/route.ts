import { NextRequest, NextResponse } from "next/server";
import { analyzeWebsite } from "@/lib/ai/website-analyzer";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();
    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "domain required" }, { status: 400 });
    }

    const analysis = await analyzeWebsite(domain);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[api/analyze-website] Error:", err);
    return NextResponse.json(
      { error: "Analysis failed", products: [], services: [], sector: "", description: "" },
      { status: 500 }
    );
  }
}
