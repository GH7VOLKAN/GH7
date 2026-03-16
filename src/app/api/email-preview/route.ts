/**
 * Email Template Preview API
 * DEV ONLY — sadece development ortamında çalışır
 *
 * Kullanım: /api/email-preview?template=otp
 */

import { NextRequest, NextResponse } from "next/server";
import { otpTemplate } from "@/lib/email/templates/otp";
import { welcomeTemplate } from "@/lib/email/templates/welcome";
import { scanCompleteTemplate } from "@/lib/email/templates/scan-complete";
import { scoreChangeTemplate } from "@/lib/email/templates/score-change";
import { weeklyReportTemplate } from "@/lib/email/templates/weekly-report";
import { accountUpdateTemplate } from "@/lib/email/templates/account-update";
import { proWelcomeTemplate } from "@/lib/email/templates/pro-welcome";
import { proUpgradeTemplate } from "@/lib/email/templates/pro-upgrade";
import { paymentSuccessTemplate } from "@/lib/email/templates/payment-success";
import { paymentFailedTemplate } from "@/lib/email/templates/payment-failed";
import { subscriptionRenewalTemplate } from "@/lib/email/templates/subscription-renewal";
import { subscriptionCancelledTemplate } from "@/lib/email/templates/subscription-cancelled";
import { accountDeletionTemplate } from "@/lib/email/templates/account-deletion";
import { passwordResetTemplate } from "@/lib/email/templates/password-reset";
import { adminMessageTemplate } from "@/lib/email/templates/admin-message";
import { agencyPackageTemplate } from "@/lib/email/templates/agency-package";
import { proFeatureTemplate } from "@/lib/email/templates/pro-feature";
import { ticketCreatedTemplate } from "@/lib/email/templates/ticket-created";
import { ticketReplyTemplate } from "@/lib/email/templates/ticket-reply";
import { ticketResolvedTemplate } from "@/lib/email/templates/ticket-resolved";
import { ticketEscalatedTemplate } from "@/lib/email/templates/ticket-escalated";
import { ticketFeedbackTemplate } from "@/lib/email/templates/ticket-feedback";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

