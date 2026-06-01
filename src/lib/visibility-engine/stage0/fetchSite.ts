/** Normalize a user-typed domain into a full URL. */
function normalizeUrl(input: string): string {
  let u = input.trim();
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return u.replace(/\/+$/, '');
}

/** Strip HTML to readable text. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Find same-host internal links likely to describe the business. */
function pickInternalLinks(html: string, baseUrl: string): string[] {
  const host = new URL(baseUrl).host;
  const hints =
    /(urun|ürün|product|kategori|category|hakki|hakkı|about|hizmet|service|cozum|çözüm|catalog|katalog)/i;
  const links = new Set<string>();

  for (const m of html.matchAll(/href=["']([^"']+)["']/gi)) {
    try {
      const abs = new URL(m[1], baseUrl);
      if (abs.host === host && hints.test(abs.pathname)) {
        links.add(abs.toString().replace(/\/+$/, ''));
      }
    } catch {
      /* ignore malformed */
    }
    if (links.size >= 4) break;
  }
  return [...links];
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VisibilityBot/0.1)' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return htmlToText(await res.text());
}

export interface SiteContent {
  url: string;
  host: string;
  text: string;
  pagesFetched: string[];
}

/**
 * Fetch homepage + up to 4 key internal pages, concatenate text (capped).
 */
export async function fetchSite(input: string, maxChars = 12000): Promise<SiteContent> {
  const url = normalizeUrl(input);
  const host = new URL(url).host;

  const homeRes = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VisibilityBot/0.1)' },
    redirect: 'follow',
  });
  if (!homeRes.ok) throw new Error(`Homepage fetch failed: ${homeRes.status}`);
  const homeHtml = await homeRes.text();

  const pages = [url];
  let text = htmlToText(homeHtml);

  for (const link of pickInternalLinks(homeHtml, url)) {
    if (text.length >= maxChars) break;
    try {
      text += '\n\n--- ' + link + ' ---\n' + (await fetchText(link));
      pages.push(link);
    } catch {
      /* skip failed pages */
    }
  }

  return { url, host, text: text.slice(0, maxChars), pagesFetched: pages };
}
