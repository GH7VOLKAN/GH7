import { describe, it, expect } from "vitest";
import { classifyResponseQuality, isWeakQuality } from "./response-quality";

describe("classifyResponseQuality", () => {
  it("returns 'error' for API error", () => {
    expect(
      classifyResponseQuality({
        content: "[ERROR] timeout",
        mentioned: false,
        competitorCount: 0,
        hasError: true,
      })
    ).toBe("error");
  });

  it("returns 'refused' for very short content", () => {
    expect(
      classifyResponseQuality({
        content: "Hmm.",
        mentioned: false,
        competitorCount: 0,
        hasError: false,
      })
    ).toBe("refused");
  });

  it("returns 'refused' for 'bilmiyorum' pattern", () => {
    expect(
      classifyResponseQuality({
        content:
          "Bu konu hakkında bilgim yok, emin değilim. Daha fazla bilgi sağlayamam.",
        mentioned: false,
        competitorCount: 0,
        hasError: false,
      })
    ).toBe("refused");
  });

  it("returns 'clarification_asked' for 'daha spesifik' pattern", () => {
    expect(
      classifyResponseQuality({
        content:
          "Daha spesifik bir bölge belirtir misiniz? Hangi konuda tavsiye istiyorsunuz?",
        mentioned: false,
        competitorCount: 0,
        hasError: false,
      })
    ).toBe("clarification_asked");
  });

  it("returns 'clarification_asked' for English variant", () => {
    expect(
      classifyResponseQuality({
        content:
          "Could you clarify which region you're asking about? I need more specific information.",
        mentioned: false,
        competitorCount: 0,
        hasError: false,
      })
    ).toBe("clarification_asked");
  });

  it("returns 'direct_list' when brand is mentioned", () => {
    expect(
      classifyResponseQuality({
        content:
          "ISITMAX Türkiye'de yerden ısıtma kablolarında öncü firmalardan biri. Warmup ve Danfoss da popüler markalar.",
        mentioned: true,
        competitorCount: 2,
        hasError: false,
      })
    ).toBe("direct_list");
  });

  it("returns 'direct_list' when 2+ competitors mentioned but brand not", () => {
    expect(
      classifyResponseQuality({
        content:
          "Warmup, Danfoss ve Raychem bu sektörün en iyi markaları arasındadır.",
        mentioned: false,
        competitorCount: 3,
        hasError: false,
      })
    ).toBe("direct_list");
  });

  it("returns 'general_info' when no brand/competitor mentioned", () => {
    expect(
      classifyResponseQuality({
        content:
          "Yerden ısıtma sistemleri genel olarak kablolu veya sulu olabilir. Karar tercihinize bağlıdır. Her iki sistemin de avantajları vardır.",
        mentioned: false,
        competitorCount: 0,
        hasError: false,
      })
    ).toBe("general_info");
  });

  it("prefers 'direct_list' over 'refused' when 1 competitor mentioned but bilmiyorum phrase", () => {
    // Edge case: content has refused pattern but has mentions
    // direct_list kazanır çünkü mentioned=true
    expect(
      classifyResponseQuality({
        content:
          "ISITMAX hakkında bilgim yok, emin değilim ama yerden ısıtma konusunda bir isim.",
        mentioned: true,
        competitorCount: 0,
        hasError: false,
      })
    ).not.toBe("refused"); // Mentioned=true → refused olmaz
  });
});

describe("isWeakQuality", () => {
  it("returns true for 'refused'", () => {
    expect(isWeakQuality("refused")).toBe(true);
  });

  it("returns true for 'clarification_asked'", () => {
    expect(isWeakQuality("clarification_asked")).toBe(true);
  });

  it("returns false for 'direct_list'", () => {
    expect(isWeakQuality("direct_list")).toBe(false);
  });

  it("returns false for 'general_info'", () => {
    expect(isWeakQuality("general_info")).toBe(false);
  });

  it("returns false for 'error'", () => {
    expect(isWeakQuality("error")).toBe(false);
  });

  it("returns false for null/undefined", () => {
    expect(isWeakQuality(null)).toBe(false);
    expect(isWeakQuality(undefined)).toBe(false);
  });
});
