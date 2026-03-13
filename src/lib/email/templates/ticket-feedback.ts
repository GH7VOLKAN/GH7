import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function ticketFeedbackTemplate(data: {
  userName?: string;
}): string {
  const greeting = data.userName ? `Merhaba ${data.userName},` : "Merhaba,";

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Deneyiminiz Bizim İçin Önemli
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      ${greeting} Son destek deneyiminizi değerlendirmenizi rica ediyoruz.
      Geri bildiriminiz hizmet kalitemizi artırmamıza yardımcı olur.
    </p>

    <!-- Rating Options -->
    <div style="background-color:#f4f4f5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#09090b;">
        Destek ekibimizi nasıl değerlendirirsiniz?
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="padding:0 6px;text-align:center;">
            <a href="${APP_URL}/support/feedback?rating=5" style="text-decoration:none;">
              <div style="font-size:32px;margin-bottom:4px;">⭐</div>
              <div style="font-size:10px;color:#71717a;">Mükemmel</div>
            </a>
          </td>
          <td style="padding:0 6px;text-align:center;">
            <a href="${APP_URL}/support/feedback?rating=4" style="text-decoration:none;">
              <div style="font-size:32px;margin-bottom:4px;">😊</div>
              <div style="font-size:10px;color:#71717a;">İyi</div>
            </a>
          </td>
          <td style="padding:0 6px;text-align:center;">
            <a href="${APP_URL}/support/feedback?rating=3" style="text-decoration:none;">
              <div style="font-size:32px;margin-bottom:4px;">😐</div>
              <div style="font-size:10px;color:#71717a;">Orta</div>
            </a>
          </td>
          <td style="padding:0 6px;text-align:center;">
            <a href="${APP_URL}/support/feedback?rating=2" style="text-decoration:none;">
              <div style="font-size:32px;margin-bottom:4px;">😕</div>
              <div style="font-size:10px;color:#71717a;">Kötü</div>
            </a>
          </td>
          <td style="padding:0 6px;text-align:center;">
            <a href="${APP_URL}/support/feedback?rating=1" style="text-decoration:none;">
              <div style="font-size:32px;margin-bottom:4px;">😞</div>
              <div style="font-size:10px;color:#71717a;">Çok Kötü</div>
            </a>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5;">
      Tek tıkla değerlendirme yapabilirsiniz.
      Detaylı geri bildirim için <a href="mailto:destek@gh7.ai" style="color:#09090b;text-decoration:underline;">destek@gh7.ai</a> adresine yazabilirsiniz.
    </p>
  `;
  return emailLayout("Destek Değerlendirmesi", body);
}
