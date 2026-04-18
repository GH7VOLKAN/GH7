/**
 * Admin yardımcıları — env-based.
 *
 * ENV:
 *   ADMIN_EMAILS=volkan@isitmax.com,info@gh7.ai
 *   ADMIN_PHONES=905XXXXXXXXX,905YYYYYYYYY
 *   ADMIN_MAGIC_CODE=000000  (SMS OTP yerine kabul edilir)
 */

import { createClient } from "@/lib/supabase/server";
import { normalizePhoneNumber } from "@/lib/sms/netgsm";

const LEGACY_ADMIN_EMAILS = [
  "info@gh7.ai",
  "kaizen.isitmax@gmail.com",
  "volkan@isitmax.com",
  "info@isitmax.com",
];

export const ADMIN_EMAILS = LEGACY_ADMIN_EMAILS; // legacy import uyumu

function getAdminEmailsList(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const envList = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (envList.length > 0) return envList;
  return LEGACY_ADMIN_EMAILS.map((e) => e.toLowerCase());
}

function getAdminPhonesList(): string[] {
  const raw = process.env.ADMIN_PHONES ?? "";
  return raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => normalizePhoneNumber(p));
}

export function getAdminMagicCode(): string {
  return process.env.ADMIN_MAGIC_CODE ?? "000000";
}

/**
 * Verilen email/phone admin mi?
 */
export function isAdmin(input: {
  email?: string | null;
  phone?: string | null;
}): boolean {
  const { email, phone } = input;
  if (email && getAdminEmailsList().includes(email.toLowerCase().trim())) {
    return true;
  }
  if (phone) {
    const normalized = normalizePhoneNumber(phone);
    if (getAdminPhonesList().includes(normalized)) return true;
  }
  return false;
}

/**
 * Session'dan Supabase user çek ve admin mi kontrol et.
 * Admin değilse null döner.
 */
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  if (!isAdmin({ email: user.email })) return null;
  return user;
}

/**
 * Admin işlem logu — console + telemetri için.
 */
export function logAdminAction(
  actor: string,
  action: string,
  details?: Record<string, unknown>,
): void {
  const entry = { ts: new Date().toISOString(), actor, action, ...details };
  console.log(`[ADMIN-ACTION] ${JSON.stringify(entry)}`);
}
