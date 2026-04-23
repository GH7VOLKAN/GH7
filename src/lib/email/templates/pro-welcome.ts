import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function proWelcomeTemplate(name?: string): string {
  const greeting = name ? `${name}, tebrikler!` : "Tebrikler!";

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Pro Üyeliğiniz Aktif 🎉
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      ${greeting} Artık GH7 Pro'nun tüm özelliklerine erişebilirsiniz.
    </p>

    <!-- Pro Features -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f4f4f5;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:28px;height:28px;background-color:#09090b;border-radius:50%;text-align:center;vertical-align:middle;font-size:12px;color:#ffffff;">✓</td>
              <td style="padding-left:12px;font-size:13px;color:#09090b;font-weight:600;">Sınırsız AI taraması</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f4f4f5;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:28px;height:28px;background-color:#09090b;border-radius:50%;text-align:center;vertical-align:middle;font-size:12px;color:#ffffff;">✓</td>
              <td style="padding-left:12px;font-size:13px;color:#09090b;font-weight:600;">Rakip analizi ve karşılaştırma</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f4f4f5;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:28px;height:28px;background-color:#09090b;border-radius:50%;text-align:center;vertical-align:middle;font-size:12px;color:#ffffff;">✓</td>
              <td style="padding-left:12px;font-size:13px;color:#09090b;font-weight:600;">SMS bildirimleri</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f4f4f5;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:28px;height:28px;background-color:#09090b;border-radius:50%;text-align:center;vertical-align:middle;font-size:12px;color:#ffffff;">✓</td>
              <td style="padding-left:12px;font-size:13px;color:#09090b;font-weight:600;">Haftalık detaylı raporlar</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:28px;height:28px;background-color:#09090b;border-radius:50%;text-align:center;vertical-align:middle;font-size:12px;color:#ffffff;">✓</td>
              <td style="padding-left:12px;font-size:13px;color:#09090b;font-weight:600;">Öncelikli destek</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      İlk adım olarak tam bir tarama başlatmanızı öneririz.
      Yapay zekaların sizi ne kadar tanıdığını keşfedin.
    </p>

    <a href="${APP_URL}/dashboard" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Tarama Başlat →
    </a>
  `;
  return emailLayout("Pro Üyelik Aktif", body);
}
