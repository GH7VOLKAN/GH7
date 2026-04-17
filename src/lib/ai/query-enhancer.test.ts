import { describe, it, expect } from "vitest";
import { enhanceQueryForRetry } from "./query-enhancer";

describe("enhanceQueryForRetry", () => {
  it("adds city when missing (firma)", () => {
    const result = enhanceQueryForRetry("en iyi yerden ısıtma firması", {
      name: "ISITMAX",
      city: "İstanbul",
      userType: "firma",
    });
    expect(result).toContain("İstanbul");
    expect(result).toContain("somut firma ismi vererek listele");
  });

  it("does NOT re-add city if already present (Turkish-aware)", () => {
    const result = enhanceQueryForRetry("istanbul'da en iyi yerden ısıtma", {
      name: "ISITMAX",
      city: "İstanbul",
      userType: "firma",
    });
    // "İstanbul" tekrar eklenmemeli — zaten var (Turkish normalize ile "istanbul" match eder)
    const matches = result.match(/istanbul/gi);
    expect(matches?.length ?? 0).toBe(1);
  });

  it("adds action word when missing", () => {
    const result = enhanceQueryForRetry("yerden ısıtma yapan firma", {
      name: "ISITMAX",
      userType: "firma",
    });
    expect(result).toContain("5 tane öner");
  });

  it("does NOT add action word when already present", () => {
    const result = enhanceQueryForRetry("en iyi 5 firma listele", {
      name: "ISITMAX",
      userType: "firma",
    });
    expect(result).not.toContain("5 tane öner");
    expect(result).toContain("somut firma ismi vererek listele");
  });

  it("uses 'kişi ismi' for kisi type", () => {
    const result = enhanceQueryForRetry("en iyi diş hekimi", {
      name: "Dr Ayşe",
      city: "Balıkesir",
      userType: "kisi",
    });
    expect(result).toContain("somut kişi ismi vererek listele");
  });

  it("uses 'firma ismi' for eticaret type", () => {
    const result = enhanceQueryForRetry("en iyi marka", {
      name: "ISITMAX",
      userType: "eticaret",
    });
    expect(result).toContain("somut firma ismi vererek listele");
  });

  it("does NOT add city for eticaret (no city required)", () => {
    const result = enhanceQueryForRetry("en iyi marka", {
      name: "ISITMAX",
      city: "İstanbul",
      userType: "eticaret",
    });
    expect(result).not.toContain("İstanbul");
  });

  it("preserves original query text at start", () => {
    const original = "villa banyosu yerden ısıtma";
    const result = enhanceQueryForRetry(original, {
      name: "ISITMAX",
      city: "İstanbul",
      userType: "firma",
    });
    expect(result.startsWith(original)).toBe(true);
  });

  it("handles all fields present", () => {
    const result = enhanceQueryForRetry("en iyi diş hekimi öner", {
      name: "Dr Ayşe",
      city: "Balıkesir",
      userType: "kisi",
    });
    // city ve action zaten var → sadece "somut kişi ismi" eklenir
    expect(result).toContain("Balıkesir");
    expect(result).toContain("somut kişi ismi vererek listele");
  });
});
