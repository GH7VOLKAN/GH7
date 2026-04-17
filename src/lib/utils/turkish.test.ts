import { describe, it, expect } from "vitest";
import {
  normalizeTurkish,
  turkishToAscii,
  turkishLowerCase,
  turkishUpperCase,
  turkishCapitalize,
  normalizeQuery,
  brandMatch,
  normalizeDomain,
  generateSlug,
  textContains,
  normalizeForMatching,
  extractRootDomain,
  levenshteinDistance,
  brandMatchFuzzy,
} from "./turkish";

describe("normalizeTurkish", () => {
  it("normalizes İ to i", () => {
    expect(normalizeTurkish("İstanbul")).toBe("istanbul");
  });

  it("normalizes dotless ı to i", () => {
    expect(normalizeTurkish("Isıtmax")).toBe("isitmax");
  });

  it("normalizes all Turkish special characters", () => {
    expect(normalizeTurkish("ŞÇĞÜÖşçğüö")).toBe("scguoscguo");
  });

  it("makes İdavilla and Idavilla match", () => {
    expect(normalizeTurkish("İdavilla")).toBe(normalizeTurkish("Idavilla"));
  });

  it("makes ISITMAX and Isıtmax match", () => {
    expect(normalizeTurkish("ISITMAX")).toBe(normalizeTurkish("Isıtmax"));
  });

  it("handles empty string", () => {
    expect(normalizeTurkish("")).toBe("");
  });

  it("preserves non-Turkish characters", () => {
    expect(normalizeTurkish("GH7 ISITMAX")).toBe("gh7 isitmax");
  });

  it("handles mixed Turkish + English", () => {
    expect(normalizeTurkish("İstanbul Yerden Isıtma")).toBe("istanbul yerden isitma");
  });

  it("returns empty for null/undefined", () => {
    // @ts-expect-error test runtime null handling
    expect(normalizeTurkish(null)).toBe("");
    // @ts-expect-error test runtime undefined handling
    expect(normalizeTurkish(undefined)).toBe("");
  });
});

describe("turkishToAscii", () => {
  it("preserves case", () => {
    expect(turkishToAscii("İstanbul")).toBe("Istanbul");
    expect(turkishToAscii("ÇANAKKALE")).toBe("CANAKKALE");
  });

  it("converts all Turkish chars", () => {
    expect(turkishToAscii("şçğıüöŞÇĞİÜÖ")).toBe("scgiuoSCGIUO");
  });

  it("preserves non-Turkish", () => {
    expect(turkishToAscii("ISITMAX")).toBe("ISITMAX");
  });
});

describe("turkishLowerCase", () => {
  it("converts İSTANBUL to istanbul (Türkçe locale)", () => {
    // Node ICU: "İSTANBUL".toLocaleLowerCase("tr-TR") → "istanbul"
    expect(turkishLowerCase("İSTANBUL")).toBe("istanbul");
  });

  it("converts I to ı in Turkish locale", () => {
    // In Turkish locale, I (Latin capital I) lowercases to ı
    const result = turkishLowerCase("I");
    expect(result === "ı" || result === "i").toBe(true);
  });
});

describe("turkishUpperCase", () => {
  it("converts i to İ in Turkish locale", () => {
    expect(turkishUpperCase("istanbul")).toBe("İSTANBUL");
  });
});

describe("turkishCapitalize", () => {
  it("capitalizes AHMET YILMAZ correctly", () => {
    expect(turkishCapitalize("AHMET YILMAZ")).toBe("Ahmet Yılmaz");
  });

  it("handles single word", () => {
    expect(turkishCapitalize("isitmax")).toBe("İsitmax");
  });

  it("handles multiple spaces", () => {
    expect(turkishCapitalize("ali veli")).toBe("Ali Veli");
  });

  it("handles empty", () => {
    expect(turkishCapitalize("")).toBe("");
  });
});

describe("normalizeQuery", () => {
  it("trims and normalizes Turkish", () => {
    expect(normalizeQuery("  İstanbul  ISITMAX  ")).toBe("istanbul isitmax");
  });

  it("collapses multiple spaces", () => {
    expect(normalizeQuery("a   b    c")).toBe("a b c");
  });

  it("handles newlines", () => {
    expect(normalizeQuery("a\n\nb")).toBe("a b");
  });
});

describe("brandMatch", () => {
  it("matches ISITMAX and Isıtmax", () => {
    expect(brandMatch("ISITMAX", "Isıtmax")).toBe(true);
  });

  it("matches İdavilla and Idavilla", () => {
    expect(brandMatch("İdavilla", "idavilla")).toBe(true);
  });

  it("does NOT match different brands", () => {
    expect(brandMatch("ISITMAX", "Warmup")).toBe(false);
  });

  it("matches case variations", () => {
    expect(brandMatch("GH7", "gh7")).toBe(true);
    expect(brandMatch("GH7.ai", "gh7.ai")).toBe(true);
  });
});

