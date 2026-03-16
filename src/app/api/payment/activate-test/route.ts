import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { activatePlan } from "@/lib/iyzico/activate-plan";
import type { PlanType } from "@/lib/plans";

/**
 * Test amaçlı plan aktivasyonu — ödeme olmadan.
 * POST { plan: "pro"|"business"|"agency" }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = (await request.json()) as { plan: string };

  const validPlans: Array<Exclude<PlanType, "free">> = ["pro", "business", "agency"];
  if (!validPlans.includes(plan as Exclude<PlanType, "free">)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  await activatePlan(user.id, plan as Exclude<PlanType, "free">, "yearly");

  return NextResponse.json({ success: true, plan, period: "yearly" });
}
