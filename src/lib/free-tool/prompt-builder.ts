import type { FreeToolInput } from "./types";

export function buildFreeToolPrompt(input: FreeToolInput): string {
  const { mode, name, field, city } = input;

  if (mode === "kisisel") {
    return `${city}'de ${field} alanında en iyi profesyonelleri arıyorum. Bana bu alandaki öne çıkan isimleri önerir misin? ${name} hakkında bilgin var mı? Eğer varsa, bu kişiyi değerlendir. Yanıtını Türkçe ver.`;
  }

  return `${city}'de ${field} sektöründe hizmet veren en iyi firmaları arıyorum. Bu alandaki öne çıkan şirketleri önerir misin? ${name} hakkında bilgin var mı? Eğer varsa, bu firmayı değerlendir. Yanıtını Türkçe ver.`;
}
