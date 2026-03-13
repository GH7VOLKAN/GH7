import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function subscriptionCancelledTemplate(data: {
  planName: string;
  activeUntil: string;
}): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Aboneliğiniz İptal Edildi
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      <strong style="color:#09090b;">${data.planName}</strong> planınız iptal edildi.
    </p>

    <!-- Info Box -->
    <div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#a16207;font-weight:600;">
        Pro özellikleriniz devam ediyor
      </p>
      <p style="margin:8px 0 0;font-size:13px;color:#71717a;line-height:1.5;">
        Mevcut dönem sonuna kadar (<strong style="color:#09090b;">${data.activeUntil}</strong>) tüm Pro özelliklerini kullanmaya devam edebilirsiniz.
        Bu tarihten sonra hesabınız ücretsiz plana geçecektir.
      </p>
    </div>

    <p style="margin:0 0 8px;font-size:14px;color:#71717a;line-height:1.6;font-weight:600;">
      Ücretsiz planda neler kaybedersiniz:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#71717a;">✕&nbsp; Sınırsız tarama → Ayda 1 tarama</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#71717a;">✕&nbsp; Rakip analizi kaldırılacak</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#71717a;">✕&nbsp; SMS bildirimleri devre dışı</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#71717a;">✕&nbsp; Haftalık raporlar durdurulacak</td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      Fikrinizi değiştirirseniz istediğiniz zaman yeniden abone olabilirsiniz.
      Verileriniz silinmez.
    </p>

    <a href="${APP_URL}/dashboard/ayarlar" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Tekrar Abone Ol →
    </a>
  `;
  return emailLayout("Abonelik İptal", body);
}
