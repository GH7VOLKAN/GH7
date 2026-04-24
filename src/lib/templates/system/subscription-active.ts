/**
 * Ödeme başarılı email'i (Brief H Aşama 5).
 *
 * Trial sonrası veya direkt satın alma sonrası gönderilir.
 * Fatura linki, paket tipi, tutar, sonraki yenileme tarihi içerir.
 */

import { renderTemplate } from "../engine";
import { formatDate, formatMoney } from "../common/formatters";
import { wrapEmailHtml } from "./email-layout";

export type SubscriptionActiveInput = {
  /** "Aylık" | "Yıllık" */
  paketTipi: "Aylık" | "Yıllık";
  /** Paket adı — "GH7 Pro", "GH7 Pro+" */
  paketAdi: string;
  /** Ödenen tutar TL (net) */
  tutar: number;
  /** Sonraki yenileme tarihi */
  sonrakiOdeme: Date;
  /** İyzico fatura linki (opsiyonel) */
  faturaLinki?: string;
};

const BODY_TEMPLATE = `Merhaba,

Ödemeniz başarıyla alındı. GH7 Pro üyeliğiniz {paketTipi} olarak aktif edildi.

Fatura bilgileri:
· Paket: {paketAdi}
· Tutar: {tutar}
· Sonraki yenileme: {sonrakiOdeme}
{faturaLinkBlok}

https://gh7.ai/dashboard

— GH7`;

export function generateSubscriptionActiveEmail(
  input: SubscriptionActiveInput,
): {
  subject: string;
  text: string;
  html: string;
} {
  const faturaLinkBlok = input.faturaLinki
    ? `\nFaturanız: ${input.faturaLinki}\n`
    : "";

  const text = renderTemplate(BODY_TEMPLATE, {
    paketTipi: input.paketTipi,
    paketAdi: input.paketAdi,
    tutar: formatMoney(input.tutar),
    sonrakiOdeme: formatDate(input.sonrakiOdeme),
    faturaLinkBlok,
  });

  return {
    subject: "Ödemeniz onaylandı — GH7 Pro üyeliğiniz aktif",
    text,
    html: wrapEmailHtml(text),
  };
}
