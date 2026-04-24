/**
 * Pro trial başladığında gönderilen hoşgeldin email'i (Brief H Aşama 5).
 *
 * NOT: Gönderim servisi bu dosyada değil — Brief K'da Resend entegrasyonu
 * gelince bu template kullanılacak.
 */

import { wrapEmailHtml } from "./email-layout";

const BODY = `Merhaba,

GH7 Pro ailesine hoşgeldin.

Üyeliğin aktif ve 7 gün tam erişim başladı. Bu süre içinde tüm özellikleri özgürce kullanabilirsin:

→ 43 maddelik AI görünürlük denetimi
→ Haftalık otomatik takip
→ 3 rakip karşılaştırması
→ Aylık strateji raporu

İlk adım olarak Audit'i çalıştırmanı öneririm — sitenin AI ekosistemindeki tam resmini göreceksin.

https://gh7.ai/dashboard

İlk 7 gün içinde herhangi bir sebeple iptal edersen tam iade yapıyoruz. Sorularınız için: info@gh7.ai

— GH7`;

export function generateWelcomeEmail(): {
  subject: string;
  text: string;
  html: string;
} {
  return {
    subject: "GH7 Pro üyeliğin aktif — 7 gün tam erişim başladı",
    text: BODY,
    html: wrapEmailHtml(BODY),
  };
}
