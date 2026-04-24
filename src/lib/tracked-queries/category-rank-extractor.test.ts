import { describe, it, expect } from "vitest";
import { extractRankFromTextFast } from "./category-rank-extractor";

describe("extractRankFromTextFast — numaralı liste", () => {
  it("marka 3. sırada", () => {
    const text = `Türkiye'de önerilen bungalov tesisleri:

1. Hak Enerji Bungalov — Kazdağları'nda
2. İda Tahtalıköy — Ege kıyısı
3. İdavilla — Edremit bölgesi
4. Antik Vadi — Ayvalık
`;
    const r = extractRankFromTextFast(text, "İdavilla");
    expect(r.brandMentioned).toBe(true);
    expect(r.rank).toBe(3);
    expect(r.listLength).toBe(4);
    expect(r.source).toBe("regex");
  });

  it("marka listede yok, listeden başka yerde de geçmiyor", () => {
    const text = `Öneriler:

1. Hak Enerji Bungalov
2. Antik Vadi
3. Yeşil Orman
`;
    const r = extractRankFromTextFast(text, "İdavilla");
    expect(r.brandMentioned).toBe(false);
    expect(r.rank).toBeNull();
    expect(r.listLength).toBe(3);
  });

  it("Türkçe normalize — İ/ı, ş/s, ğ/g", () => {
    const text = `1. Idavilla Bungalov Evleri
2. Başka Bir Tesis
`;
    const r = extractRankFromTextFast(text, "İdavilla");
    expect(r.brandMentioned).toBe(true);
    expect(r.rank).toBe(1);
  });
});

describe("extractRankFromTextFast — bullet liste", () => {
  it("- bullet ile marka 2. sırada", () => {
    const text = `Listemde şunlar var:

- Hak Enerji
- İdavilla
- Antik Vadi
`;
    const r = extractRankFromTextFast(text, "İdavilla");
    expect(r.rank).toBe(2);
    expect(r.listLength).toBe(3);
  });

  it("• unicode bullet da destekleniyor", () => {
    const text = `• İdavilla
• Diğer
`;
    const r = extractRankFromTextFast(text, "İdavilla");
    expect(r.rank).toBe(1);
  });
});

describe("extractRankFromTextFast — liste olmayan serbest metin", () => {
  it("marka metinde geçiyor ama liste yok", () => {
    const text =
      "İdavilla, Edremit'te yer alan bir bungalov tesisidir. Aile dostudur.";
    const r = extractRankFromTextFast(text, "İdavilla");
    expect(r.brandMentioned).toBe(true);
    expect(r.rank).toBeNull();
    expect(r.listLength).toBeNull();
  });

  it("marka hiç geçmiyor", () => {
    const text = "Kesin öneri veremem, güncel bilgi lazım.";
    const r = extractRankFromTextFast(text, "İdavilla");
    expect(r.brandMentioned).toBe(false);
    expect(r.rank).toBeNull();
    expect(r.source).toBe("none");
  });
});

describe("extractRankFromTextFast — edge cases", () => {
  it("bold + açıklama sonrası isim çekilir", () => {
    const text = `1. **İdavilla**: Edremit'te özel havuzlu bungalov
2. **Hak Enerji** — Kazdağları
`;
    const r = extractRankFromTextFast(text, "İdavilla");
    expect(r.rank).toBe(1);
  });

  it("1) ... formatı da destekleniyor", () => {
    const text = `1) Hak Enerji
2) İdavilla
`;
    const r = extractRankFromTextFast(text, "İdavilla");
    expect(r.rank).toBe(2);
  });

  it("liste başında boşluk olsa bile çalışır", () => {
    const text = `   1. İdavilla
   2. Başka
`;
    const r = extractRankFromTextFast(text, "İdavilla");
    expect(r.rank).toBe(1);
  });
});
