import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function accountUpdateTemplate(changes: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Hesabınız Güncellendi
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.6;">
      GH7 hesabınızda aşağıdaki değişiklik yapılmıştır:
    </p>

    <div style="background-color:#f4f4f5;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#09090b;line-height:1.6;">
        ${changes}
      </p>
    </div>

    <p style="margin:0 0 20px;font-size:13px;color:#a1a1aa;line-height:1.6;">
      Bu değişikliği siz yapmadıysanız lütfen hemen hesabınıza giriş yapın
      ve güvenlik ayarlarınızı kontrol edin.
    </p>

    <a href="${APP_URL}/dashboard/studio" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
      Hesap Ayarları →
    </a>
  `;
  return emailLayout("Hesap Güncellendi", body);
}
