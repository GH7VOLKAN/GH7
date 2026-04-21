import type { Door } from "./types";

export const DOOR_CONFIG: Record<
  Door,
  {
    label: string;
    inputLabels: string[];
    placeholder: string[];
  }
> = {
  firma: {
    label: "Firma",
    inputLabels: ["Web siten"],
    placeholder: ["isitmax.com"],
  },
  kisi: {
    label: "Kişi",
    inputLabels: ["Ad Soyad", "Şehir"],
    placeholder: ["Dr. Ahmet Yılmaz", "Balıkesir"],
  },
  eticaret: {
    label: "E-ticaret",
    inputLabels: ["Web siten veya marketplace bağlantın"],
    placeholder: ["markam.com veya trendyol.com/magaza/markam"],
  },
  yurtdisi: {
    label: "Yurt Dışı",
    inputLabels: ["Web siten", "Hedef pazar"],
    placeholder: ["markam.com", "Almanya"],
  },
};

export const TARGET_COUNTRIES = [
  { code: "DE", name: "Almanya", lang: "de" },
  { code: "US", name: "ABD", lang: "en" },
  { code: "GB", name: "Birleşik Krallık", lang: "en" },
  { code: "FR", name: "Fransa", lang: "fr" },
  { code: "NL", name: "Hollanda", lang: "en" },
  { code: "IT", name: "İtalya", lang: "en" },
  { code: "AE", name: "BAE", lang: "ar" },
  { code: "SA", name: "Suudi Arabistan", lang: "ar" },
  { code: "OTHER", name: "Diğer", lang: "en" },
] as const;
