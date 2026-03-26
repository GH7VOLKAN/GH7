/**
 * POST /api/webhook/iyzico
 *
 * Iyzico subscription webhook handler.
 * Events:
 *   - subscription.order.success  -> Plan upgrade + pro activation pipeline
 *   - subscription.order.failure  -> Mark payment failed, send notification
 *   - subscription.cancel         -> Downgrade to free
 *
 * Iyzico sends a JSON body with a signature in the X-IYZ-SIGNATURE header.
 * We verify the signature using HMAC-SHA256(secretKey, payload).
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { captureError } from "@/lib/monitoring";
import { activatePlan, deactivatePlan } from "@/lib/iyzico/activate-plan";
import { PLAN_PRICES, type PlanPeriod } from "@/lib/iyzico/plans";
import type { PlanType } from "@/lib/plans";

// ── Types ────────────────────────────────────────────

interface IyzicoWebhookPayload {
  iyziEventType: string;
  iyziReferenceCode?: string;
  token?: string;
  paymentId?: string;
  paymentConversationId?: string;
  status?: string;
  price?: number | string;
  paidPrice?: number | string;
  currency?: string;
  subscriptionReferenceCode?: string;
  customerReferenceCode?: string;
  // Fallback: raw payload may contain additional fields
  [key: string]: unknown;
}

// ── Signature verification ───────────────────────────

function verifyIyzicoSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) {
    console.warn("[webhook/iyzico] No signature header present — skipping verification in dev");
    // In production, you should return false here.
    // Allow unsigned requests only in development.
    return process.env.NODE_ENV !== "production";
  }

  const secretKey = process.env.IYZICO_SECRET_KEY;
  if (!secretKey) {
    console.error("[webhook/iyzico] IYZICO_SECRET_KEY not configured");
    return false;
  }

  const computed = crypto
    .createHmac("sha256", secretKey)
    .update(rawBody, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature),
  );
}

// ── Plan resolution from price ───────────────────────

type PaidPlan = Exclude<PlanType, "free">;

function resolvePlanFromPrice(price: number): { plan: PaidPlan; period: PlanPeriod } | null {
  // Check monthly prices first (exact match)
  for (const [plan, prices] of Object.entries(PLAN_PRICES)) {
    if (price === prices.monthly) {
      return { plan: plan as PaidPlan, period: "monthly" };
    }
    if (price === prices.yearly) {
      return { plan: plan as PaidPlan, period: "yearly" };
    }
  }
  return null;
}

// ── Fire-and-forget: Pro activation pipeline ─────────

async function fireProActivation(brandId: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cronSecret = process.env.CRON_SECRET;

  try {
    fetch(`${appUrl}/api/brands/activate-pro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {}),
      },
      body: JSON.stringify({ brandId }),
    }).catch((err) => {
      console.error("[webhook/iyzico] Pro activation fire-and-forget failed:", err);
    });
  } catch (err) {
    console.error("[webhook/iyzico] Pro activation trigger failed:", err);
  }
}

// ── Helpers ──────────────────────────────────────────

async function findProfileByCustomerRef(
  customerRef: string | undefined,
): Promise<string | null> {
  if (!customerRef) return null;

  const profile = await prisma.profile.findFirst({
    where: { iyzicoCustomerRef: customerRef },
    select: { id: true },
  });

  return profile?.id ?? null;
}

async function findProfileBySubscriptionRef(
  subscriptionRef: string | undefined,
): Promise<string | null> {
  if (!subscriptionRef) return null;

  const profile = await prisma.profile.findFirst({
    where: { iyzicoSubscriptionRef: subscriptionRef },
    select: { id: true },
  });

  return profile?.id ?? null;
}

async function resolveProfileId(payload: IyzicoWebhookPayload): Promise<string | null> {
  // Try customer reference first
  let profileId = await findProfileByCustomerRef(payload.customerReferenceCode);
  if (profileId) return profileId;

  // Try subscription reference
  profileId = await findProfileBySubscriptionRef(payload.subscriptionReferenceCode);
  if (profileId) return profileId;

  // Try by iyzico payment ID from payment records
  if (payload.paymentId) {
    const payment = await prisma.payment.findFirst({
      where: { iyzicoPaymentId: String(payload.paymentId) },
      select: { profileId: true },
    });
    if (payment) return payment.profileId;
  }

  // Try by conversationId (format: profileId_plan_period_timestamp)
  if (payload.paymentConversationId) {
    const parts = payload.paymentConversationId.split("_");
    if (parts.length >= 1) {
      const possibleProfileId = parts[0];
      const profile = await prisma.profile.findUnique({
        where: { id: possibleProfileId },
        select: { id: true },
      });
      if (profile) return profile.id;
    }
  }

  return null;
}

async function triggerProActivation(profileId: string): Promise<void> {
  // Find default brand, or fallback to most recent brand
  const brand = await prisma.brand.findFirst({
    where: { profileId, isDefault: true },
    select: { id: true, name: true },
  });

  const targetBrand =
    brand ??
    (await prisma.brand.findFirst({
      where: { profileId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }));

  if (targetBrand) {
    console.log(
      `[webhook/iyzico] Triggering Pro activation for brand "${targetBrand.name}" (${targetBrand.id})`,
    );
    await fireProActivation(targetBrand.id);
  }
}

// ── Event handlers ───────────────────────────────────

async function handleSubscriptionSuccess(payload: IyzicoWebhookPayload): Promise<void> {
  const profileId = await resolveProfileId(payload);
  if (!profileId) {
    console.error("[webhook/iyzico] subscription.order.success — Could not resolve profile", payload);
    return;
  }

  // Determine plan from price
  const price = Number(payload.paidPrice || payload.price || 0);
  const resolved = resolvePlanFromPrice(price);

  if (!resolved) {
    console.error(`[webhook/iyzico] Could not resolve plan from price: ${price}`);
    // Default to pro monthly if price doesn't match
    console.log("[webhook/iyzico] Defaulting to pro/monthly");
    await activatePlan(profileId, "pro", "monthly");
  } else {
    await activatePlan(profileId, resolved.plan, resolved.period);
  }

  // Store subscription reference if provided
  if (payload.subscriptionReferenceCode) {
    await prisma.profile.update({
      where: { id: profileId },
      data: { iyzicoSubscriptionRef: payload.subscriptionReferenceCode },
    });
  }

  // Record payment
  await prisma.payment.create({
    data: {
      profileId,
      plan: resolved?.plan ?? "pro",
      amount: price,
      currency: String(payload.currency || "TRY"),
      status: "success",
      iyzicoPaymentId: payload.paymentId ? String(payload.paymentId) : null,
      period: resolved?.period ?? "monthly",
    },
  });

  console.log(
    `[webhook/iyzico] subscription.order.success — ${profileId} → ${resolved?.plan ?? "pro"} (${resolved?.period ?? "monthly"})`,
  );

  // Trigger prompt generation + first scan (fire-and-forget)
  await triggerProActivation(profileId);
}

async function handleSubscriptionFailure(payload: IyzicoWebhookPayload): Promise<void> {
  const profileId = await resolveProfileId(payload);
  if (!profileId) {
    console.error("[webhook/iyzico] subscription.order.failure — Could not resolve profile", payload);
    return;
  }

  // Record failed payment
  const price = Number(payload.paidPrice || payload.price || 0);
  await prisma.payment.create({
    data: {
      profileId,
      plan: "unknown",
      amount: price,
      currency: String(payload.currency || "TRY"),
      status: "failed",
      iyzicoPaymentId: payload.paymentId ? String(payload.paymentId) : null,
      period: "monthly",
    },
  });

  // Set grace period start (payment failed, give them time)
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3);

  await prisma.profile.update({
    where: { id: profileId },
    data: { gracePeriodEnd },
  });

  // Send in-app notification
  const brand = await prisma.brand.findFirst({
    where: { profileId, isDefault: true },
    select: { id: true },
  });

  if (brand) {
    await prisma.notification.create({
      data: {
        brandId: brand.id,
        type: "scan_failed", // reuse existing type for payment failure
        title: "Ödeme Başarısız",
        message:
          "Abonelik ödemeniz alınamadı. Lütfen ödeme bilgilerinizi güncelleyin. 3 gün içinde güncellenmezse planınız ücretsiz plana düşecektir.",
      },
    });
  }

  console.log(
    `[webhook/iyzico] subscription.order.failure — ${profileId}, grace period: ${gracePeriodEnd.toISOString()}`,
  );
}

async function handleSubscriptionCancel(payload: IyzicoWebhookPayload): Promise<void> {
  const profileId = await resolveProfileId(payload);
  if (!profileId) {
    console.error("[webhook/iyzico] subscription.cancel — Could not resolve profile", payload);
    return;
  }

  await deactivatePlan(profileId);

  // Clear subscription reference
  await prisma.profile.update({
    where: { id: profileId },
    data: { iyzicoSubscriptionRef: null },
  });

  // Send in-app notification
  const brand = await prisma.brand.findFirst({
    where: { profileId, isDefault: true },
    select: { id: true },
  });

  if (brand) {
    await prisma.notification.create({
      data: {
        brandId: brand.id,
        type: "scan_completed", // reuse type
        title: "Abonelik İptal Edildi",
        message:
          "Aboneliğiniz iptal edildi ve planınız ücretsiz plana düşürüldü. Tekrar yükseltmek için ayarlar sayfasını ziyaret edin.",
      },
    });
  }

  console.log(`[webhook/iyzico] subscription.cancel — ${profileId} → free`);
}

// ── Main handler ─────────────────────────────────────

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-iyz-signature");

    // Verify signature
    if (!verifyIyzicoSignature(rawBody, signature)) {
      console.error("[webhook/iyzico] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse payload
    let payload: IyzicoWebhookPayload;
    try {
      payload = JSON.parse(rawBody) as IyzicoWebhookPayload;
    } catch {
      console.error("[webhook/iyzico] Invalid JSON body");
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const eventType = payload.iyziEventType;
    console.log(`[webhook/iyzico] Received event: ${eventType}`);

    switch (eventType) {
      case "subscription.order.success":
        await handleSubscriptionSuccess(payload);
        break;

      case "subscription.order.failure":
        await handleSubscriptionFailure(payload);
        break;

      case "subscription.cancel":
        await handleSubscriptionCancel(payload);
        break;

      default:
        console.log(`[webhook/iyzico] Unhandled event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (err) {
    captureError(err, { context: "webhook/iyzico", phase: "main-handler" });
    // Still return 200 to prevent Iyzico from retrying indefinitely
    return NextResponse.json({ received: true, error: "Internal error" }, { status: 200 });
  }
}
