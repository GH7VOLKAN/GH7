import { describe, it, expect, beforeEach } from "vitest";
import { analyzeResponse, normalizeTurkish } from "./analyzer";

// ─── normalizeTurkish ─────────────────────────────────

describe("normalizeTurkish", () => {
  it("normalizes İ to lowercase i", () => {
    expect(normalizeTurkish("İstanbul")).toBe("istanbul");
  });

  it("normalizes ı (dotless i) to i", () => {
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
});

// ─── analyzeResponse — mention detection ──────────────
// Without ANTHROPIC_API_KEY, analyzeResponse uses the regex fallback path.

describe("analyzeResponse — mention detection", () => {
  beforeEach(() => {
    delete process.env.GH7_ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('detects "ISITMAX" in Turkish text with brand "Isitmax"', async () => {
    const response = "ISITMAX firması öneriyoruz, kaliteli ürünler sunuyor.";
    const result = await analyzeResponse(response, "Isitmax", "test prompt");
    expect(result.mentioned).toBe(true);
  });

  it('detects "İdavilla" with brand "Idavilla" (Turkish İ normalization)', async () => {
    const response = "İdavilla Bungalov doğayla iç içe bir tatil sunuyor.";
    const result = await analyzeResponse(response, "Idavilla", "test prompt");
    expect(result.mentioned).toBe(true);
  });

  it("returns mentioned: false when brand is not in response", async () => {
    const response = "Ferroli ve Viessmann öneriyoruz, iki firma da kaliteli.";
    const result = await analyzeResponse(response, "Isitmax", "test prompt");
    expect(result.mentioned).toBe(false);
    expect(result.position).toBeNull();
  });

  it("detects position from numbered list", async () => {
    const response = `En iyi firmalar:
1. ISITMAX - en iyi
2. Ferroli - ikinci
3. Viessmann - üçüncü`;
    const result = await analyzeResponse(response, "Isitmax", "test prompt");
    expect(result.mentioned).toBe(true);
    expect(result.position).toBe("1. sıra");
  });

  it("detects second position", async () => {
    const response = `Firmalar:
1. Ferroli - birinci
2. ISITMAX - ikinci
3. Viessmann - üçüncü`;
    const result = await analyzeResponse(response, "Isitmax", "test prompt");
    expect(result.mentioned).toBe(true);
    expect(result.position).toBe("2. sıra");
  });

  it("extracts URLs from response", async () => {
    const response =
      "ISITMAX hakkında bilgi: https://isitmax.com ve https://example.com/review";
    const result = await analyzeResponse(response, "Isitmax", "test prompt");
    expect(result.citations).toContain("https://isitmax.com");
    expect(result.citations).toContain("https://example.com/review");
  });
});
