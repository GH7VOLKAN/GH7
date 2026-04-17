/**
 * Discovery — 4 kullanıcı tipi için ortak veri şeması.
 *
 * Kullanıcı tipi (firma/kisi/eticaret/yurtdisi) bağımsız olarak
 * Perplexity Sonar üzerinden profil çıkarmak için kullanılır.
 */

export type CompanyType = "firma" | "kisi" | "eticaret" | "yurtdisi";

export interface DiscoveredCompetitor {
  name: string;
  url?: string;
  reason: string;
  market?: string; // "Türkiye" | "ABD" vb. (yurtdisi için)
}

export interface DiscoveredPlatform {
  name: string; // "Instagram", "Trendyol", "LinkedIn", "Hepsiburada"
  url?: string;
  active?: boolean; // eticaret için
  followers?: string; // kişi için (tahmini)
}

export interface DiscoveredLocation {
  city?: string;
  district?: string;
  country?: string;
}

export interface DiscoveredQuery {
  query: string;
  language?: string; // yurtdisi için: "tr" | "en" | "de" vb.
}

export interface DiscoveryResult {
  // ═══ Ortak ═══
  companyType: CompanyType;
  sector: string;
  description: string;
  location: DiscoveredLocation;
  competitors: DiscoveredCompetitor[];
  targetQueries: DiscoveredQuery[];
  products: string[];
  services: string[];
  platforms?: DiscoveredPlatform[];

  // ═══ Kişi Ek ═══
  expertise?: string[];

  // ═══ E-ticaret Ek ═══
  priceSegment?: "ekonomik" | "orta" | "premium" | "luks";
  category?: string;

  // ═══ Yurtdışı Ek ═══
  targetCountries?: string[];
  siteLanguages?: string[];
}

export interface DiscoveryInput {
  companyType: CompanyType;

  // Firma / Yurtdışı için
  url?: string;
  brandName?: string;

  // Kişi için
  fullName?: string;
  expertise?: string; // "diş hekimi", "fitness eğitmeni"
  socialMedia?: string; // "@handle" veya URL

  // E-ticaret için
  ecommerceMode?: "website" | "marketplace" | "brand";
  marketplaceUrl?: string;
  brandOrProductName?: string;
  category?: string;

  // Yurtdışı için
  targetMarkets?: string; // "ABD, Almanya, Suudi Arabistan"
  siteLanguage?: string; // "İngilizce", "Almanca"

  // Ortak opsiyonel
  location?: string;
  competitor?: string; // Kullanıcının bildiği bir rakip (hint)
}

export const DEFAULT_DISCOVERY: DiscoveryResult = {
  companyType: "firma",
  sector: "",
  description: "",
  location: {},
  competitors: [],
  targetQueries: [],
  products: [],
  services: [],
};

export function isValidCompanyType(value: unknown): value is CompanyType {
  return (
    value === "firma" ||
    value === "kisi" ||
    value === "eticaret" ||
    value === "yurtdisi"
  );
}
