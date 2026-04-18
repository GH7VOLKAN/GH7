/**
 * Admin Bypass & Permissions
 *
 * Admin kullanıcılar için:
 * - freeAuditUsed kontrolü atlanır
 * - IP rate limit atlanır
 * - SMS kodu gönderilmez, sabit "000000" kabul edilir
 * - /admin/test-tools sayfasına erişim
 *
 * ENV değişkenleri:
 *   ADMIN_PHONES=9055XXXXXXXX,9055YYYYYYYY (comma-separated, 905 prefix ile)
 *   ADMIN_EMAILS=volkan@isitmax.com,info@gh7.ai
 *   ADMIN_BYPASS_KEY=gizli-test-key-2026  (URL bypass için)
 *   ADMIN_MAGIC_CODE=000000  (admin için sabit doğrulama kodu, default 000000)
 */

import { createClient } from "@/lib/supabase/server";
import { normalizePhoneNumber } from "@/lib/sms/netgsm";

// Legacy hardcoded fallback (env yoksa kullanılır — geriye uyumluluk)
const LEGACY_ADMIN_EMAILS = [
  "info@gh7.ai",
  "kaizen.isitmax@gmail.com",
  "volkan@isitmax.com",
  "info@isitmax.com",
];

/**
 * Admin telefon listesini env'den okur (905XXXXXXXXX formatında normalize eder).
 */
export function getAdminPhones(): string[] {
  const raw = process.env.ADMIN_PHONES ?? "";
  return raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => normalizePhoneNumber(p));
}

/**
 * Admin e-posta listesini env'den okur.
 * ADMIN_EMAILS tanımlı değilse legacy hardcoded listeye düşer.
 */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const envList = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (envList.length > 0) return envList;
  return LEGACY_ADMIN_EMAILS.map((e) => e.toLowerCase());
}

/** Geriye uyumluluk — eski kodlar bu sabitten import ediyor. */
export const ADMIN_EMAILS = LEGACY_ADMIN_EMAILS;

/**
 * Admin bypass URL key (development/staging'de sadece geçerli).
 */
export function getAdminBypassKey(): string | null {
  return process.env.ADMIN_BYPASS_KEY ?? null;
}

/**
 * Admin için sabit doğrulama kodu. Default "000000".
 */
export function getAdminMagicCode(): string {
  return process.env.ADMIN_MAGIC_CODE ?? "000000";
}

/**
 * Verilen telefon/e-posta bir admin'e mi ait?
 */
export function isAdmin(input: {
  phone?: string | null;
  email?: string | null;
}): boolean {
  const { phone, email } = input;

  if (phone) {
    const normalized = normalizePhoneNumber(phone);
    if (getAdminPhones().includes(normalized)) return true;
  }

  if (email) {
    const normalizedEmail = email.toLowerCase().trim();
    if (getAdminEmails().includes(normalizedEmail)) return true;
  }

  return false;
}

/**
 * URL bypass key doğru mu? (sadece non-production'da geçerli)
 */
export function isValidBypassKey(key: string | null | undefined): boolean {
  if (!key) return false;
  if (process.env.NODE_ENV === "production") return false;
  const expected = getAdminBypassKey();
  if (!expected) return false;
  return key === expected;
}

/**
 * Mevcut session'daki kullanıcının admin olup olmadığını kontrol eder.
 * Admin ise user object'i, değilse null döner.
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
 * Session-based admin kontrolü (phone VEYA email ile).
 * Supabase kullanıcısından sonra Prisma Profile'dan phone da çekilir.
 */
export async function isSessionAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;
  return isAdmin({ email: user.email, phone: user.user_metadata?.phone });
}

/**
 * Admin action'ı logla (console + telemetry).
 */
export function logAdminAction(
  actor: string,
  action: string,
  details?: Record<string, unknown>,
): void {
  const entry = {
    ts: new Date().toISOString(),
    actor,
    action,
    ...details,
  };
  console.log(`[ADMIN-ACTION] ${JSON.stringify(entry)}`);
}
