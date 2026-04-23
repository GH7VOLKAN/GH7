import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function paymentSuccessTemplate(data: {
  planName: string;
  amount: string;
  period: string;
  nextBillingDate: string;
}): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Ödeme Başarılı
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      Ödemeniz başarıyla alındı. İşte detaylar:
    </p>

    <!-- Receipt Box -->
    <div style="background-color:#f4f4f5;border-radius:12px;padding:20px;margin-bottom:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">
            <span style="font-size:12px;color:#a1a1aa;">Plan</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right;">
            <span style="font-size:13px;font-weight:700;color:#09090b;">${data.planName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">
            <span style="font-size:12px;color:#a1a1aa;">Tutar</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right;">
            <span style="font-size:13px;font-weight:700;color:#09090b;">${data.amount}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">
            <span style="font-size:12px;color:#a1a1aa;">Dönem</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right;">
            <span style="font-size:13px;font-weight:700;color:#09090b;">${data.period}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <span style="font-size:12px;color:#a1a1aa;">Sonraki Ödeme</span>
          </td>
          <td style="padding:8px 0;text-align:right;">
            <span style="font-size:13px;font-weight:700;color:#09090b;">${data.nextBillingDate}</span>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      Faturanız hesap ayarlarınızdan indirilebilir.
    </p>

    <a href="${APP_URL}/dashboard/studio" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Hesap Ayarları →
    </a>
  `;
  return emailLayout("Ödeme Başarılı", body);
}
