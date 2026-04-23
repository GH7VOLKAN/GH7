import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function scanCompleteTemplate(
  brandName: string,
  score: number
): string {
  const scoreColor = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Tarama Tamamlandı
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      <strong style="color:#09090b;">${brandName}</strong> için yapay zeka taraması tamamlandı.
    </p>

    <!-- Score Box -->
    <div style="background-color:#f4f4f5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">
        Görünürlük Puanı
      </p>
      <p style="margin:0;font-size:48px;font-weight:800;color:${scoreColor};letter-spacing:-2px;">
        ${score}
      </p>
      <p style="margin:4px 0 0;font-size:12px;color:#a1a1aa;">/100</p>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      5 yapay zeka sizi taradı. Sonuçlarınızı ve ne yapmanız gerektiğini
      kontrol panelinde görebilirsiniz.
    </p>

    <a href="${APP_URL}/dashboard" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Sonuçları Gör →
    </a>
  `;
  return emailLayout("Tarama Tamamlandı", body);
}
