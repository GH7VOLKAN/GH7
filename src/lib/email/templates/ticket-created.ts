import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function ticketCreatedTemplate(data: {
  ticketId: string;
  subject: string;
  message: string;
  category?: string;
}): string {
  const categoryBadge = data.category
    ? `<span style="display:inline-block;background-color:#f4f4f5;color:#71717a;font-size:11px;font-weight:600;padding:2px 10px;border-radius:99px;margin-left:8px;">${data.category}</span>`
    : "";

  const body = `
    <div style="background-color:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.5px;">
        ✓ Destek Talebi Oluşturuldu
      </p>
    </div>

    <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      ${data.subject}
    </h1>
    <p style="margin:0 0 20px;font-size:12px;color:#a1a1aa;">
      Talep No: <strong style="color:#71717a;">#${data.ticketId}</strong>${categoryBadge}
    </p>

    <!-- Message Box -->
    <div style="background-color:#f4f4f5;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">
        Mesajınız
      </p>
      <p style="margin:0;font-size:14px;color:#09090b;line-height:1.6;">
        ${data.message}
      </p>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      Talebiniz ekibimize iletildi. En kısa sürede size dönüş yapacağız.
      Ortalama yanıt süremiz <strong style="color:#09090b;">24 saat</strong> içindedir.
    </p>

    <a href="${APP_URL}/dashboard/ayarlar" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Talebi Takip Et →
    </a>

    <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">
      Bu emaile yanıt vererek mesajınıza ekleme yapabilirsiniz.
    </p>
  `;
  return emailLayout("Destek Talebi #" + data.ticketId, body);
}
