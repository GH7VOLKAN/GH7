import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function proFeatureTemplate(data: {
  featureTitle: string;
  featureDescription: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const ctaUrl = data.ctaUrl || `${APP_URL}/dashboard/genel`;
  const ctaText = data.ctaText || "Hemen Deneyin";

  const body = `
    <div style="background-color:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.5px;">
        Pro'ya Özel — Yeni Özellik
      </p>
    </div>

    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      ${data.featureTitle}
    </h1>
    <div style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.8;">
      ${data.featureDescription}
    </div>

    <a href="${ctaUrl}" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      ${ctaText} →
    </a>

    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f4f4f5;">
      <p style="margin:0;font-size:12px;color:#a1a1aa;">
        Bu özellik Pro üyelere özeldir.
        Sorularınız ve önerileriniz için
        <a href="mailto:destek@gh7.ai" style="color:#09090b;text-decoration:underline;">destek@gh7.ai</a>
      </p>
    </div>
  `;
  return emailLayout(data.featureTitle, body);
}
