import { emailLayout } from "./layout";

export function otpTemplate(code: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">
      Giriş Kodunuz
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      GH7 hesabınıza giriş yapmak için aşağıdaki 6 haneli kodu kullanın.
    </p>

    <!-- OTP Code Box -->
    <div style="background-color:#f4f4f5;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#09090b;font-family:'Courier New',monospace;">
        ${code}
      </span>
    </div>

    <p style="margin:0 0 4px;font-size:13px;color:#a1a1aa;">
      Bu kod <strong style="color:#71717a;">5 dakika</strong> içinde geçerliliğini yitirecektir.
    </p>
    <p style="margin:0;font-size:13px;color:#a1a1aa;">
      Bu işlemi siz başlatmadıysanız bu e-postayı görmezden gelebilirsiniz.
    </p>
  `;
  return emailLayout("GH7 — Giriş Kodu", body);
}
