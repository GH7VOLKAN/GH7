import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function ticketEscalatedTemplate(data: {
  ticketId: string;
  subject: string;
  reason?: string;
}): string {
  const body = `
    <div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;font-weight:700;color:#a16207;text-transform:uppercase;letter-spacing:0.5px;">
        Talep Yükseltildi
      </p>
    </div>

    <p style="margin:0 0 4px;font-size:12px;color:#a1a1aa;">
      Talep No: <strong style="color:#71717a;">#${data.ticketId}</strong>
    </p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      ${data.subject}
    </h1>

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      Destek talebiniz daha hızlı çözüm için <strong style="color:#09090b;">kıdemli ekibimize</strong> yönlendirildi.
      ${data.reason ? `<br><br><strong style="color:#09090b;">Neden:</strong> ${data.reason}` : ""}
    </p>

    <div style="background-color:#f4f4f5;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#09090b;">
            ⏱&nbsp; Tahmini yanıt süresi: <strong>4-8 saat</strong>
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#09090b;">
            👤&nbsp; Öncelik seviyesi: <strong>Yüksek</strong>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      Herhangi bir ek bilgi paylaşmak isterseniz bu emaile yanıt verebilirsiniz.
    </p>

    <a href="${APP_URL}/dashboard/ayarlar" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Talebi Görüntüle →
    </a>
  `;
  return emailLayout("Yükseltildi: " + data.subject, body);
}
