"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isOperator } from "@/lib/operator";
import { inngest } from "@/inngest/client";

/**
 * Enqueue a durable background run for an order. Returns immediately; the
 * actual work happens in the Inngest `order/run.requested` function, which
 * advances orders.status and writes the report. The panel polls for status.
 */
export async function runOrder(orderId: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isOperator(user.email)) return { error: "Yetkisiz." };

  const { data: order, error } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .single();
  if (error || !order) return { error: "Sipariş bulunamadı." };

  // Mark as accepted, then enqueue the durable run.
  await supabase.from("orders").update({ status: "intake" }).eq("id", orderId);
  await inngest.send({ name: "order/run.requested", data: { orderId } });

  revalidatePath("/panel");
  return { ok: true };
}
