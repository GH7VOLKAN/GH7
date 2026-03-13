import { Resend } from "resend";
import { otpTemplate } from "./templates/otp";
import { welcomeTemplate } from "./templates/welcome";
import { scanCompleteTemplate } from "./templates/scan-complete";
import { scoreChangeTemplate } from "./templates/score-change";
import { weeklyReportTemplate } from "./templates/weekly-report";
import { accountUpdateTemplate } from "./templates/account-update";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
const FROM = process.env.RESEND_FROM_EMAIL || "bildirim@gh7.ai";

// ─── OTP ────────────────────────────────────────────

export async function sendOtpEmail(email: string, code: string) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: `GH7 — Giriş Kodunuz: ${code}`,
    html: otpTemplate(code),
  });
}

// ─── Welcome ────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name?: string) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: "GH7'ye Hoş Geldiniz",
    html: welcomeTemplate(name),
  });
}

// ─── Scan Complete ──────────────────────────────────

export async function sendScanCompleteEmail(
  email: string,
  brandName: string,
  score: number
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: `Tarama Tamamlandı — ${brandName}`,
    html: scanCompleteTemplate(brandName, score),
  });
}

// ─── Score Change ───────────────────────────────────

export async function sendScoreChangeEmail(
  email: string,
  brandName: string,
  oldScore: number,
  newScore: number
) {
  const direction = newScore > oldScore ? "yükseldi" : "düştü";
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: `Skorunuz ${direction}: ${oldScore} → ${newScore}`,
    html: scoreChangeTemplate(brandName, oldScore, newScore),
  });
}

// ─── Weekly Report ──────────────────────────────────

export async function sendWeeklyReportEmail(
  email: string,
  brandName: string,
  data: { score: number; change: number; topPlatform: string }
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: `Haftalık Rapor — ${brandName}`,
    html: weeklyReportTemplate(brandName, data),
  });
}

// ─── Account Update ─────────────────────────────────

export async function sendAccountUpdateEmail(
  email: string,
  changes: string
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: "Hesap Bilgileriniz Güncellendi",
    html: accountUpdateTemplate(changes),
  });
}
