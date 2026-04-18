export function emailVerificationCodeTemplate(code: string): string {
  return `
<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GH7 — E-posta Doğrulama Kodu</title>
  </head>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:560px;margin:40px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="padding:32px;">
        <div style="font-size:20px;font-weight:700;color:#111827;">GH7.ai</div>
        <h1 style="margin:24px 0 12px;font-size:22px;font-weight:600;color:#111827;line-height:1.3;">
          E-posta doğrulama kodunuz
        </h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
          Dashboard'a dönüp aşağıdaki 6 haneli kodu girin.
        </p>

        <div style="margin:32px 0;padding:24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;text-align:center;">
          <div style="font-family:'SF Mono',Monaco,Menlo,Consolas,monospace;font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;">
            ${code}
          </div>
        </div>

        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
          Bu kod <strong>10 dakika</strong> geçerlidir. Eğer bu kodu siz istemediyseniz,
          güvenle görmezden gelebilirsiniz — kod kullanılmadığı sürece hesabınız etkilenmez.
        </p>
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
