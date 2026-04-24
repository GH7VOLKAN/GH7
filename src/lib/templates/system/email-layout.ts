/**
 * Email HTML layout wrapper (Brief H Aşama 5).
 *
 * Tüm sistem email'lerini ortak bir minimal HTML iskeletine sarar.
 * Resend / SendGrid / Postmark vs. generic SMTP için uygun.
 *
 * Tasarım: Kinde estetiği uyumlu (zinc palette, Geist-benzeri sans).
 * Inline style — email client'lar CSS link desteklemez.
 */

const GH7_LOGO_TEXT = "GH7";

/**
 * Plain text body'yi HTML email'e dönüştürür.
 * Newlines → <br>, boş satır → paragraph separator.
 */
function textToHtml(body: string): string {
  return body
    .trim()
    .split(/\n\n+/)
    .map(
      (para) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">${para
          .trim()
          .replace(/\n/g, "<br/>")
          .replace(
            /https?:\/\/[^\s]+/g,
            (url) =>
              `<a href="${url}" style="color:#09090b;text-decoration:underline;">${url}</a>`,
          )}</p>`,
    )
    .join("");
}

export function wrapEmailHtml(bodyText: string): string {
  const bodyHtml = textToHtml(bodyText);
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>GH7</title>
</head>
<body style="margin:0;padding:0;background-color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;padding:40px 20px;">
<tr>
<td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:40px 32px;">
<tr>
<td>
<div style="font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#09090b;margin-bottom:32px;">
${GH7_LOGO_TEXT}
</div>
${bodyHtml}
<hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0 16px;"/>
<p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
GH7 · AI görünürlük platformu<br/>
<a href="https://gh7.ai" style="color:#71717a;text-decoration:none;">gh7.ai</a> · <a href="mailto:info@gh7.ai" style="color:#71717a;text-decoration:none;">info@gh7.ai</a>
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
