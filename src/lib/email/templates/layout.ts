/**
 * Shared email layout wrapper
 * All GH7 emails use this consistent branded layout
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.gh7.ai";

export function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#09090b;padding:24px 32px;">
              <a href="${APP_URL}" style="text-decoration:none;">
                <img src="${APP_URL}/logo-light.svg" alt="GH7.ai" width="120" height="36" style="display:block;border:0;outline:none;" />
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                GH7.ai — Yapay zekalarda görünür olmanızı sağlıyoruz.
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#d4d4d8;">
                <a href="${APP_URL}/dashboard/studio" style="color:#a1a1aa;text-decoration:underline;">Bildirim Ayarları</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}" style="color:#a1a1aa;text-decoration:underline;">GH7.ai</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
