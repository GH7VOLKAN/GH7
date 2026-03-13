import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function agencyPackageTemplate(data: {
  contactName?: string;
  brandCount?: number;
}): string {
  const greeting = data.contactName ? `Merhaba ${data.contactName},` : "Merhaba,";
  const brandNote = data.brandCount
    ? `Şu anda <strong style="color:#09090b;">${data.brandCount} marka</strong> yönetiyorsunuz.`
    : "Birden fazla marka yönetiyorsanız bu paket tam size göre.";

  const body = `
    <div style="background-color:#f5f3ff;border:1px solid #c4b5fd;border-radius:12px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px;">
        Ajans Çözüm Paketi
      </p>
    </div>

    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Tüm Markalarınızı Tek Panelden Yönetin
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      ${greeting} ${brandNote}
      Ajans paketi ile tüm müşterilerinizin yapay zeka görünürlüğünü tek noktadan takip edin.
    </p>

    <!-- Agency Features -->
    <div style="background-color:#f4f4f5;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">
        Ajans Paketine Özel
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#09090b;font-weight:600;">
            ✦&nbsp; 10+ marka tek panelde
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#09090b;font-weight:600;">
            ✦&nbsp; Müşteri bazlı raporlama
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#09090b;font-weight:600;">
            ✦&nbsp; Toplu tarama ve karşılaştırma
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#09090b;font-weight:600;">
            ✦&nbsp; White-label PDF raporları
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#09090b;font-weight:600;">
            ✦&nbsp; Öncelikli destek + özel hesap yöneticisi
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#09090b;font-weight:600;">
            ✦&nbsp; API erişimi
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      Ajans paketimiz hakkında detaylı bilgi almak ve
      size özel fiyatlandırma için ekibimizle görüşün.
    </p>

    <a href="mailto:ajans@gh7.ai?subject=Ajans%20Paketi%20Bilgi%20Talebi" style="display:inline-block;background-color:#7c3aed;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Bizimle İletişime Geçin →
    </a>

    <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">
      veya
      <a href="${APP_URL}" style="color:#7c3aed;text-decoration:underline;">app.gh7.ai</a>
      üzerinden demo talep edin.
    </p>
  `;
  return emailLayout("Ajans Çözüm Paketi", body);
}
