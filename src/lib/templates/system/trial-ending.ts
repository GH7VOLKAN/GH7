/**
 * Trial bitiyor email'i — 5. günde gönderilir (Brief H Aşama 5).
 *
 * Kullanım özet bloğu dinamik — kullanıcının o zamana kadarki aktivitesi.
 */

import { renderTemplate } from "../engine";
import { wrapEmailHtml } from "./email-layout";

export type TrialEndingInput = {
  /** O zamana kadar yapılan işlerin özeti. Tek paragraf, 2-4 satır. */
  kullanimOzet: string;
};

const BODY_TEMPLATE = `Merhaba,

GH7 Pro denemenin 5. günündesin. 2 gün sonra denemen tamamlanacak ve Pro üyeliğin otomatik olarak devam edecek.

Bu süre içinde neler yaptın:
{kullanimOzet}

Eğer iptal etmek istersen, dashboard'dan tek tıkla yapabilirsin — tam iade garantili.

Devam etmek istiyorsan bir şey yapmana gerek yok, üyelik otomatik aktif kalacak.

https://gh7.ai/dashboard

— GH7`;

export function generateTrialEndingEmail(input: TrialEndingInput): {
  subject: string;
  text: string;
  html: string;
} {
  const text = renderTemplate(BODY_TEMPLATE, {
    kullanimOzet: input.kullanimOzet,
  });
  return {
    subject: "GH7 Pro denemenin son 2 günü",
    text,
    html: wrapEmailHtml(text),
  };
}

/**
 * Hızlı yardımcı: sayısal verilerden default kullanım özet cümlesi üretir.
 * Gerçek veriler yoksa fallback olarak generic bir özet döner.
 */
export function buildUsageSummary(data: {
  auditSayisi: number;
  rakipSayisi: number;
  markaSayisi: number;
}): string {
  const parts: string[] = [];
  if (data.auditSayisi > 0) {
    parts.push(`${data.auditSayisi} denetim çalıştırdın`);
  }
  if (data.rakipSayisi > 0) {
    parts.push(`${data.rakipSayisi} rakip ekledin`);
  }
  if (data.markaSayisi > 1) {
    parts.push(`${data.markaSayisi} marka izliyorsun`);
  }
  if (parts.length === 0) {
    return "Henüz ilk denetimi çalıştırmadın. 2 gün içinde hâlâ vakit var — tam resmini görmek için Audit'i başlatmanı öneririm.";
  }
  return parts.join(", ") + ".";
}
