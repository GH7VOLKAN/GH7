import { Resend } from "resend";
import { otpTemplate } from "./templates/otp";
import { emailVerificationTemplate } from "./templates/email-verification";
import { emailVerificationCodeTemplate } from "./templates/email-verification-code";
import { welcomeTemplate } from "./templates/welcome";
import { scanCompleteTemplate } from "./templates/scan-complete";
import { scoreChangeTemplate } from "./templates/score-change";
import { weeklyReportTemplate } from "./templates/weekly-report";
import type { WeeklyReportEmailData } from "./templates/weekly-report";
import { accountUpdateTemplate } from "./templates/account-update";
import { proWelcomeTemplate } from "./templates/pro-welcome";
import { proUpgradeTemplate } from "./templates/pro-upgrade";
import { paymentSuccessTemplate } from "./templates/payment-success";
import { paymentFailedTemplate } from "./templates/payment-failed";
import { subscriptionRenewalTemplate } from "./templates/subscription-renewal";
import { subscriptionCancelledTemplate } from "./templates/subscription-cancelled";
import { accountDeletionTemplate } from "./templates/account-deletion";
import { passwordResetTemplate } from "./templates/password-reset";
import { adminMessageTemplate } from "./templates/admin-message";
import { agencyPackageTemplate } from "./templates/agency-package";
import { proFeatureTemplate } from "./templates/pro-feature";
import { smartAlertTemplate } from "./templates/smart-alert";
import { ticketCreatedTemplate } from "./templates/ticket-created";
import { ticketReplyTemplate } from "./templates/ticket-reply";
import { ticketResolvedTemplate } from "./templates/ticket-resolved";
import { ticketEscalatedTemplate } from "./templates/ticket-escalated";
import { ticketFeedbackTemplate } from "./templates/ticket-feedback";

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

// ─── Email Verification ─────────────────────────────

export async function sendEmailVerificationEmail(email: string, verifyUrl: string) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: "GH7 — E-posta Doğrulama",
    html: emailVerificationTemplate(verifyUrl),
  });
}

export async function sendEmailVerificationCodeEmail(email: string, code: string) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: `GH7 — Doğrulama Kodu: ${code}`,
    html: emailVerificationCodeTemplate(code),
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

// ─── Smart Alert ───────────────────────────────────

export async function sendSmartAlertEmail(
  email: string,
  brandName: string,
  alertType: string,
  title: string,
  message: string
) {
  const subjectMap: Record<string, string> = {
    mention_lost: `Bahsedilme Kaybı — ${brandName}`,
    competitor_surge: `Rakip Yükselişi — ${brandName}`,
    score_drop_major: `Skor Düşüşü — ${brandName}`,
    new_competitor: `Yeni Rakip Keşfedildi — ${brandName}`,
  };
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: subjectMap[alertType] ?? `Dikkat — ${brandName}`,
    html: smartAlertTemplate(brandName, alertType, title, message),
  });
}

// ─── Weekly Report ──────────────────────────────────

export async function sendWeeklyReportEmail(
  email: string,
  brandName: string,
  data: WeeklyReportEmailData,
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: `Haftalik Rapor — ${brandName}`,
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

// ─── Pro Welcome ─────────────────────────────────────

export async function sendProWelcomeEmail(email: string, name?: string) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: "Pro Üyeliğiniz Aktif — Hoş Geldiniz 🎉",
    html: proWelcomeTemplate(name),
  });
}

// ─── Pro Upgrade (Upsell) ────────────────────────────

export async function sendProUpgradeEmail(
  email: string,
  brandName: string,
  score: number
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: `${brandName} için daha fazlasını keşfedin`,
    html: proUpgradeTemplate(brandName, score),
  });
}

// ─── Payment Success ─────────────────────────────────

export async function sendPaymentSuccessEmail(
  email: string,
  data: { planName: string; amount: string; period: string; nextBillingDate: string }
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: `Ödeme Başarılı — ${data.planName}`,
    html: paymentSuccessTemplate(data),
  });
}

// ─── Payment Failed ──────────────────────────────────

export async function sendPaymentFailedEmail(
  email: string,
  data: { planName: string; amount: string; retryDate?: string }
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: "Ödeme Başarısız — Ödeme yönteminizi güncelleyin",
    html: paymentFailedTemplate(data),
  });
}

