/**
 * Dashboard "Bu hafta" değişim özetleri (Brief H Aşama 3).
 *
 * Tek cümlelik in-app mesajlar. Dashboard ana sayfada Tracker kartında
 * veya widget'ta kullanılır. Email değil — UI string.
 */

import { pickVariant, renderTemplate } from "../engine";
import { formatChange } from "../common/formatters";
import type { DegisimYonu } from "./weekly-email";

export type ChangeSummaryInput = {
  markaAdi?: string; // opsiyonel, deterministic seed için
  degisim: number;
  degisimYonu: DegisimYonu;
  yeniSkor: number;
  enOnemliDegisim?: string;
  enOnemliPlatform?: string; // "Perplexity", "ChatGPT" vb.
  yeniMentionSayisi: number;
  kaybedilenMention: number;
  isFirstWeek?: boolean;
};

export const changeSummaryTemplates: Record<DegisimYonu, string[]> = {
  up: [
    "Skorunuz bu hafta {degisim} puan arttı — {enOnemliDegisim}",
    "{degisim} puanla haftayı kapattınız · {yeniMentionSayisi} yeni mention",
    "Pozitif momentum: {enOnemliPlatform}'de yeni sorguda öne çıktınız",
  ],
  down: [
    "Bu hafta {degisim} puan düşüş var — incelemeniz önerilir",
    "{kaybedilenMention} sorguda mention azaldı · detaylara bakın",
    "Skorda hareket var, sebebi kontrol edilmeli",
  ],
  same: [
    "Skorunuz stabil: {yeniSkor}/25 · trend sağlıklı",
    "Bu hafta büyük değişim yok, baz skorunuz korunuyor",
    "Skor sabit. Şimdi 'dikkat' maddelerini önceliklendirme zamanı",
  ],
};

export const firstTimeTemplates = [
  "İlk analizin tamamlandı. Önümüzdeki hafta ilk trend verisi gelecek.",
  "Baz skorun belirlendi ({yeniSkor}/25). Haftalık takip aktif.",
];

export function generateChangeSummary(input: ChangeSummaryInput): string {
  const seed = input.markaAdi ? `${input.markaAdi}-summary` : undefined;
  const vars = {
    degisim: formatChange(input.degisim),
    yeniSkor: input.yeniSkor,
    enOnemliDegisim: input.enOnemliDegisim ?? "yeni gelişme kaydedildi",
    enOnemliPlatform: input.enOnemliPlatform ?? "bir AI platform",
    yeniMentionSayisi: input.yeniMentionSayisi,
    kaybedilenMention: input.kaybedilenMention,
  };

  if (input.isFirstWeek) {
    return renderTemplate(pickVariant(firstTimeTemplates, seed), vars);
  }

  const variants = changeSummaryTemplates[input.degisimYonu];
  return renderTemplate(pickVariant(variants, seed), vars);
}
