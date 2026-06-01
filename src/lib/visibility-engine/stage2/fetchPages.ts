function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface FetchedPage {
  url: string;
  text: string;
}

/** Fetch one page's readable text (capped), best-effort. */
export async function fetchPage(url: string, maxChars = 6000): Promise<FetchedPage> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VisibilityBot/0.1)' },
      redirect: 'follow',
    });
    if (!res.ok) return { url, text: '' };
    return { url, text: htmlToText(await res.text()).slice(0, maxChars) };
  } catch {
    return { url, text: '' };
  }
}

/** Fetch up to `max` competitor URLs for one query. */
export async function fetchCompetitorPages(
  urls: string[],
  max = 2,
): Promise<FetchedPage[]> {
  const out: FetchedPage[] = [];
  for (const u of urls.slice(0, max)) {
    const p = await fetchPage(u);
    if (p.text) out.push(p);
  }
  return out;
}
