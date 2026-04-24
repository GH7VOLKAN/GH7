/**
 * 4 kapı konfigürasyonu (Brief H-ext Aşama 2).
 *
 * Şu an sadece FIRMA aktif. Diğer 3 kapı launch tarihinde enabled'a çekilecek
 * — kod değişmeden status: "active" yapmak yeter.
 */

export type GateCode = "firma" | "kisi" | "eticaret" | "yurtdisi";

export type GateInfo = {
  code: GateCode;
  label: string;
  description: string;
  status: "active" | "coming-soon";
  launchDate: string | null;
};

export const GATES: GateCode[] = ["firma", "kisi", "eticaret", "yurtdisi"];

export const GATE_CONFIG: Record<GateCode, GateInfo> = {
  firma: {
    code: "firma",
    label: "Firma",
    description: "Türkçe B2B/B2C firmalar için AI görünürlük takibi",
    status: "active",
    launchDate: null,
  },
  kisi: {
    code: "kisi",
    label: "Kişi",
    description: "Yazar, uzman, influencer'lar için AI görünürlük takibi",
    status: "coming-soon",
    launchDate: "Q3 2026",
  },
  eticaret: {
    code: "eticaret",
    label: "E-Ticaret",
    description: "Ürün bazlı AI görünürlük takibi",
    status: "coming-soon",
    launchDate: "Q4 2026",
  },
  yurtdisi: {
    code: "yurtdisi",
    label: "Yurt Dışı",
    description: "Türk firmaların uluslararası varlığı",
    status: "coming-soon",
    launchDate: "Q1 2027",
  },
};

export function isGateActive(code: string): boolean {
  const info = GATE_CONFIG[code as GateCode];
  return info?.status === "active";
}

export function getGateInfo(code: string): GateInfo | null {
  return GATE_CONFIG[code as GateCode] ?? null;
}
