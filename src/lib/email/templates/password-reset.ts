import { emailLayout } from "./layout";

export function passwordResetTemplate(resetUrl: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Şifre Sıfırlama
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      GH7 hesabınız için şifre sıfırlama talebi aldık.
      Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
    </p>

    <a href="${resetUrl}" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;margin-bottom:24px;">
      Şifremi Sıfırla →
    </a>

    <div style="margin-top:24px;background-color:#f4f4f5;border-radius:12px;padding:16px 20px;">
      <p style="margin:0 0 4px;font-size:13px;color:#a1a1aa;">
        Bu bağlantı <strong style="color:#71717a;">30 dakika</strong> içinde geçerliliğini yitirecektir.
      </p>
      <p style="margin:0;font-size:13px;color:#a1a1aa;">
        Bu işlemi siz başlatmadıysanız bu e-postayı görmezden gelebilirsiniz.
        Hesabınız güvendedir.
      </p>
    </div>
  `;
  return emailLayout("Şifre Sıfırlama", body);
}
