/**
 * URL fetcher — Brief N v4 Aşama 6.
 *
 * Bir kaynak URL'sini AbortSignal.timeout ile getirir, HTML→metin parse
 * eder. Bot engelleyen siteler (Tripadvisor, Booking, Cloudflare Turnstile)
 * için "unreachable" status döner — upstream analyzer bunu neutral sayar.
 *
 * Cache: 24 saat SourceAnalysis.cachedUntil ile DB-level. Bu modül
 * sadece network + parse — cache kararı runner'da.
 */

export type FetchResult =
  | { status: "ok"; text: string; htmlLength: number; hasImages: boolean }
  | { status: "unreachable"; reason: string };

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_HTML_SIZE = 2_000_000; // 2 MB

const USER_AGENT =
  "Mozilla/5.0 (compatible; GH7Bot/1.0; +https://gh7.ai/bot)";

/**
 * Basit HTML → metin dönüşümü:
 *   - <script>, <style>, <noscript> bloklarını kaldırır
 *   - Tüm HTML tag'lerini temizler
 *   - HTML entity'leri decode eder (basit set)
 *   - Çoklu whitespace'i tek boşluğa indirir
 */
export function htmlToText(html: string): string {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ");

  // HTML entities (yaygın)
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&(?:#(\d+)|#x([0-9a-fA-F]+));/g, (_, dec, hex) => {
      const code = hex ? parseInt(hex, 16) : parseInt(dec, 10);
      return Number.isFinite(code) && code > 31 && code < 0x10ffff
        ? String.fromCodePoint(code)
        : " ";
    });

  return s.replace(/\s+/g, " ").trim();
}

export async function fetchSource(
  url: string,
  opts?: { timeoutMs?: number },
): Promise<FetchResult> {
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml",
        "accept-language": "tr-TR,tr;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
    });

    if (!res.ok) {
      return {
        status: "unreachable",
        reason: `HTTP ${res.status}`,
      };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("html") && !contentType.includes("text")) {
      return {
        status: "unreachable",
        reason: `non-html content-type: ${contentType.slice(0, 60)}`,
      };
    }

    const html = (await res.text()).slice(0, MAX_HTML_SIZE);
    const text = htmlToText(html);
    const hasImages = /<img\s/i.test(html);

    return {
      status: "ok",
      text,
      htmlLength: html.length,
      hasImages,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: "unreachable", reason: msg.slice(0, 200) };
  }
}
