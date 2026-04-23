import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function ticketReplyTemplate(data: {
  ticketId: string;
  subject: string;
  agentName: string;
  reply: string;
}): string {
  const body = `
    <p style="margin:0 0 4px;font-size:12px;color:#a1a1aa;">
      Talep No: <strong style="color:#71717a;">#${data.ticketId}</strong>
    </p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      ${data.subject}
    </h1>

    <!-- Reply Box -->
    <div style="border-left:3px solid #09090b;padding:0 0 0 16px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:12px;color:#a1a1aa;">
        <strong style="color:#09090b;">${data.agentName}</strong> · GH7 Destek
      </p>
      <div style="font-size:14px;color:#3f3f46;line-height:1.8;">
        ${data.reply}
      </div>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      Bu emaile yanıt vererek cevap yazabilirsiniz.
    </p>

    <a href="${APP_URL}/dashboard/studio" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Talebi Görüntüle →
    </a>
  `;
  return emailLayout("Yanıt: " + data.subject, body);
}