const TEMPLATES: Record<string, () => string> = {
  // ── Auth ──
  otp: () => otpTemplate("847291"),
  welcome: () => welcomeTemplate("Volkan"),
  "password-reset": () => passwordResetTemplate(`${APP_URL}/auth/reset?token=abc123`),

  // ── Tarama & Skor ──
  "scan-complete": () => scanCompleteTemplate("GH7", 78),
  "score-change": () => scoreChangeTemplate("GH7", 62, 78),
  "weekly-report": () =>
    weeklyReportTemplate("GH7", { score: 78, change: 5, topPlatform: "ChatGPT" }),

  // ── Hesap ──
  "account-update": () => accountUpdateTemplate("E-posta adresiniz güncellendi."),
  "account-deletion": () =>
    accountDeletionTemplate({
      deletionDate: "27 Mart 2026",
      confirmUrl: `${APP_URL}/account/cancel-deletion?token=abc123`,
    }),

  // ── Pro Üyelik ──
  "pro-welcome": () => proWelcomeTemplate("Volkan"),
  "pro-upgrade": () => proUpgradeTemplate("GH7", 45),
  "pro-feature": () =>
    proFeatureTemplate({
      featureTitle: "Rakip Karşılaştırma Raporu",
      featureDescription:
        "Artık rakiplerinizin yapay zeka görünürlüğünü sizinkiyle yan yana karşılaştırabilirsiniz. Her platform için detaylı analiz ve aksiyon önerileri alın.",
    }),

  // ── Ödeme ──
  "payment-success": () =>
    paymentSuccessTemplate({
      planName: "Pro Aylık",
      amount: "₺499",
      period: "Aylık",
      nextBillingDate: "13 Nisan 2026",
    }),
  "payment-failed": () =>
    paymentFailedTemplate({
      planName: "Pro Aylık",
      amount: "₺499",
      retryDate: "16 Mart 2026",
    }),

  // ── Abonelik ──
  "subscription-renewal": () =>
    subscriptionRenewalTemplate({
      planName: "Pro Aylık",
      amount: "₺499",
      renewalDate: "13 Nisan 2026",
    }),
  "subscription-cancelled": () =>
    subscriptionCancelledTemplate({
      planName: "Pro Aylık",
      activeUntil: "13 Nisan 2026",
    }),

  // ── Admin & Ajans ──
  "admin-message": () =>
    adminMessageTemplate({
      subject: "Yeni Özellik: Prompt Kütüphanesi",
      message:
        "Merhaba,<br><br>Yapay zekaların sizi daha iyi tanıması için kullanabileceğiniz hazır prompt şablonlarını yayınladık. Prompt Kütüphanesi ile ChatGPT, Gemini, Claude ve Perplexity'de kullanabileceğiniz onlarca hazır komut sizi bekliyor.<br><br>GH7 Ekibi",
      ctaText: "Prompt Kütüphanesini Keşfet",
      ctaUrl: `${APP_URL}/dashboard/promptlar`,
    }),
  "agency-package": () =>
    agencyPackageTemplate({ contactName: "Volkan", brandCount: 3 }),

  // ── Destek / Ticket ──
  "ticket-created": () =>
    ticketCreatedTemplate({
      ticketId: "GH7-1042",
      subject: "Tarama sonuçları yüklenmiyor",
      message: "Dashboard'da tarama başlattım ama sonuçlar 30 dakikadır yüklenmiyor. Sayfa yenilemek de işe yaramadı.",
      category: "Teknik Sorun",
    }),
  "ticket-reply": () =>
    ticketReplyTemplate({
      ticketId: "GH7-1042",
      subject: "Tarama sonuçları yüklenmiyor",
      agentName: "Elif",
      reply: "Merhaba,<br><br>Tarama sistemimizdeki geçici bir yoğunluktan dolayı gecikme yaşandığını tespit ettik. Sorunu çözdük ve taramanızı yeniden başlattık.<br><br>Sonuçlarınız birkaç dakika içinde görünecektir. Sorun devam ederse lütfen bize bildirin.",
    }),
  "ticket-resolved": () =>
    ticketResolvedTemplate({
      ticketId: "GH7-1042",
      subject: "Tarama sonuçları yüklenmiyor",
      resolution: "Sunucu tarafındaki kuyruk yoğunluğu giderildi. Tarama yeniden çalıştırıldı ve sonuçlar başarıyla yüklendi.",
    }),
  "ticket-escalated": () =>
    ticketEscalatedTemplate({
      ticketId: "GH7-1042",
      subject: "Tarama sonuçları yüklenmiyor",
      reason: "48 saat içinde çözüme ulaşılamadı",
    }),
  "ticket-feedback": () =>
    ticketFeedbackTemplate({ userName: "Volkan" }),
};

// Template categories for the list page
const CATEGORIES = [
  {
    title: "Kimlik Doğrulama",
    badge: "Auth",
    badgeColor: "#22c55e",
    items: [
      { key: "otp", title: "OTP Giriş Kodu", desc: "6 haneli doğrulama kodu — giriş sırasında gönderilir" },
      { key: "welcome", title: "Hoş Geldiniz", desc: "İlk kayıt sonrası gönderilen karşılama emaili" },
      { key: "password-reset", title: "Şifre Sıfırlama", desc: "Şifre sıfırlama bağlantısı" },
    ],
  },
  {
    title: "Tarama & Skor",
    badge: "Bildirim",
    badgeColor: "#3b82f6",
    items: [
      { key: "scan-complete", title: "Tarama Tamamlandı", desc: "Yapay zeka taraması bittiğinde skor ile bildirim" },
      { key: "score-change", title: "Skor Değişimi", desc: "Puan yükseldiğinde veya düştüğünde bildirim" },
      { key: "weekly-report", title: "Haftalık Rapor", desc: "Haftanın özeti — puan, değişim, en iyi platform" },
    ],
  },
  {
    title: "Hesap Yönetimi",
    badge: "Hesap",
    badgeColor: "#f59e0b",
    items: [
      { key: "account-update", title: "Hesap Güncelleme", desc: "Hesap bilgileri değiştiğinde güvenlik bildirimi" },
      { key: "account-deletion", title: "Hesap Silme", desc: "Hesap silme onayı — geri alınamaz uyarısı" },
    ],
  },
  {
    title: "Pro Üyelik",
    badge: "Pro",
    badgeColor: "#8b5cf6",
    items: [
      { key: "pro-welcome", title: "Pro Hoş Geldiniz", desc: "Pro üyelik aktif — özellik listesi" },
      { key: "pro-upgrade", title: "Pro'ya Geçiş", desc: "Ücretsiz kullanıcılara Pro upsell" },
      { key: "pro-feature", title: "Pro Özellik Duyurusu", desc: "Pro'lara özel yeni özellik bildirimi" },
    ],
  },
  {
    title: "Ödeme",
    badge: "Ödeme",
    badgeColor: "#ec4899",
    items: [
      { key: "payment-success", title: "Ödeme Başarılı", desc: "Ödeme alındı — fatura detayları" },
      { key: "payment-failed", title: "Ödeme Başarısız", desc: "Kart sorunu — güncelleme uyarısı" },
    ],
  },
  {
    title: "Abonelik",
    badge: "Abonelik",
    badgeColor: "#06b6d4",
    items: [
      { key: "subscription-renewal", title: "Yenileme Hatırlatması", desc: "Abonelik yenileme tarihi yaklaşıyor" },
      { key: "subscription-cancelled", title: "Abonelik İptal", desc: "Abonelik iptal edildi — kalan süre bilgisi" },
    ],
  },
  {
    title: "Admin & Ajans",
    badge: "Özel",
    badgeColor: "#f97316",
    items: [
      { key: "admin-message", title: "Admin Mesajı", desc: "GH7 ekibinden özel mesaj — duyuru, güncelleme" },
      { key: "agency-package", title: "Ajans Çözüm Paketi", desc: "Çoklu marka yönetimi — ajans tanıtım emaili" },
    ],
  },
  {
    title: "Destek & Ticket",
    badge: "Destek",
    badgeColor: "#10b981",
    items: [
      { key: "ticket-created", title: "Talep Oluşturuldu", desc: "Yeni destek talebi onayı" },
      { key: "ticket-reply", title: "Destek Yanıtı", desc: "Ekipten gelen yanıt bildirimi" },
      { key: "ticket-resolved", title: "Talep Çözüldü", desc: "Çözüm notu + memnuniyet anketi" },
      { key: "ticket-escalated", title: "Talep Yükseltildi", desc: "Kıdemli ekibe yönlendirme bildirimi" },
      { key: "ticket-feedback", title: "Destek Değerlendirmesi", desc: "Deneyim puanlama anketi" },
    ],
  },
];

