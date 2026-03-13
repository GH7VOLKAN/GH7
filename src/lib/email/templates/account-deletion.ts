import { emailLayout } from "./layout";

export function accountDeletionTemplate(data: {
  deletionDate: string;
  confirmUrl: string;
}): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Hesap Silme Talebi
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      GH7 hesabınızı silme talebinde bulundunuz.
    </p>

    <!-- Warning Box -->
    <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#dc2626;font-weight:600;">
        ⚠️ Bu işlem geri alınamaz
      </p>
      <p style="margin:8px 0 0;font-size:13px;color:#71717a;line-height:1.5;">
        Hesabınız <strong style="color:#09090b;">${data.deletionDate}</strong> tarihinde kalıcı olarak silinecektir.
        Tüm verileriniz, tarama geçmişiniz ve raporlarınız kaldırılacaktır.
      </p>
    </div>

    <p style="margin:0 0 8px;font-size:14px;color:#71717a;line-height:1.6;font-weight:600;">
      Silinecek veriler:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#71717a;">• Tüm marka ve tarama verileri</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#71717a;">• Aksiyon planları ve geçmiş raporlar</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#71717a;">• Bildirim tercihleri ve ayarlar</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#71717a;">• Aktif abonelik (varsa iptal edilir)</td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      Eğer bu talebi siz yapmadıysanız veya fikrinizi değiştirdiyseniz,
      aşağıdaki butona tıklayarak silme işlemini iptal edebilirsiniz.
    </p>

    <a href="${data.confirmUrl}" style="display:inline-block;background-color:#dc2626;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Silme İşlemini İptal Et →
    </a>

    <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">
      ${data.deletionDate} tarihine kadar işlem yapmazsanız hesabınız otomatik olarak silinecektir.
    </p>
  `;
  return emailLayout("Hesap Silme", body);
}
