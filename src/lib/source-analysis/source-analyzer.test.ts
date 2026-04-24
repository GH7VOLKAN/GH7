import { describe, it, expect } from "vitest";
import { analyzeFetchedSource } from "./source-analyzer";
import { htmlToText } from "./url-fetcher";

describe("htmlToText", () => {
  it("script + style bloklarını kaldırır", () => {
    const html = `<html><head><style>body{color:red}</style><script>alert(1)</script></head><body>Merhaba <b>dünya</b></body></html>`;
    expect(htmlToText(html)).toBe("Merhaba dünya");
  });

  it("HTML entity'leri decode eder", () => {
    expect(htmlToText("<p>Ş&amp;T&nbsp;test</p>")).toBe("Ş&T test");
  });

  it("numerik entity decode eder (&#50;) ", () => {
    expect(htmlToText("&#65;BC")).toBe("ABC");
  });

  it("çoklu boşluğu tek boşluğa indirir", () => {
    expect(htmlToText("<p>a</p>\n\n\n<p>b</p>")).toBe("a b");
  });
});

describe("analyzeFetchedSource", () => {
  const brand = "İdavilla";
  const aliases = ["Ida Villa", "Idavilla Bungalov"];
  const competitors = [
    { name: "Hak Enerji" },
    { name: "Antik Vadi" },
  ];

  it("unreachable → neutral + 0 length", () => {
    const out = analyzeFetchedSource(
      { status: "unreachable", reason: "HTTP 403" },
      brand,
      aliases,
      competitors,
    );
    expect(out.status).toBe("unreachable");
    expect(out.mentionsBrand).toBe(false);
    expect(out.mentionedCompetitors).toEqual([]);
    expect(out.qualitySignals.textLength).toBe(0);
  });

  it("analyzed + marka var + hiç rakip", () => {
    const text =
      "Idavilla Bungalov Evleri Edremit'te en sevilen konaklamalardan biridir.";
    const out = analyzeFetchedSource(
      {
        status: "ok",
        text,
        htmlLength: text.length,
        hasImages: true,
      },
      brand,
      aliases,
      competitors,
    );
    expect(out.status).toBe("analyzed");
    expect(out.mentionsBrand).toBe(true);
    expect(out.mentionedCompetitors).toEqual([]);
    expect(out.qualitySignals.hasImages).toBe(true);
  });

  it("Türkçe normalize: İ/I eşleşir", () => {
    const text = "IDAVILLA BUNGALOV EVLERI Edremit";
    const out = analyzeFetchedSource(
      { status: "ok", text, htmlLength: 100, hasImages: false },
      brand,
      aliases,
      competitors,
    );
    expect(out.mentionsBrand).toBe(true);
  });

  it("rakip mention tespiti", () => {
    const text =
      "En iyi tesisler: Hak Enerji, Antik Vadi ve başkaları. Tavsiye ederim.";
    const out = analyzeFetchedSource(
      { status: "ok", text, htmlLength: 100, hasImages: false },
      brand,
      aliases,
      competitors,
    );
    expect(out.mentionsBrand).toBe(false);
    expect(out.mentionedCompetitors).toEqual(["Hak Enerji", "Antik Vadi"]);
  });

  it("review + rating sinyalleri", () => {
    const text =
      "Rating: 4.5/5 — 120 reviews. Çok güzel bir yer. Yorumlara göre harika.";
    const out = analyzeFetchedSource(
      { status: "ok", text, htmlLength: 200, hasImages: false },
      brand,
      aliases,
      competitors,
    );
    expect(out.qualitySignals.hasReviews).toBe(true);
    expect(out.qualitySignals.hasRating).toBe(true);
  });

  it("review/rating yoksa false", () => {
    const out = analyzeFetchedSource(
      {
        status: "ok",
        text: "Sadece düz bir metin.",
        htmlLength: 50,
        hasImages: false,
      },
      brand,
      aliases,
      competitors,
    );
    expect(out.qualitySignals.hasReviews).toBe(false);
    expect(out.qualitySignals.hasRating).toBe(false);
  });
});