export async function GET(req: NextRequest) {
  // Dev-only guard
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const template = req.nextUrl.searchParams.get("template");

  // Template listesi sayfası
  if (!template) {
    const categoriesHtml = CATEGORIES.map(
      (cat) => `
      <div style="margin-bottom:32px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <h2 style="font-size:16px;font-weight:700;color:#fafafa;margin:0;">${cat.title}</h2>
          <span style="display:inline-block;background:${cat.badgeColor}20;color:${cat.badgeColor};font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;text-transform:uppercase;letter-spacing:0.5px;">${cat.badge}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${cat.items
            .map(
              (item) => `
            <a class="card" href="?template=${item.key}">
              <div class="card-left">
                <div class="card-title">${item.title}</div>
                <div class="card-desc">${item.desc}</div>
              </div>
              <span class="arrow">→</span>
            </a>`
            )
            .join("")}
        </div>
      </div>`
    ).join("");

    const listHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GH7 Email Templates</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #fafafa; min-height: 100vh; }
    .container { max-width: 720px; margin: 0 auto; padding: 48px 24px; }
    h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
    .subtitle { font-size: 14px; color: #71717a; margin-bottom: 8px; }
    .count { font-size: 12px; color: #52525b; margin-bottom: 40px; }
    a.card {
      display: flex; align-items: center; justify-content: space-between;
      background: #18181b; border: 1px solid #27272a; border-radius: 12px;
      padding: 16px 20px; text-decoration: none; color: #fafafa;
      transition: all 0.15s ease;
    }
    a.card:hover { background: #27272a; border-color: #3f3f46; }
    .card-left { display: flex; flex-direction: column; gap: 3px; }
    .card-title { font-size: 14px; font-weight: 600; }
    .card-desc { font-size: 11px; color: #71717a; }
    .arrow { color: #52525b; font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📧 Email Şablonları</h1>
    <p class="subtitle">Tüm GH7 email şablonlarını önizleyin.</p>
    <p class="count">${Object.keys(TEMPLATES).length} şablon · Tıklayarak tarayıcıda açın</p>
    ${categoriesHtml}
  </div>
</body>
</html>`;
    return new NextResponse(listHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const renderFn = TEMPLATES[template];
  if (!renderFn) {
    return NextResponse.json(
      { error: `Unknown template: ${template}. Available: ${Object.keys(TEMPLATES).join(", ")}` },
      { status: 400 }
    );
  }

  const html = renderFn();

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
