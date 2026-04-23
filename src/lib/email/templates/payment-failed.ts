import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function paymentFailedTemplate(data: {
  planName: string;
  amount: string;
  retryDate?: string;
}): string {
  const retryNote = data.retryDate
    ? `<strong style="color:#09090b;">${data.retryDate}</strong> tarihinde tekrar deneyeceğiz.`
    : "Lütfen ödeme yönteminizi güncelleyin.";

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Ödeme Başarısız
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      <strong style="color:#09090b;">${data.planName}</strong> planınız için
      <strong style="color:#09090b;">${data.amount}</strong> tutarındaki ödeme alınamadı.
    </p>

    <!-- Warning Box -->
    <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#dc2626;font-weight:600;">
        ⚠️ Ödeme yönteminizde bir sorun var
      </p>
      <p style="margin:8px 0 0;font-size:13px;color:#71717a;line-height:1.5;">
        Kartınızın süresi dolmuş veya bakiyeniz yetersiz olabilir.
        ${retryNote}
      </p>
    </div>

    <p style="margin:0 0 8px;font-size:14px;color:#71717a;line-height:1.6;">
      Ödeme yönteminizi güncellemezseniz Pro özellikleriniz askıya alınacaktır.
    </p>

    <p style="margin:0 0 20px;font-size:13px;color:#a1a1aa;line-height:1.5;">
      Verileriniz silinmez — ödeme düzeldikten sonra Pro'ya kaldığınız yerden devam edersiniz.
    </p>

    <a href="${APP_URL}/dashboard/studio" style="display:inline-block;background-color:#dc2626;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Ödeme Yöntemini Güncelle →
    </a>
  `;
  return emailLayout("Ödeme Başarısız", body);
}
