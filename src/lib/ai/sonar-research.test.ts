import { describe, it, expect } from "vitest";
import {
  extractCompetitorsWithDomains,
  extractServiceRegions,
} from "./sonar-research";

// ─── extractCompetitorsWithDomains ────────────────────

describe("extractCompetitorsWithDomains", () => {
  it("parses numbered list with name + domain", () => {
    const input = `1. ABC Isıtma - abcisitma.com
2. XYZ Tesisat - xyztesisat.com`;
    const result = extractCompetitorsWithDomains(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: "ABC Isıtma", domain: "abcisitma.com" });
    expect(result[1]).toEqual({ name: "XYZ Tesisat", domain: "xyztesisat.com" });
  });

  it("returns EMPTY for descriptive text (not a competitor list)", () => {
    const input = "Türkiye'deki ısıtma kablosu üreticileri listesi";
    const result = extractCompetitorsWithDomains(input);
    expect(result).toEqual([]);
  });

  it("extracts a single competitor without domain", () => {
    const input = "Çetin Mühendislik: Zeminden ısıtma kabloları, self";
    const result = extractCompetitorsWithDomains(input);
    // Should extract "Çetin Mühendislik" as a competitor name
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]?.name).toBe("Çetin Mühendislik");
  });

  it("extracts all 10 numbered competitors", () => {
    const lines = Array.from({ length: 10 }, (_, i) =>
      `${i + 1}. Firma${i + 1} - firma${i + 1}.com`
    ).join("\n");
    const result = extractCompetitorsWithDomains(lines);
    expect(result).toHaveLength(10);
    for (let i = 0; i < 10; i++) {
      expect(result[i]?.domain).toBe(`firma${i + 1}.com`);
    }
  });

  it("returns empty for empty string", () => {
    expect(extractCompetitorsWithDomains("")).toEqual([]);
  });

  it("handles HTML-like content gracefully", () => {
    const input = "<div><p>Some HTML content</p></div>";
    const result = extractCompetitorsWithDomains(input);
    // Should not crash, may return empty or parsed items
    expect(Array.isArray(result)).toBe(true);
  });

  it("handles markdown bold formatting", () => {
    const input = `1. **Enerjisa** - enerjisa.com.tr
2. **Kale Enerji** - kaleenerji.com`;
    const result = extractCompetitorsWithDomains(input);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0]?.name).toBe("Enerjisa");
    expect(result[0]?.domain).toBe("enerjisa.com.tr");
  });

  it("handles dash-separated list items", () => {
    const input = `- TeknoPanel - teknopanel.com
- Ecoflam - ecoflam.com.tr`;
    const result = extractCompetitorsWithDomains(input);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it("skips header lines like 'Firma' or 'Web'", () => {
    const input = `Firma Adı - Web Sitesi
1. ABC Firm - abcfirm.com`;
    const result = extractCompetitorsWithDomains(input);
    // Should skip the header and only parse the actual competitor
    expect(result).toHaveLength(1);
    expect(result[0]?.domain).toBe("abcfirm.com");
  });

  it("handles .com.tr domains correctly", () => {
    const input = "1. Vaillant Türkiye - vaillant.com.tr";
    const result = extractCompetitorsWithDomains(input);
    expect(result).toHaveLength(1);
    expect(result[0]?.domain).toBe("vaillant.com.tr");
  });
});

// ─── extractServiceRegions ────────────────────────────

describe("extractServiceRegions", () => {
  it("extracts known Turkish cities", () => {
    const text = "Firma İstanbul, Ankara ve İzmir'de hizmet vermektedir.";
    const result = extractServiceRegions(text);
    expect(result).toContain("İstanbul");
    expect(result).toContain("Ankara");
    expect(result).toContain("İzmir");
  });

  it('returns "Türkiye geneli" for nationwide text', () => {
    const text = "Türkiye genelinde hizmet veren bir firmadır.";
    const result = extractServiceRegions(text);
    expect(result).toContain("Türkiye geneli");
  });

  it('detects "Türkiye geneli" from "tüm Türkiye"', () => {
    const text = "Tüm Türkiye'ye gönderim yapılmaktadır.";
    const result = extractServiceRegions(text);
    expect(result).toContain("Türkiye geneli");
  });

  it("returns empty array for empty input", () => {
    expect(extractServiceRegions("")).toEqual([]);
  });

  it("extracts geographic regions", () => {
    const text = "Marmara Bölgesi ve Ege Bölgesinde faaliyet göstermektedir.";
    const result = extractServiceRegions(text);
    expect(result).toContain("Marmara Bölgesi");
    expect(result).toContain("Ege Bölgesi");
  });

  it("returns max 8 regions", () => {
    const text =
      "İstanbul, Ankara, İzmir, Antalya, Bursa, Adana, Konya, Gaziantep, Kayseri, Mersin, Eskişehir'de hizmet veriyoruz.";
    const result = extractServiceRegions(text);
    expect(result.length).toBeLessThanOrEqual(8);
  });
});
