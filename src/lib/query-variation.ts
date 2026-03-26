/**
 * GH7.ai — Sorgu Varyasyon Motoru
 *
 * Tek bir prompt icin birden fazla varyasyon uretir.
 * Pro+ kullanicilari 3 varyasyon, Free kullanicilari 1 varyasyon kullanir.
 * Varyasyonlar AI platformlarina gonderilir ve sonuclar ortalanir.
 */

/**
 * Bir prompt metninden genel varyasyonlar uretir.
 * Orijinal prompt + iki farkli soru tarzi.
 */
export function generateQueryVariations(promptText: string): string[] {
  return [
    promptText,
    `${promptText} hangi firma iyi`,
    `${promptText} öneri`,
  ];
}

/**
 * Sehir bazli varyasyonlar uretir.
 * Lokasyon odakli sorular icin kullanilir.
 */
export function generateCityVariations(keyword: string, city: string): string[] {
  return [
    `${city}'de ${keyword}`,
    `${city} için ${keyword}`,
    `${city} ${keyword} firması`,
  ];
}
