import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function ticketResolvedTemplate(data: {
  ticketId: string;
  subject: string;
  resolution?: string;
}): string {
  const resolutionBlock = data.resolution
    ? `<div style="background-color:#f4f4f5;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">
          Çözüm
        </p>
        <p style="margin:0;font-size:14px;color:#09090b;line-height:1.6;">
          ${data.resolution}
        </p>
      </div>`
    : "";

  const body = `
    <div style="background-color:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.5px;">
        ✓ Talep Çözüldü
      </p>
    </div>

    <p style="margin:0 0 4px;font-size:12px;color:#a1a1aa;">
      Talep No: <strong style="color:#71717a;">#${data.ticketId}</strong>
    </p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      ${data.subject}
    </h1>

    ${resolutionBlock}

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      Destek talebiniz çözüldü olarak işaretlendi.
      Sorun devam ediyorsa bu emaile yanıt vererek talebi yeniden açabilirsiniz.
    </p>

    <!-- Satisfaction -->
    <div style="background-color:#f4f4f5;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#09090b;">
        Bu deneyimi nasıl değerlendirirsiniz?
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="padding:0 8px;">
            <a href="${APP_URL}/support/rate?ticket=${data.ticketId}&rating=good" style="text-decoration:none;font-size:28px;">😊</a>
          </td>
          <td style="padding:0 8px;">
            <a href="${APP_URL}/support/rate?ticket=${data.ticketId}&rating=neutral" style="text-decoration:none;font-size:28px;">😐</a>
          </td>
          <td style="padding:0 8px;">
            <a href="${APP_URL}/support/rate?ticket=${data.ticketId}&rating=bad" style="text-decoration:none;font-size:28px;">😞</a>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0;font-size:12px;color:#a1a1aa;">
      Sorularınız için <a href="mailto:destek@gh7.ai" style="color:#09090b;text-decoration:underline;">destek@gh7.ai</a>
    </p>
  `;
  return emailLayout("Çözüldü: " + data.subject, body);
}
