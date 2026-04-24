/**
 * Tracker alert template'leri (Brief H Aşama 3).
 *
 * 4 alert tipi, her biri 3 varyant:
 * - firstMention: İlk kez bahsedildi (pozitif)
 * - lostMention: Mention kaybı (dikkat)
 * - competitorPassed: Rakip öne geçti (uyarı)
 * - scoreSharpDrop: Skor ani düşüş (kritik)
 *
 * Her alert tek satırlık — push notification, email subject, in-app toast
 * için uygun.
 */

import { pickVariant, renderTemplate } from "../engine";
import { formatChange, formatPlatform } from "../common/formatters";

export type AlertKind =
  | "firstMention"
  | "lostMention"
  | "competitorPassed"
  | "scoreSharpDrop";

export const alertTemplates: Record<AlertKind, string[]> = {
  firstMention: [
    "🎯 İlk kez bahsediliyorsunuz: {platformAdi}'de {sorguAdi}",
    "Yeni mention: {platformAdi} · {sorguAdi}",
    "Pozitif hareket: {platformAdi}'de {sorguAdi} sorgusunda göründünüz",
  ],
  lostMention: [
    "⚠️ Kayıp: {platformAdi}'de {sorguAdi} sorgusunda artık bahsedilmiyorsunuz",
    "Dikkat: {platformAdi} · {sorguAdi} mention kayboldu",
    "{platformAdi}'deki varlığınız {sorguAdi} sorgusunda sona erdi",
  ],
  competitorPassed: [
    "⚠️ {rakipAdi}, {sorguAdi} sorgusunda sizi geçti ({platformAdi})",
    "Rekabet: {rakipAdi} · {platformAdi}'de öne geçti",
    "{rakipAdi} {sorguAdi} için pozisyonunuzu aldı",
  ],
  scoreSharpDrop: [
    "⚠️ Skorunuz son 48 saatte {dususMiktari} puan düştü — inceleme önerilir",
    "Ani düşüş: skor {eskiSkor}'dan {yeniSkor}'a · sebep kontrol edilmeli",
    "Skor düşüşü tespit edildi — Audit çalıştırmanız önerilir",
  ],
};

// ───────────────────────────────────────────────────────
// Input tipleri (her alert tipi için ayrı)
// ───────────────────────────────────────────────────────

export type FirstMentionInput = {
  markaAdi?: string;
  platformAdi: string; // raw key veya formatted
  sorguAdi: string;
};

export type LostMentionInput = {
  markaAdi?: string;
  platformAdi: string;
  sorguAdi: string;
};

export type CompetitorPassedInput = {
  markaAdi?: string;
  rakipAdi: string;
  platformAdi: string;
  sorguAdi: string;
};

export type ScoreSharpDropInput = {
  markaAdi?: string;
  eskiSkor: number;
  yeniSkor: number;
  dususMiktari: number; // pozitif sayı (örn. 4)
};

export type AlertInput =
  | ({ kind: "firstMention" } & FirstMentionInput)
  | ({ kind: "lostMention" } & LostMentionInput)
  | ({ kind: "competitorPassed" } & CompetitorPassedInput)
  | ({ kind: "scoreSharpDrop" } & ScoreSharpDropInput);

/**
 * Alert mesajı üret — deterministic seed: markaAdi + alert kind.
 */
export function generateAlert(input: AlertInput): string {
  const seed = input.markaAdi
    ? `${input.markaAdi}-${input.kind}`
    : input.kind;
  const variants = alertTemplates[input.kind];
  const picked = pickVariant(variants, seed);

  if (input.kind === "scoreSharpDrop") {
    return renderTemplate(picked, {
      dususMiktari: formatChange(-Math.abs(input.dususMiktari)),
      eskiSkor: input.eskiSkor,
      yeniSkor: input.yeniSkor,
    });
  }

  // firstMention / lostMention / competitorPassed
  const base: Record<string, string | number> = {
    platformAdi: formatPlatform(input.platformAdi),
    sorguAdi: input.sorguAdi,
  };
  if (input.kind === "competitorPassed") {
    base.rakipAdi = input.rakipAdi;
  }
  return renderTemplate(picked, base);
}
