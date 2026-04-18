export function emailVerificationTemplate(verifyUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GH7 — E-posta Doğrulama</title>
  </head>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:560px;margin:40px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="padding:32px 32px 0;">
        <div style="font-size:20px;font-weight:700;color:#111827;">GH7.ai</div>
        <h1 style="margin:24px 0 12px;font-size:22px;font-weight:600;color:#111827;line-height:1.3;">
          E-posta adresinizi doğrulayın
        </h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
          GH7.ai hesabınızı aktifleştirmek için e-posta adresinizi doğrulayın.
          Bu doğrulama, güvenliğiniz için gereklidir ve Pro üyelik başvurularında zorunludur.
        </p>
        <div style="margin:32px 0;text-align:center;">
          <a href="${verifyUrl}"
             style="display:inline-block;background:#111827;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
            E-postamı Doğrula →
          </a>
        </div>
        <p style="margin:24px 0 8px;font-size:13px;color:#6b7280;line-height:1.6;">
          Buton çalışmıyorsa bu bağlantıyı tarayıcınıza yapıştırın:
        </p>
        <p style="margin:0 0 24px;font-size:12px;color:#6b7280;word-break:break-all;">
          <a href="${verifyUrl}" style="color:#2563eb;">${verifyUrl}</a>
        </p>
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
            Bu bağlantı <strong>24 saat</strong> geçerlidir. Eğer bu e-postayı siz istemediyseniz,
            güvenle görmezden gelebilirsiniz — hesabınız bu linke tıklanmadan aktive olmaz.
          </p>
        </div>
      </div>
      <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          GH7.ai — Türkiye'nin ilk GEO platformu
        </p>
      </div>
    </div>
  </body>
</html>
  `.trim();
}
