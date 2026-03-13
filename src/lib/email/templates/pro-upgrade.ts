import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function proUpgradeTemplate(
  brandName: string,
  score: number
): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Daha fazlasını keşfedin
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      <strong style="color:#09090b;">${brandName}</strong> için mevcut puanınız
      <strong style="color:#09090b;">${score}/100</strong>.
      Pro ile bu skoru nasıl artıracağınızı öğrenin.
    </p>

    <!-- Comparison Box -->
    <div style="background-color:#f4f4f5;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">
        Ücretsiz planınız
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#71717a;">✕&nbsp; Ayda 1 tarama</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#71717a;">✕&nbsp; Temel aksiyon önerileri</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#71717a;">✕&nbsp; Rakip analizi yok</td>
        </tr>
      </table>
    </div>

    <div style="background-color:#09090b;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">
        Pro ile
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#ffffff;">✓&nbsp; Sınırsız tarama</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#ffffff;">✓&nbsp; Detaylı aksiyon planı</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#ffffff;">✓&nbsp; Rakip karşılaştırma</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#ffffff;">✓&nbsp; SMS + haftalık rapor</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#ffffff;">✓&nbsp; Öncelikli destek</td>
        </tr>
      </table>
    </div>

    <a href="${APP_URL}/dashboard/ayarlar" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Pro'ya Geç →
    </a>

    <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">
      7 gün içinde memnun kalmazsanız iade garantisi.
    </p>
  `;
  return emailLayout("Pro'ya Geçin", body);
}
