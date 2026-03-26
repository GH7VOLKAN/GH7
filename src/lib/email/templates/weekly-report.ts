import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export interface WeeklyReportEmailData {
  score: number;
  change: number;
  topPlatform: string;
  highlights?: string[];
  nextActions?: string[];
}

export function weeklyReportTemplate(
  brandName: string,
  data: WeeklyReportEmailData,
): string {
  const changeColor = data.change >= 0 ? "#22c55e" : "#ef4444";
  const changeSign = data.change >= 0 ? "+" : "";

  // Build highlights section
  const highlightItems = (data.highlights ?? []).slice(0, 3);
  const highlightsHtml =
    highlightItems.length > 0
      ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px;background-color:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#16a34a;">Bu Haftanin Ozetleri</p>
          ${highlightItems.map((h) => `<p style="margin:4px 0;font-size:14px;color:#374151;line-height:1.5;">&#8226; ${h}</p>`).join("")}
        </td>
      </tr>
    </table>`
      : "";

  // Build next actions section
  const actionItems = (data.nextActions ?? []).slice(0, 3);
  const actionsHtml =
    actionItems.length > 0
      ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px;background-color:#fefce8;border-radius:12px;border:1px solid #fde68a;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#ca8a04;">Onerilen Aksiyonlar</p>
          ${actionItems.map((a) => `<p style="margin:4px 0;font-size:14px;color:#374151;line-height:1.5;">&#8226; ${a}</p>`).join("")}
        </td>
      </tr>
    </table>`
      : "";

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Haftalik Rapor
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      <strong style="color:#09090b;">${brandName}</strong> icin bu haftanin ozeti.
    </p>

    <!-- Stats Grid -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px;background-color:#f4f4f5;border-radius:12px 0 0 12px;text-align:center;width:33%;">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">Puan</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:#09090b;">${data.score}</p>
        </td>
        <td style="padding:16px;background-color:#f4f4f5;text-align:center;width:33%;">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">Degisim</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:${changeColor};">${changeSign}${data.change}</p>
        </td>
        <td style="padding:16px;background-color:#f4f4f5;border-radius:0 12px 12px 0;text-align:center;width:34%;">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">En Iyi</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#09090b;">${data.topPlatform}</p>
        </td>
      </tr>
    </table>

    ${highlightsHtml}
    ${actionsHtml}

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      Yapay zekalarin sizi ne kadar tanidigini haftalik olarak takip ediyoruz.
      Detayli raporu ve yapilacaklar listesini kontrol panelinde gorebilirsiniz.
    </p>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${APP_URL}/panel/genel-bakis" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;">
            Dashboard'a Git &rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Unsubscribe -->
    <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa;text-align:center;line-height:1.5;">
      Haftalik raporlari almak istemiyorsaniz
      <a href="${APP_URL}/panel/ayarlar?tab=bildirimler" style="color:#71717a;text-decoration:underline;">bildirim ayarlarindan</a>
      kapatabilirsiniz.
    </p>
  `;
  return emailLayout("Haftalik Rapor", body);
}
