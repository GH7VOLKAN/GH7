/**
 * Brand slug üretimi + çakışma çözümü (Brief H-ext Aşama 1).
 *
 * Kurallar:
 * - Türkçe karakter → ASCII
 * - Lowercase + alphanumeric + hyphen
 * - User içinde unique (@@unique([profileId, slug]))
 * - Çakışırsa "-2", "-3" ekle
 *
 * Örnekler:
 *   "İdavilla Bungalov Evleri" → "idavilla-bungalov-evleri"
 *   "ISITMAX"                  → "isitmax"
 *   "Volkan Şimşirkaya"        → "volkan-simsirkaya"
 */

import { prisma } from "@/lib/db";

const TR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

export function generateBrandSlug(name: string): string {
  return name
    .split("")
    .map((c) => TR_MAP[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60); // DB index için makul uzunluk
}

/**
 * User içinde unique slug üretir. Çakışma varsa "-2", "-3" ekler.
 * Max 100 deneme (makul sınır).
 */
export async function generateUniqueBrandSlug(
  profileId: string,
  name: string,
  excludeBrandId?: string, // rename scenario: kendi slug'ını ignore et
): Promise<string> {
  const base = generateBrandSlug(name) || "marka";
  let candidate = base;
  let attempt = 1;

  while (attempt <= 100) {
    const existing = await prisma.brand.findFirst({
      where: {
        profileId,
        slug: candidate,
        ...(excludeBrandId ? { NOT: { id: excludeBrandId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  throw new Error(`Unique slug üretilemedi: ${name}`);
}
