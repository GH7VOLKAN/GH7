/**
 * DataForSEO REST API client (Brief G Aşama 2).
 *
 * Docs: https://docs.dataforseo.com/v3/
 *
 * Kullanılan endpoint'ler:
 * - /on_page/task_post + /on_page/summary + /on_page/pages + /on_page/resources
 *   Site teknik taraması (crawl), JS rendering, schema/head detection
 * - /backlinks/summary/live — otorite verisi (DR, referring domains, anchor text)
 *
 * Ayrıca direkt fetch ile:
 * - robots.txt / llms.txt / llms-full.txt varlık kontrolü
 */

const API_BASE = "https://api.dataforseo.com/v3";

function auth(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD env missing");
  }
  return Buffer.from(`${login}:${password}`).toString("base64");
}

type DfsResponse<T = unknown> = {
  status_code: number;
  status_message?: string;
  tasks?: Array<{
    id: string;
    status_code: number;
    status_message?: string;
    result?: T[];
  }>;
};

async function dfsRequest<T = unknown>(
  path: string,
  body: unknown,
): Promise<DfsResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`DataForSEO ${path} ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as DfsResponse<T>;
}

// ───────────────────────────────────────────────────────
// On-Page (site crawl)
// ───────────────────────────────────────────────────────

function normalizeDomain(raw: string): string {
  return raw
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/^www\./, "");
}

export type OnPageResult = {
  summary: Record<string, unknown> | null;
  pages: Array<Record<string, unknown>>;
  resources: Array<Record<string, unknown>>;
};

export async function runOnPageScan(domain: string): Promise<OnPageResult> {
  const target = normalizeDomain(domain);

  // 1. Task oluştur
  const create = await dfsRequest<{ id?: string }>("/on_page/task_post", [
    {
      target,
      max_crawl_pages: 50,
      respect_sitemap: true,
      load_resources: true,
      enable_javascript: true,
      enable_browser_rendering: true,
      store_raw_html: false,
    },
  ]);

  const taskId = create.tasks?.[0]?.id;
  if (!taskId) throw new Error("On-Page task_post döndürmedi");

  // 2. Bitmesini bekle (max ~90s)
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const summary = await dfsRequest<{
      crawl_progress?: string;
      crawl_status?: { max_crawl_pages?: number; pages_crawled?: number };
    }>("/on_page/summary", [{ id: taskId }]);
    const progress = summary.tasks?.[0]?.result?.[0]?.crawl_progress;
    if (progress === "finished") break;
  }

  // 3. Detay çek (paralel)
  const [summary, pages, resources] = await Promise.all([
    dfsRequest<Record<string, unknown>>("/on_page/summary", [{ id: taskId }]),
    dfsRequest<{ items?: Array<Record<string, unknown>> }>(
      "/on_page/pages",
      [{ id: taskId, limit: 50 }],
    ),
    dfsRequest<{ items?: Array<Record<string, unknown>> }>(
      "/on_page/resources",
      [{ id: taskId, limit: 100 }],
    ),
  ]);

  return {
    summary: summary.tasks?.[0]?.result?.[0] ?? null,
    pages: pages.tasks?.[0]?.result?.[0]?.items ?? [],
    resources: resources.tasks?.[0]?.result?.[0]?.items ?? [],
  };
}

// ───────────────────────────────────────────────────────
// Backlinks
// ───────────────────────────────────────────────────────

export type BacklinksSummary = Record<string, unknown> | null;

export async function runBacklinksCheck(
  domain: string,
): Promise<BacklinksSummary> {
  const target = normalizeDomain(domain);
  try {
    const result = await dfsRequest<Record<string, unknown>>(
      "/backlinks/summary/live",
      [{ target, internal_list_limit: 10 }],
    );
    return result.tasks?.[0]?.result?.[0] ?? null;
  } catch (err) {
    console.error("[dfs/backlinks] error:", err);
    return null;
  }
}

// ───────────────────────────────────────────────────────
// Robots / llms / llms-full kontrol (direkt fetch, DFS değil)
// ───────────────────────────────────────────────────────

export type RobotsResult = {
  exists: boolean;
  content: string | null;
  allowsGPTBot: boolean;
  allowsClaudeBot: boolean;
  allowsPerplexityBot: boolean;
  allowsGoogleExtended: boolean;
};

function isBotAllowed(robotsContent: string, botName: string): boolean {
  // "User-agent: BotName" bloğunu bul, altında "Disallow: /" varsa engellenmiş.
  const re = new RegExp(
    `User-agent:\\s*${botName}\\s*\\n([\\s\\S]*?)(?=\\n\\s*User-agent:|$)`,
    "i",
  );
  const match = robotsContent.match(re);
  if (!match) {
    // Bot için özel kural yok; "User-agent: *" kuralına bakılır.
    const wildcard = robotsContent.match(
      /User-agent:\s*\*\s*\n([\s\S]*?)(?=\n\s*User-agent:|$)/i,
    );
    if (!wildcard) return true; // hiçbir kural yok → izin
    return !/Disallow:\s*\//i.test(wildcard[1]);
  }
  return !/Disallow:\s*\//i.test(match[1]);
}

export async function checkRobotsTxt(domain: string): Promise<RobotsResult> {
  const normalized = normalizeDomain(domain);
  const url = `https://${normalized}/robots.txt`;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "GH7-Audit/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return {
        exists: false,
        content: null,
        allowsGPTBot: true,
        allowsClaudeBot: true,
        allowsPerplexityBot: true,
        allowsGoogleExtended: true,
      };
    }
    const content = await res.text();
    return {
      exists: true,
      content,
      allowsGPTBot: isBotAllowed(content, "GPTBot"),
      allowsClaudeBot:
        isBotAllowed(content, "ClaudeBot") ||
        isBotAllowed(content, "Claude-Web"),
      allowsPerplexityBot: isBotAllowed(content, "PerplexityBot"),
      allowsGoogleExtended: isBotAllowed(content, "Google-Extended"),
    };
  } catch {
    return {
      exists: false,
      content: null,
      allowsGPTBot: true,
      allowsClaudeBot: true,
      allowsPerplexityBot: true,
      allowsGoogleExtended: true,
    };
  }
}

export type FileCheckResult = {
  exists: boolean;
  content: string | null;
  length: number;
};

async function checkStaticFile(
  domain: string,
  path: string,
): Promise<FileCheckResult> {
  const normalized = normalizeDomain(domain);
  const url = `https://${normalized}${path}`;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "GH7-Audit/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { exists: false, content: null, length: 0 };
    const content = await res.text();
    return { exists: true, content, length: content.length };
  } catch {
    return { exists: false, content: null, length: 0 };
  }
}

export function checkLlmsTxt(domain: string) {
  return checkStaticFile(domain, "/llms.txt");
}

export function checkLlmsFullTxt(domain: string) {
  return checkStaticFile(domain, "/llms-full.txt");
}
