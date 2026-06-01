"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isOperator } from "@/lib/operator";
import { runVisibility } from "@/lib/visibility-engine/run";
import type { Lang } from "@/lib/report/types";

interface OrderForRun {
  id: string;
  report_lang: string;
  white_label: boolean;
  intake: Record<string, unknown> | null;
  clients: { name: string; domain: string | null; logo_url: string | null } | null;
  product_tiers: { prompt_count: number } | null;
}

export async function runOrder(
  orderId: string,
): Promise<{ token: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isOperator(user.email)) return { error: "Yetkisiz." };

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, report_lang, white_label, intake, clients(name, domain, logo_url), product_tiers(prompt_count)",
    )
    .eq("id", orderId)
    .single<OrderForRun>();

  if (error || !order) return { error: "Sipariş bulunamadı." };
  const domain = order.clients?.domain;
  if (!domain) return { error: "Müşteri domaini tanımlı değil." };

  const brand = order.clients?.name ?? domain;
  const lang: Lang = order.report_lang === "en" ? "en" : "tr";
  const promptCount = order.product_tiers?.prompt_count ?? 10;
  const logoUrl = order.white_label ? order.clients?.logo_url ?? undefined : undefined;
  const competitorDomains = Array.isArray(order.intake?.competitorDomains)
    ? (order.intake!.competitorDomains as unknown[]).map(String)
    : [];

  await supabase.from("orders").update({ status: "running" }).eq("id", orderId);

  try {
    const { report } = await runVisibility({
      domain,
      brand,
      lang,
      competitorDomains,
      promptCount,
      logoUrl,
    });

    const { data: rep, error: rErr } = await supabase
      .from("reports")
      .insert({ order_id: orderId, lang, data: report })
      .select("token")
      .single<{ token: string }>();

    if (rErr || !rep) throw rErr ?? new Error("Rapor yazılamadı.");

    await supabase
      .from("orders")
      .update({ status: "report", report_token: rep.token })
      .eq("id", orderId);

    revalidatePath("/panel");
    return { token: rep.token };
  } catch (e) {
    await supabase.from("orders").update({ status: "new" }).eq("id", orderId);
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
