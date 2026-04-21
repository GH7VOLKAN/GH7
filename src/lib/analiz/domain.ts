/**
 * Domain normalization — tüm varyasyonlar (www, scheme, case, trailing slash)
 * aynı cache key'e düşsün. Aksi halde kullanıcı aynı domaini 4 farklı şekilde
 * girip cache'i by-pass edebilir, biz her seferinde gerçek API'a öderiz.
 */

export function normalizeDomain(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return "";

  let s = trimmed;
  // scheme strip
  s = s.replace(/^https?:\/\//, "");
  // www strip
  s = s.replace(/^www\./, "");
  // path + query + hash strip
  s = s.split("/")[0].split("?")[0].split("#")[0];
  // port strip
  s = s.split(":")[0];
  // trailing dot strip
  s = s.replace(/\.$/, "");

  return s;
}

export function isValidDomain(input: string): boolean {
  const normalized = normalizeDomain(input);
  if (!normalized) return false;
  // Çok gevşek bir kontrol — kesin validation DNS lookup'a bırakılmalı
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(
    normalized,
  );
}

/**
 * Domain'den marka adı çıkar — "isitmax.com" → "ISITMAX".
 * Çok kaba; gerçek marka adı için ayrı tespit akışı lazım ama başlangıç için yeterli.
 */
export function brandNameFromDomain(domain: string): string {
  const normalized = normalizeDomain(domain);
  const base = normalized.split(".")[0];
  return base.toUpperCase();
}
