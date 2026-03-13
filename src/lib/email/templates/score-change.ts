import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function scoreChangeTemplate(
  brandName: string,
  oldScore: number,
  newScore: number
): string {
  const isUp = newScore > oldScore;
  const diff = Math.abs(newScore - oldScore);
  const arrow = isUp ? "↑" : "↓";
  const directionText = isUp ? "yükseldi" : "düştü";
  const diffColor = isUp ? "#22c55e" : "#ef4444";

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Skorunuz ${directionText}
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      <strong style="color:#09090b;">${brandName}</strong> için yapay zeka görünürlük puanınız değişti.
    </p>

    <!-- Score Change Box -->
    <div style="background-color:#f4f4f5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align:center;width:40%;">
            <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">Önceki</p>
            <p style="margin:4px 0 0;font-size:32px;font-weight:800;color:#a1a1aa;">${oldScore}</p>
          </td>
          <td style="text-align:center;width:20%;">
            <p style="margin:0;font-size:24px;color:${diffColor};font-weight:700;">${arrow}</p>
            <p style="margin:0;font-size:14px;font-weight:700;color:${diffColor};">${isUp ? "+" : "-"}${diff}</p>
          </td>
          <td style="text-align:center;width:40%;">
            <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">Şimdi</p>
            <p style="margin:4px 0 0;font-size:32px;font-weight:800;color:#09090b;">${newScore}</p>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      ${isUp
        ? "Tebrikler! Yapay zekalarda görünürlüğünüz artıyor. Detayları kontrol panelinde inceleyebilirsiniz."
        : "Görünürlüğünüzde düşüş tespit ettik. Yapılacaklar listesini kontrol etmenizi öneririz."
      }
    </p>

    <a href="${APP_URL}/dashboard/genel" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Detayları Gör →
    </a>
  `;
  return emailLayout("Skor Değişimi", body);
}