// ─── Subscription Renewal ────────────────────────────

export async function sendSubscriptionRenewalEmail(
  email: string,
  data: { planName: string; amount: string; renewalDate: string }
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: `Abonelik Yenileme — ${data.renewalDate}`,
    html: subscriptionRenewalTemplate(data),
  });
}

// ─── Subscription Cancelled ──────────────────────────

export async function sendSubscriptionCancelledEmail(
  email: string,
  data: { planName: string; activeUntil: string }
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: `Aboneliğiniz İptal Edildi — ${data.planName}`,
    html: subscriptionCancelledTemplate(data),
  });
}

// ─── Account Deletion ────────────────────────────────

export async function sendAccountDeletionEmail(
  email: string,
  data: { deletionDate: string; confirmUrl: string }
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: "Hesap Silme Talebi — Onay Gerekli",
    html: accountDeletionTemplate(data),
  });
}

// ─── Password Reset ──────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: "GH7 — Şifre Sıfırlama",
    html: passwordResetTemplate(resetUrl),
  });
}

// ─── Admin Message ───────────────────────────────────

export async function sendAdminMessageEmail(
  email: string,
  data: { subject: string; message: string; ctaText?: string; ctaUrl?: string }
) {
  return getResend().emails.send({
    from: `GH7 Ekibi <${FROM}>`,
    to: email,
    subject: data.subject,
    html: adminMessageTemplate(data),
  });
}

// ─── Agency Package ──────────────────────────────────

export async function sendAgencyPackageEmail(
  email: string,
  data: { contactName?: string; brandCount?: number }
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: "Ajans Çözüm Paketi — Tüm Markalarınızı Tek Panelden Yönetin",
    html: agencyPackageTemplate(data),
  });
}

// ─── Pro Feature Announcement ────────────────────────

export async function sendProFeatureEmail(
  email: string,
  data: { featureTitle: string; featureDescription: string; ctaText?: string; ctaUrl?: string }
) {
  return getResend().emails.send({
    from: `GH7 <${FROM}>`,
    to: email,
    subject: `Yeni Özellik: ${data.featureTitle}`,
    html: proFeatureTemplate(data),
  });
}

// ─── Ticket Created ──────────────────────────────────

export async function sendTicketCreatedEmail(
  email: string,
  data: { ticketId: string; subject: string; message: string; category?: string }
) {
  return getResend().emails.send({
    from: `GH7 Destek <${FROM}>`,
    to: email,
    subject: `[#${data.ticketId}] ${data.subject}`,
    html: ticketCreatedTemplate(data),
  });
}

// ─── Ticket Reply ────────────────────────────────────

export async function sendTicketReplyEmail(
  email: string,
  data: { ticketId: string; subject: string; agentName: string; reply: string }
) {
  return getResend().emails.send({
    from: `GH7 Destek <${FROM}>`,
    to: email,
    subject: `Re: [#${data.ticketId}] ${data.subject}`,
    html: ticketReplyTemplate(data),
  });
}

// ─── Ticket Resolved ─────────────────────────────────

export async function sendTicketResolvedEmail(
  email: string,
  data: { ticketId: string; subject: string; resolution?: string }
) {
  return getResend().emails.send({
    from: `GH7 Destek <${FROM}>`,
    to: email,
    subject: `Çözüldü: [#${data.ticketId}] ${data.subject}`,
    html: ticketResolvedTemplate(data),
  });
}

// ─── Ticket Escalated ────────────────────────────────

export async function sendTicketEscalatedEmail(
  email: string,
  data: { ticketId: string; subject: string; reason?: string }
) {
  return getResend().emails.send({
    from: `GH7 Destek <${FROM}>`,
    to: email,
    subject: `Güncelleme: [#${data.ticketId}] ${data.subject}`,
    html: ticketEscalatedTemplate(data),
  });
}

// ─── Ticket Feedback ─────────────────────────────────

export async function sendTicketFeedbackEmail(
  email: string,
  data: { userName?: string }
) {
  return getResend().emails.send({
    from: `GH7 Destek <${FROM}>`,
    to: email,
    subject: "Destek Deneyiminizi Değerlendirin",
    html: ticketFeedbackTemplate(data),
  });
}
