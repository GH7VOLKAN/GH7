import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

const ALERT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  mention_lost: { icon: "⚠️", color: "#f97316", label: "Bahsedilme Kaybı" },
  competitor_surge: { icon: "📈", color: "#ef4444", label: "Rakip Yükselişi" },
  score_drop_major: { icon: "📉", color: "#ef4444", label: "Skor Düşüşü" },
  new_competitor: { icon: "🔍", color: "#3b82f6", label: "Yeni Rakip" },
};

export function smartAlertTemplate(
  brandName: string,
  alertType: string,
  title: string,
  message: string
): string {
  const config = ALERT_CONFIG[alertType] ?? {
    icon: "🔔",
    color: "#71717a",
    label: "Bildirim",
  };

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      ${config.icon} ${title}
    </h1>
    <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:${config.color};">
      ${config.label}
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      <strong style="color:#09090b;">${brandName}</strong> markanız ile ilgili dikkat edilmesi gereken bir gelişme var.
    </p>

    <!-- Alert Details -->
    <div style="background-color:#fefce8;border-left:4px solid ${config.color};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#09090b;line-height:1.7;white-space:pre-line;">
        ${message.replace(/\n/g, "<br/>")}
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${APP_URL}/panel/genel" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;">
        Paneli Kontrol Et &rarr;
      </a>
    </div>

    <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
      Bu bildirim GH7 akıllı alarm sistemi tarafından gönderildi.
    </p>
  `;

  return emailLayout(title, body);
}
