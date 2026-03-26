/**
 * GH7.ai — Google PageSpeed Insights Entegrasyonu
 *
 * Site saglik skorunu olcmek icin Google PageSpeed API kullanir.
 * Performans, erisilebilirlik, en iyi uygulamalar ve SEO skorlari dondurur.
 */

export interface PageSpeedResult {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  lcp: number;
  cls: number;
}

/**
 * Google PageSpeed API ile site skorlarini al.
 * Mobile strateji kullanir (AI aramalarda mobil oncelikli).
 */
export async function getPageSpeedScore(url: string): Promise<PageSpeedResult> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(`https://${url}`)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo${apiKey ? `&key=${apiKey}` : ""}`;

  const res = await fetch(apiUrl, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`PageSpeed API hatası: ${res.status}`);

  const data = await res.json();
  const cats = data.lighthouseResult?.categories;
  const audits = data.lighthouseResult?.audits;

  if (!cats) throw new Error("PageSpeed: Yanıtta kategori bulunamadı");

  return {
    performance: Math.round((cats.performance?.score || 0) * 100),
    accessibility: Math.round((cats.accessibility?.score || 0) * 100),
    bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
    seo: Math.round((cats.seo?.score || 0) * 100),
    lcp: Math.round(audits?.["largest-contentful-paint"]?.numericValue || 0),
    cls: audits?.["cumulative-layout-shift"]?.numericValue || 0,
  };
}

/**
 * PageSpeed sonuclarindan birlesik site saglik skoru hesapla.
 * Agirliklar: Performans %40, SEO %30, En iyi uygulamalar %20, Erisilebilirlik %10
 */
export function calculateSiteHealthScore(ps: PageSpeedResult): number {
  return Math.round(
    ps.performance * 0.4 +
    ps.seo * 0.3 +
    ps.bestPractices * 0.2 +
    ps.accessibility * 0.1
  );
}
