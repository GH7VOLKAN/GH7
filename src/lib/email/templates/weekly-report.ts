import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function weeklyReportTemplate(
  brandName: string,
  data: { score: number; change: number; topPlatform: string }
): string {
  const changeColor = data.change >= 0 ? "#22c55e" : "#ef4444";
  const changeSign = data.change >= 0 ? "+" : "";

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Haftalık Rapor
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      <strong style="color:#09090b;">${brandName}</strong> için bu haftanın özeti.
    </p>

    <!-- Stats Grid -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px;background-color:#f4f4f5;border-radius:12px 0 0 12px;text-align:center;width:33%;">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">Puan</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:#09090b;">${data.score}</p>
        </td>
        <td style="padding:16px;background-color:#f4f4f5;text-align:center;width:33%;">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">Değişim</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:${changeColor};">${changeSign}${data.change}</p>
        </td>
        <td style="padding:16px;background-color:#f4f4f5;border-radius:0 12px 12px 0;text-align:center;width:34%;">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">En İyi</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#09090b;">${data.topPlatform}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      Yapay zekaların sizi ne kadar tanıdığını haftalık olarak takip ediyoruz.
      Detaylı raporu ve yapılacaklar listesini kontrol panelinde görebilirsiniz.
    </p>

    <a href="${APP_URL}/dashboard/genel" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Raporu İncele →
    </a>
  `;
  return emailLayout("Haftalık Rapor", body);
}
