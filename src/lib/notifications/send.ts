/**
 * Merkezi Bildirim Gönderici
 * In-app + Email + SMS (Pro only) bildirimleri tek yerden yönetir
 */

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  sendScanCompleteEmail,
  sendScoreChangeEmail,
} from "@/lib/email/resend";
import { sendSms } from "@/lib/sms/netgsm";

interface NotifyOptions {
  brandId: string;
  type: "scan_completed" | "scan_failed" | "score_up" | "score_down";
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Send notification through all channels:
 * 1. In-app (DB notification) — always
 * 2. Email — always
 * 3. SMS — only if Pro user with smsEnabled + phone
 */
export async function sendNotification(options: NotifyOptions) {
  const { brandId, type, title, message, data } = options;

  // 1. In-app notification (DB)
  await prisma.notification.create({
    data: {
      brandId,
      type,
      title,
      message,
      data: (data as Prisma.InputJsonValue) ?? undefined,
    },
  });

  // Get brand + profile info for email/SMS
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    include: { profile: true },
  });

  if (!brand?.profile) return;

  const { email, phone, smsEnabled } = brand.profile;
  // Per-type email preferences (default true if field doesn't exist yet)
  const emailScanComplete = (brand.profile as Record<string, unknown>).emailScanComplete !== false;
  const emailScoreChange = (brand.profile as Record<string, unknown>).emailScoreChange !== false;

  // 2. Email notification (respects per-type preferences)
  try {
    if (type === "scan_completed" && data?.score !== undefined && emailScanComplete) {
      await sendScanCompleteEmail(email, brand.name, data.score as number);
    } else if (
      (type === "score_up" || type === "score_down") &&
      data?.oldScore !== undefined &&
      data?.newScore !== undefined &&
      emailScoreChange
    ) {
      await sendScoreChangeEmail(
        email,
        brand.name,
        data.oldScore as number,
        data.newScore as number
      );
    }
  } catch (err) {
    console.error("[notification] Email send failed:", err);
  }

  // 3. SMS notification (Pro users only)
  if (smsEnabled && phone) {
    try {
      let smsMessage = "";
      if (type === "scan_completed") {
        smsMessage = `GH7: ${brand.name} taraması tamamlandı. Puan: ${data?.score ?? "—"}. app.gh7.ai`;
      } else if (type === "score_up" || type === "score_down") {
        smsMessage = `GH7: ${brand.name} puanınız ${data?.oldScore} → ${data?.newScore}. app.gh7.ai`;
      }

      if (smsMessage) {
        await sendSms(phone, smsMessage);
      }
    } catch (err) {
      console.error("[notification] SMS send failed:", err);
    }
  }
}
