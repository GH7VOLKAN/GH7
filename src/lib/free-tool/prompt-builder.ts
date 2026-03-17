import type { FreeToolInput } from "./types";

export function buildFreeToolPrompt(input: FreeToolInput): string {
  const { mode, field, city } = input;

  if (mode === "kisisel") {
    const cityPart = city ? `${city}'de ` : "Türkiye'de ";
    const fieldPart = field || "profesyonel hizmet";
    return `${cityPart}${fieldPart} alanında en iyi profesyonelleri arıyorum. Bana bu alandaki öne çıkan isimleri önerir misin? En güvenilir ve deneyimli uzmanları sırala. Yanıtını Türkçe ver.`;
  }

  const cityPart = city ? `${city}'de ` : "Türkiye'de ";
  const fieldPart = field || "hizmet";
  return `${cityPart}${fieldPart} sektöründe hizmet veren en iyi firmaları arıyorum. Bu alandaki öne çıkan şirketleri önerir misin? En güvenilir firmaları sırala. Yanıtını Türkçe ver.`;
}
