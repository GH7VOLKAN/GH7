import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, timeSlot, subject } = body;

    // TODO: Save to Supabase leads table / send to CRM
    console.log("New lead:", { phone, timeSlot, subject, timestamp: new Date().toISOString() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead save error:", error);
    return NextResponse.json({ error: "Lead kaydedilemedi" }, { status: 500 });
  }
}
