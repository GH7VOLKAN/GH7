/**
 * Brief N v4 smoke-test #3 — URL fetch bot blok kontrolü.
 *
 * Büyük 3. taraf platformların (Tripadvisor, Booking, Expedia, Etstur, vs.)
 * GH7Bot User-Agent ile erişilebilir olup olmadığını test eder. Bir kısmı
 * blok verirse scoreSourceDominance bu siteleri "unreachable" olarak neutral
 * sayar — iyi ama önemli siteler blokluyorsa UX olarak belirtmeli.
 *
 * Kullanım:
 *   npx tsx scripts/brief-n/smoke-source-fetch.ts
 */

import { fetchSource } from "../../src/lib/source-analysis/url-fetcher";

const TEST_URLS = [
  // Seyahat / konaklama (kritik — Brief N v4 C2 boyut)
  "https://www.tripadvisor.com/Tourism-g298030-Edremit_Balikesir_Province_Turkish_Aegean_Coast-Vacations.html",
  "https://www.booking.com/region/tr/edremit.tr.html",
  "https://www.hotels.com/de1658975/hotels-edremit-turkey/",
  "https://www.expedia.com/Edremit.dx6054455",
  "https://www.etstur.com/oteller/balikesir-otelleri/edremit-otelleri",
  "https://www.tatil.com/balikesir/edremit",
  "https://www.otelz.com/oteller/edremit",
  // Google ekosistemi
  "https://www.google.com/maps/search/bungalov+edremit",
  // Sektörel (örnek)
  "https://www.zomato.com/istanbul",
  // Genel haber / PR (test için)
  "https://www.hurriyet.com.tr",
  "https://www.milliyet.com.tr",
  // Wikipedia / Wikidata
  "https://tr.wikipedia.org/wiki/Edremit,_Bal%C4%B1kesir",
  "https://www.wikidata.org/wiki/Q42",
];

function pad(s: string, n: number) {
  if (s.length >= n) return s;
  return s + " ".repeat(n - s.length);
}

async function main() {
  console.log("─".repeat(70));
  console.log(`URL fetch testi — ${TEST_URLS.length} kaynak`);
  console.log("─".repeat(70));
  console.log(`${pad("DOMAIN", 40)} STATUS   SÜRE    BOYUT   IMG`);
  console.log("─".repeat(70));

  const results: Array<{ url: string; status: string; ms: number; size?: number; img?: boolean; reason?: string }> = [];

  for (const url of TEST_URLS) {
    const t0 = Date.now();
    let result;
    try {
      result = await fetchSource(url, { timeoutMs: 8000 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ url, status: "ERROR", ms: Date.now() - t0, reason: msg });
      continue;
    }
    const ms = Date.now() - t0;
    if (result.status === "ok") {
      results.push({ url, status: "OK", ms, size: result.htmlLength, img: result.hasImages });
    } else {
      results.push({ url, status: "BLOK", ms, reason: result.reason });
    }
  }

  // Tablo çıktısı
  for (const r of results) {
    const domain = new URL(r.url).hostname.replace(/^www\./, "");
    const marker =
      r.status === "OK" ? "✓ OK    " : r.status === "BLOK" ? "✗ BLOK  " : "✗ ERROR ";
    const size = r.size ? `${Math.round(r.size / 1024)}k` : "—";
    const img = r.img ? "img " : "    ";
    console.log(
      `${pad(domain, 40)} ${marker} ${pad(r.ms + "ms", 7)} ${pad(size, 7)} ${img}`,
    );
    if (r.reason) {
      console.log(`${" ".repeat(42)}└ ${r.reason.slice(0, 80)}`);
    }
  }

  console.log("─".repeat(70));

  const ok = results.filter((r) => r.status === "OK").length;
  const blocked = results.filter((r) => r.status !== "OK").length;
  const blockedCritical = results.filter(
    (r) =>
      r.status !== "OK" &&
      /tripadvisor|booking|hotels|expedia|etstur|tatil|otelz/.test(r.url),
  );

  console.log(`\nÖzet: ${ok}/${results.length} erişilebilir · ${blocked} blokta/hatada`);
  if (blockedCritical.length > 0) {
    console.log(
      `\n⚠ KRİTİK: ${blockedCritical.length} konaklama platformu blok veriyor —`,
    );
    console.log(
      "  Kaynak hakimiyeti skoru bu kaynakları 'unreachable' (neutral) sayar.",
    );
    console.log(
      "  Kullanıcıya UI'da 'bu kaynakta durumun tespit edilemedi' notu gösterilmesi önerilir.",
    );
  } else {
    console.log("\n✓ Tüm kritik konaklama platformları erişilebilir.");
  }
}

main().catch((err) => {
  console.error("\n✗ HATA:", err);
  process.exit(1);
});
