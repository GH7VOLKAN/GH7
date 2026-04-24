/**
 * Tracker haftalık email template (Brief H Aşama 3).
 *
 * Her Pazartesi 08:00'de Pro/Pro+ kullanıcılara gönderilen haftalık
 * özet email. Subject + body oluşturur.
 *
 * NOT: Bu dosya email gönderimi YAPMAZ (Brief I'da gelir). Sadece
 * template üretimi. Cron + Resend entegrasyonu sonraki brief.
 *
 * Kullanım:
 *   const { subject, body } = generateWeeklyEmail({ markaAdi, ... });
 */

import { pickVariant, renderTemplate } from "../engine";
import { formatChange } from "../common/formatters";

export type DegisimYonu = "up" | "down" | "same";

export type WeeklyEmailInput = {
  markaAdi: string;
  eskiSkor: number;
  yeniSkor: number;
  degisim: number; // numeric delta; formatChange ile +N / -N / 0
  degisimYonu: DegisimYonu;
  platformSayisi: number;
  yeniMentionSayisi: number;
  kaybedilenMention: number;
  enOnemliDegisim?: string;
  isFirstWeek?: boolean;
};

// ───────────────────────────────────────────────────────
// Subject varyantları (3 adet per yön)
// ───────────────────────────────────────────────────────

export const subjectVariants: Record<DegisimYonu, string[]> = {
  up: [
    "{markaAdi}: Bu hafta {degisim} puan yükseldin",
    "İyi haber — {markaAdi} AI görünürlüğü {degisim} arttı",
    "{markaAdi} Haftalık Rapor · {yeniSkor}/25",
  ],
  down: [
    "{markaAdi}: Bu hafta dikkat gerek — {degisim} puan düşüş",
    "{markaAdi} Haftalık Rapor · değişim var",
    "Kontrol edilmeli: {markaAdi} skoru değişti",
  ],
  same: [
    "{markaAdi} Haftalık Rapor · {yeniSkor}/25",
    "{markaAdi}: Bu hafta stabil durumda",
    "Haftalık takip raporu — {markaAdi}",
  ],
};

// ───────────────────────────────────────────────────────
// Body ana çerçevesi
// ───────────────────────────────────────────────────────

const BODY_TEMPLATE = `Merhaba,

{markaAdi} için bu haftaki GH7 raporu hazır.

{ozetBlok}
{yeniMentionBlok}
{haftaninTavsiyesiBlok}

Dashboard'da tam detayı görüntüleyebilirsin:
https://gh7.ai/dashboard

— GH7
`;

// ───────────────────────────────────────────────────────
// Özet bloğu (yöne göre)
// ───────────────────────────────────────────────────────

const OZET_BLOKLARI: Record<DegisimYonu, string> = {
  up: "Skorun {eskiSkor}'dan {yeniSkor}'a çıktı ({degisim} puan). {platformSayisi} AI platformundan {yeniMentionSayisi}'inde pozitif hareket var.",
  down: "Skorun {eskiSkor}'dan {yeniSkor}'a düştü ({degisim} puan). Geçen hafta {kaybedilenMention} sorguda bahsedilmiyorsun. Dashboard'da detayları kontrol etmeni öneririm.",
  same: "Skorun {yeniSkor}/25 seviyesinde sabit kaldı. Bu stabil pozisyon iyi bir temel — bir sonraki sıçrama için yapılandırılmış içerik eklemek zamanı.",
};

// ───────────────────────────────────────────────────────
// Yeni mention bloğu (opsiyonel)
// ───────────────────────────────────────────────────────

function renderYeniMentionBlok(input: WeeklyEmailInput): string {
  if (!input.enOnemliDegisim) return "";
  return `\nBu hafta yeni mention:\n${input.enOnemliDegisim}\n`;
}

// ───────────────────────────────────────────────────────
// Haftanın tavsiyesi (yöne + ilk hafta durumuna göre)
// ───────────────────────────────────────────────────────

type TavsiyeKey = DegisimYonu | "firstWeek";

const TAVSIYE_BLOKLARI: Record<TavsiyeKey, string> = {
  up: "\nBu ivmeyi korumak için içerik freshness önemli. Yeni blog veya güncelleme eklemek iyi olur.",
  down: "\nDüşüşün ana sebebini anlamak için GH7 Audit'i çalıştırmanı öneririm — değişimin kaynağı muhtemelen teknik bir detay.",
  same: "\nSabit skor, sağlıklı bir baz. Şimdi 'dikkat' kategorisindeki maddelere odaklanırsan skorda hareket başlar.",
  firstWeek: "\nBu ilk haftan — baz skorun belirlendi. Önümüzdeki haftalarda trend çizgin oluşmaya başlayacak.",
};

// ───────────────────────────────────────────────────────
// Public API
// ───────────────────────────────────────────────────────

export function generateWeeklyEmail(input: WeeklyEmailInput): {
  subject: string;
  body: string;
} {
  const vars = {
    markaAdi: input.markaAdi,
    eskiSkor: input.eskiSkor,
    yeniSkor: input.yeniSkor,
    degisim: formatChange(input.degisim),
    platformSayisi: input.platformSayisi,
    yeniMentionSayisi: input.yeniMentionSayisi,
    kaybedilenMention: input.kaybedilenMention,
    enOnemliDegisim: input.enOnemliDegisim ?? "",
  };

  // Subject — deterministic seed: markaAdi + hafta tarih (caller string ekleyebilir)
  const subject = renderTemplate(
    pickVariant(subjectVariants[input.degisimYonu], `${input.markaAdi}-subject`),
    vars,
  );

  // Ozet
  const ozetBlok = renderTemplate(OZET_BLOKLARI[input.degisimYonu], vars);

  // Yeni mention (opsiyonel)
  const yeniMentionBlok = renderYeniMentionBlok(input);

  // Tavsiye
  const tavsiyeKey: TavsiyeKey = input.isFirstWeek ? "firstWeek" : input.degisimYonu;
  const haftaninTavsiyesiBlok = TAVSIYE_BLOKLARI[tavsiyeKey];

  const body = renderTemplate(BODY_TEMPLATE, {
    ...vars,
    ozetBlok,
    yeniMentionBlok,
    haftaninTavsiyesiBlok,
  });

  return { subject, body };
}