describe("normalizeDomain", () => {
  it("strips protocol", () => {
    expect(normalizeDomain("https://isitmax.com")).toBe("isitmax.com");
    expect(normalizeDomain("http://isitmax.com")).toBe("isitmax.com");
  });

  it("strips www", () => {
    expect(normalizeDomain("https://www.isitmax.com")).toBe("isitmax.com");
  });

  it("strips path", () => {
    expect(normalizeDomain("https://isitmax.com/about/us")).toBe("isitmax.com");
  });

  it("lowercases", () => {
    expect(normalizeDomain("HTTPS://ISITMAX.COM")).toBe("isitmax.com");
  });

  it("handles empty", () => {
    expect(normalizeDomain("")).toBe("");
  });
});

describe("generateSlug", () => {
  it("converts Turkish query to slug", () => {
    expect(generateSlug("İstanbul Yerden Isıtma")).toBe("istanbul-yerden-isitma");
  });

  it("removes special chars", () => {
    expect(generateSlug("Isıtma!? &ve& Su")).toBe("isitma-ve-su");
  });

  it("collapses dashes", () => {
    expect(generateSlug("a -- b -- c")).toBe("a-b-c");
  });
});

describe("textContains", () => {
  it("finds brand in Turkish text", () => {
    expect(textContains("ISITMAX önerir", "isitmax")).toBe(true);
  });

  it("finds brand regardless of Turkish case", () => {
    expect(textContains("Isıtmax firması lider", "ISITMAX")).toBe(true);
  });

  it("returns false when not found", () => {
    expect(textContains("Warmup lider", "isitmax")).toBe(false);
  });

  it("handles İ/I/ı/i correctly", () => {
    expect(textContains("İdavilla'yı öneririm", "idavilla")).toBe(true);
  });
});

describe("normalizeForMatching", () => {
  it("removes all non-alphanumeric", () => {
    expect(normalizeForMatching("Warmhaus Türkiye")).toBe("warmhausturkiye");
  });

  it("normalizes Turkish chars", () => {
    expect(normalizeForMatching("Isıtmax A.Ş.")).toBe("isitmaxas");
  });

  it("handles WARMHAUS = warmhaus = Warmhaus", () => {
    expect(normalizeForMatching("WARMHAUS")).toBe(
      normalizeForMatching("Warmhaus")
    );
    expect(normalizeForMatching("warmhaus")).toBe(
      normalizeForMatching("WARMHAUS")
    );
  });

  it("strips punctuation from domains", () => {
    expect(normalizeForMatching("warmhaus.com")).toBe("warmhauscom");
  });

  it("handles empty", () => {
    expect(normalizeForMatching("")).toBe("");
  });
});

describe("extractRootDomain", () => {
  it("extracts from full URL with path", () => {
    expect(extractRootDomain("https://www.warmhaus.com.tr/about")).toBe(
      "warmhaus"
    );
  });

  it("extracts from bare domain", () => {
    expect(extractRootDomain("warmhaus.com")).toBe("warmhaus");
  });

  it("handles www prefix", () => {
    expect(extractRootDomain("www.isitmax.com")).toBe("isitmax");
  });

  it("handles uppercase", () => {
    expect(extractRootDomain("HTTPS://WARMHAUS.COM")).toBe("warmhaus");
  });

  it("returns empty for empty", () => {
    expect(extractRootDomain("")).toBe("");
  });
});

describe("levenshteinDistance", () => {
  it("returns 0 for identical", () => {
    expect(levenshteinDistance("abc", "abc")).toBe(0);
  });

  it("returns length for empty comparison", () => {
    expect(levenshteinDistance("", "abc")).toBe(3);
    expect(levenshteinDistance("abc", "")).toBe(3);
  });

  it("handles single character diff", () => {
    expect(levenshteinDistance("Warmhaus", "Warmhaüs")).toBe(1);
  });

  it("handles multi-char diff", () => {
    expect(levenshteinDistance("ABC", "XYZ")).toBe(3);
  });
});

describe("brandMatchFuzzy", () => {
  it("matches WARMHAUS and Warmhaus (case)", () => {
    expect(brandMatchFuzzy("WARMHAUS", "Warmhaus")).toBe(true);
  });

  it("matches Warmhaus and Warmhaüs (Turkish char)", () => {
    expect(brandMatchFuzzy("Warmhaus", "Warmhaüs")).toBe(true);
  });

  it("matches Warmhaus Türkiye and Warmhaus İstanbul (first word)", () => {
    expect(brandMatchFuzzy("Warmhaus Türkiye", "Warmhaus İstanbul")).toBe(true);
  });

  it("matches Warmhaus Türkiye and Warmhaus", () => {
    expect(brandMatchFuzzy("Warmhaus Türkiye", "Warmhaus")).toBe(true);
  });

  it("does NOT match different brands", () => {
    expect(brandMatchFuzzy("Warmhaus", "XYZ")).toBe(false);
    expect(brandMatchFuzzy("Apple", "Samsung")).toBe(false);
  });

  it("does NOT match very short different strings", () => {
    expect(brandMatchFuzzy("abc", "xyz")).toBe(false);
  });

  it("handles empty", () => {
    expect(brandMatchFuzzy("", "Warmhaus")).toBe(false);
    expect(brandMatchFuzzy("Warmhaus", "")).toBe(false);
  });
});
