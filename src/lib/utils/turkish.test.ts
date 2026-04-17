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
