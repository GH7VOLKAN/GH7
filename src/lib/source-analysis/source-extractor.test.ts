import { describe, it, expect } from "vitest";
import {
  extractSourcesFromResponse,
  extractDomain,
} from "./source-extractor";

describe("extractDomain", () => {
  it("www. strip + lowercase", () => {
    expect(extractDomain("https://www.Tripadvisor.com/page")).toBe(
      "tripadvisor.com",
    );
  });

  it("geçersiz URL → boş", () => {
    expect(extractDomain("not-a-url")).toBe("");
  });
});

describe("extractSourcesFromResponse — Perplexity", () => {
  it("citations array kullanır", () => {
    const r = {
      platform: "perplexity" as const,
      content: "some text",
      citations: [
        "https://www.tripadvisor.com/Hotel_Review-123.html",
        "https://booking.com/hotel/tr/idavilla",
      ],
    };
    const sources = extractSourcesFromResponse(r);
    expect(sources).toHaveLength(2);
    expect(sources[0].domain).toBe("tripadvisor.com");
    expect(sources[1].domain).toBe("booking.com");
    expect(sources[0].platform).toBe("perplexity");
  });

  it("citations + content'teki URL'leri dedup eder", () => {
    const r = {
      platform: "perplexity" as const,
      content: "See https://www.tripadvisor.com/Hotel_Review-123.html for details",
      citations: ["https://www.tripadvisor.com/Hotel_Review-123.html"],
    };
    const sources = extractSourcesFromResponse(r);
    expect(sources).toHaveLength(1);
  });
});

describe("extractSourcesFromResponse — other platforms", () => {
  it("content içinde URL regex", () => {
    const r = {
      platform: "chatgpt" as const,
      content:
        "Örneğin https://tripadvisor.com/Hotel_Review-123.html ve https://booking.com/hotel",
    };
    const sources = extractSourcesFromResponse(r);
    expect(sources).toHaveLength(2);
    expect(sources.map((s) => s.domain)).toContain("tripadvisor.com");
  });

  it("platform internal domain'leri dışlar", () => {
    const r = {
      platform: "claude" as const,
      content:
        "Bunu https://chatgpt.com/share/abc için https://tripadvisor.com var",
    };
    const sources = extractSourcesFromResponse(r);
    expect(sources).toHaveLength(1);
    expect(sources[0].domain).toBe("tripadvisor.com");
  });

  it("example.com gibi placeholder'ları dışlar", () => {
    const r = {
      platform: "gemini" as const,
      content: "Bkz https://example.com/test ve https://booking.com",
    };
    const sources = extractSourcesFromResponse(r);
    expect(sources).toHaveLength(1);
    expect(sources[0].domain).toBe("booking.com");
  });

  it("URL sonundaki noktalama kırpılır", () => {
    const r = {
      platform: "gemini" as const,
      content: "Gör https://tripadvisor.com/review. Çok iyi.",
    };
    const sources = extractSourcesFromResponse(r);
    expect(sources[0].url.endsWith(".")).toBe(false);
    expect(sources[0].url).toBe("https://tripadvisor.com/review");
    expect(sources[0].domain).toBe("tripadvisor.com");
  });

  it("boş content → boş array", () => {
    const r = { platform: "chatgpt" as const, content: "" };
    expect(extractSourcesFromResponse(r)).toEqual([]);
  });
});
