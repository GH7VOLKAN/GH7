export interface AuditCheckResult {
  label: string;
  status: "pass" | "fail" | "partial";
  score: number; // 0, 5, or 10
  detail: string;
  recommendation: string | null;
  raasEligible: boolean;
}

export interface AuditCategoryResult {
  name: string;
  checks: AuditCheckResult[];
}

export interface AuditResult {
  categories: AuditCategoryResult[];
}

async function safeFetch(
  url: string,
): Promise<{ ok: boolean; text: string; status: number }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GH7Bot/1.0; +https://gh7.ai)",
      },
      redirect: "follow",
    });
    const text = await res.text();
    return { ok: res.ok, text, status: res.status };
  } catch {
    return { ok: false, text: "", status: 0 };
  }
}

function check(
  label: string,
  status: "pass" | "fail" | "partial",
  detail: string,
  recommendation: string | null,
  raasEligible = false,
): AuditCheckResult {
  const score = status === "pass" ? 10 : status === "partial" ? 5 : 0;
  return { label, status, score, detail, recommendation, raasEligible };
}

function checkJsonLd(
  html: string,
  type: string,
  label: string,
  raasEligible: boolean,
): AuditCheckResult {
  const regex = new RegExp(`"@type"\\s*:\\s*"${type}"`, "i");
  if (regex.test(html)) {
    return check(label, "pass", `${type} schema bulundu.`, null, raasEligible);
  }
  return check(
    label,
    "fail",
    `${type} schema bulunamadı.`,
    `Sayfanıza ${type} yapılandırılmış veri (JSON-LD) ekleyin.`,
    raasEligible,
  );
}

function checkStructuredData(html: string): AuditCategoryResult {
  return {
    name: "Yapılandırılmış Veri",
    checks: [
      checkJsonLd(html, "Product", "Product Schema", true),
      checkJsonLd(html, "Organization", "Organization Schema", false),
      checkJsonLd(html, "FAQPage", "FAQ Schema", true),
      checkJsonLd(html, "BreadcrumbList", "Breadcrumb Schema", true),
    ],
  };
}

function checkContent(html: string): AuditCategoryResult {
  const checks: AuditCheckResult[] = [];

  // Meta description
  const metaMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i,
  ) ?? html.match(
    /<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i,
  );
  if (metaMatch) {
    const len = metaMatch[1].length;
    if (len >= 50 && len <= 160) {
      checks.push(
        check("Meta Açıklaması", "pass", `Meta açıklaması bulundu (${len} karakter).`, null),
      );
    } else {
      checks.push(
        check(
          "Meta Açıklaması",
          "partial",
          `Meta açıklaması ${len} karakter (ideal: 50-160).`,
          "Meta açıklamasını 50-160 karakter arasında tutun.",
        ),
      );
    }
  } else {
    checks.push(
      check(
        "Meta Açıklaması",
        "fail",
        "Meta açıklaması bulunamadı.",
        "Sayfanıza description meta etiketi ekleyin.",
      ),
    );
  }

  // H1 count
  const h1Matches = html.match(/<h1[\s>]/gi);
  const h1Count = h1Matches?.length ?? 0;
  if (h1Count === 1) {
    checks.push(check("Başlık Hiyerarşisi (H1)", "pass", "Tek H1 etiketi bulundu.", null));
  } else if (h1Count > 1) {
    checks.push(
      check(
        "Başlık Hiyerarşisi (H1)",
        "partial",
        `${h1Count} adet H1 etiketi bulundu.`,
        "Sayfada yalnızca 1 adet H1 etiketi kullanın.",
      ),
    );
  } else {
    checks.push(
      check(
        "Başlık Hiyerarşisi (H1)",
        "fail",
        "H1 etiketi bulunamadı.",
        "Sayfanıza ana başlık olarak bir H1 etiketi ekleyin.",
      ),
    );
  }

  // Word count
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyText = bodyMatch
    ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  if (wordCount > 300) {
    checks.push(
      check("Kelime Sayısı", "pass", `${wordCount} kelime bulundu.`, null),
    );
  } else if (wordCount >= 100) {
    checks.push(
      check(
        "Kelime Sayısı",
        "partial",
        `${wordCount} kelime bulundu (ideal: 300+).`,
        "Sayfanızdaki içerik miktarını artırın (en az 300 kelime).",
      ),
    );
  } else {
    checks.push(
      check(
        "Kelime Sayısı",
        "fail",
        `Yalnızca ${wordCount} kelime bulundu.`,
        "Sayfanıza daha fazla özgün içerik ekleyin (en az 300 kelime).",
      ),
    );
  }

  return { name: "İçerik", checks };
}

async function checkTechnical(
  domain: string,
  html: string,
): Promise<{ category: AuditCategoryResult; robotsText: string }> {
  const checks: AuditCheckResult[] = [];

  // HTTPS
  const httpsRes = await safeFetch(`https://${domain}`);
  checks.push(
    httpsRes.ok
      ? check("HTTPS", "pass", "Site HTTPS üzerinden erişilebilir.", null)
      : check(
          "HTTPS",
          "fail",
          "Site HTTPS üzerinden erişilemiyor.",
          "SSL sertifikası ekleyerek HTTPS'yi etkinleştirin.",
        ),
  );

  // Canonical URL
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  checks.push(
    canonicalMatch
      ? check("Canonical URL", "pass", "Canonical URL etiketi bulundu.", null)
      : check(
          "Canonical URL",
          "fail",
          "Canonical URL etiketi bulunamadı.",
          'Sayfanıza <link rel="canonical"> etiketi ekleyin.',
          true,
        ),
  );

  // robots.txt
  const robotsRes = await safeFetch(`https://${domain}/robots.txt`);
  checks.push(
    robotsRes.ok
      ? check("robots.txt", "pass", "robots.txt dosyası bulundu.", null)
      : check(
          "robots.txt",
          "fail",
          "robots.txt dosyası bulunamadı.",
          "Site kök dizinine robots.txt dosyası ekleyin.",
          true,
        ),
  );

  // sitemap.xml
  const sitemapRes = await safeFetch(`https://${domain}/sitemap.xml`);
  const hasSitemapInRobots = robotsRes.text
    .toLowerCase()
    .includes("sitemap:");
  checks.push(
    sitemapRes.ok || hasSitemapInRobots
      ? check("sitemap.xml", "pass", "Sitemap bulundu.", null)
      : check(
          "sitemap.xml",
          "fail",
          "sitemap.xml bulunamadı.",
          "XML sitemap oluşturun ve robots.txt'ye ekleyin.",
          true,
        ),
  );

  return { category: { name: "Teknik", checks }, robotsText: robotsRes.text };
}

function checkExternalPlatforms(html: string): AuditCategoryResult {
  const checks: AuditCheckResult[] = [];

  // Social media links
  const socialPatterns = [
    "facebook.com",
    "instagram.com",
    "linkedin.com",
    "twitter.com",
    "x.com",
    "youtube.com",
  ];
  const foundSocials = socialPatterns.filter((p) =>
    html.toLowerCase().includes(p),
  );
  if (foundSocials.length >= 3) {
    checks.push(
      check(
        "Sosyal Medya Linkleri",
        "pass",
        `${foundSocials.length} sosyal medya linki bulundu.`,
        null,
      ),
    );
  } else if (foundSocials.length >= 1) {
    checks.push(
      check(
        "Sosyal Medya Linkleri",
        "partial",
        `Yalnızca ${foundSocials.length} sosyal medya linki bulundu.`,
        "Daha fazla sosyal medya profil linki ekleyin (en az 3).",
      ),
    );
  } else {
    checks.push(
      check(
        "Sosyal Medya Linkleri",
        "fail",
        "Sosyal medya linki bulunamadı.",
        "Sayfanıza sosyal medya profil linklerinizi ekleyin.",
      ),
    );
  }

  // Google Business indicators
  const gbpPatterns = [
    "maps.google",
    "google.com/maps",
    "goo.gl/maps",
    '"LocalBusiness"',
    '"@type":"LocalBusiness"',
  ];
  const hasGbp = gbpPatterns.some((p) => html.toLowerCase().includes(p.toLowerCase()));
  checks.push(
    hasGbp
      ? check(
          "Google Business Göstergeleri",
          "pass",
          "Google Maps veya LocalBusiness verisi bulundu.",
          null,
        )
      : check(
          "Google Business Göstergeleri",
          "fail",
          "Google Business göstergesi bulunamadı.",
          "Google Haritalar linki veya LocalBusiness yapılandırılmış verisi ekleyin.",
        ),
  );

  return { name: "Dış Platform", checks };
}

async function checkAIAccess(
  domain: string,
  html: string,
  robotsText: string,
): Promise<AuditCategoryResult> {
  const checks: AuditCheckResult[] = [];

  // 1. llms.txt check
  const llmsRes = await safeFetch(`https://${domain}/llms.txt`);
  checks.push(
    llmsRes.ok
      ? check("llms.txt", "pass", "llms.txt dosyası bulundu.", null)
      : check(
          "llms.txt",
          "fail",
          "llms.txt dosyası bulunamadı.",
          "Sitenize llms.txt dosyasi ekleyin. Bu dosya yapay zekalarin sitenizi daha iyi anlamasini saglar.",
        ),
  );

  // 2. AI Crawler check in robots.txt
  const aiCrawlers = ["GPTBot", "ClaudeBot", "Google-Extended", "PerplexityBot"];
  const lines = robotsText.split("\n").map((l) => l.trim());

  let currentUserAgent = "";
  const blockedAgents = new Set<string>();

  for (const line of lines) {
    const uaMatch = line.match(/^user-agent:\s*(.+)/i);
    if (uaMatch) {
      currentUserAgent = uaMatch[1].trim().toLowerCase();
      continue;
    }
    const disallowMatch = line.match(/^disallow:\s*\/\s*$/i);
    if (disallowMatch) {
      if (currentUserAgent === "*") {
        // Wildcard block — applies to all unless overridden
        for (const crawler of aiCrawlers) {
          blockedAgents.add(crawler.toLowerCase());
        }
      } else {
        blockedAgents.add(currentUserAgent);
      }
    }
  }

  const allowedCrawlers = aiCrawlers.filter(
    (c) => !blockedAgents.has(c.toLowerCase()),
  );

  if (allowedCrawlers.length === aiCrawlers.length && robotsText.length > 0) {
    checks.push(
      check(
        "Yapay Zeka Bot Erişimi",
        "pass",
        `Tüm yapay zeka botlarına erişim açık (${aiCrawlers.join(", ")}).`,
        null,
      ),
    );
  } else if (allowedCrawlers.length > 0 && allowedCrawlers.length < aiCrawlers.length) {
    const blocked = aiCrawlers.filter((c) => blockedAgents.has(c.toLowerCase()));
    checks.push(
      check(
        "Yapay Zeka Bot Erişimi",
        "partial",
        `Bazı yapay zeka botları engelleniyor: ${blocked.join(", ")}.`,
        "robots.txt dosyanizda yapay zeka botlarina (GPTBot, ClaudeBot, Google-Extended, PerplexityBot) erisim izni verin.",
      ),
    );
  } else {
    checks.push(
      check(
        "Yapay Zeka Bot Erişimi",
        "fail",
        robotsText.length === 0
          ? "robots.txt bulunamadı, yapay zeka bot erişimi belirlenemedi."
          : "Tüm yapay zeka botları engelleniyor.",
        "robots.txt dosyanizda yapay zeka botlarina (GPTBot, ClaudeBot, Google-Extended, PerplexityBot) erisim izni verin.",
      ),
    );
  }

  // 3. Open Graph / Social Preview check
  const hasOgTitle = /<meta\s[^>]*property=["']og:title["'][^>]*>/i.test(html) ||
    /<meta\s[^>]*content=["'][^"']*["']\s[^>]*property=["']og:title["'][^>]*>/i.test(html);
  const hasOgDesc = /<meta\s[^>]*property=["']og:description["'][^>]*>/i.test(html) ||
    /<meta\s[^>]*content=["'][^"']*["']\s[^>]*property=["']og:description["'][^>]*>/i.test(html);
  const hasOgImage = /<meta\s[^>]*property=["']og:image["'][^>]*>/i.test(html) ||
    /<meta\s[^>]*content=["'][^"']*["']\s[^>]*property=["']og:image["'][^>]*>/i.test(html);

  const ogCount = [hasOgTitle, hasOgDesc, hasOgImage].filter(Boolean).length;
  const ogMissing: string[] = [];
  if (!hasOgTitle) ogMissing.push("og:title");
  if (!hasOgDesc) ogMissing.push("og:description");
  if (!hasOgImage) ogMissing.push("og:image");

  if (ogCount === 3) {
    checks.push(
      check(
        "Open Graph Etiketleri",
        "pass",
        "Tüm Open Graph etiketleri bulundu (og:title, og:description, og:image).",
        null,
      ),
    );
  } else if (ogCount >= 1) {
    checks.push(
      check(
        "Open Graph Etiketleri",
        "partial",
        `Eksik Open Graph etiketleri: ${ogMissing.join(", ")}.`,
        "Sayfaniza Open Graph etiketleri (og:title, og:description, og:image) ekleyin. Yapay zekalar bu bilgileri kullanir.",
      ),
    );
  } else {
    checks.push(
      check(
        "Open Graph Etiketleri",
        "fail",
        "Open Graph etiketleri bulunamadı.",
        "Sayfaniza Open Graph etiketleri (og:title, og:description, og:image) ekleyin. Yapay zekalar bu bilgileri kullanir.",
      ),
    );
  }

  return { name: "Yapay Zeka Erişimi", checks };
}

export async function runSiteAudit(domain: string): Promise<AuditResult> {
  // Fetch homepage
  const homeRes = await safeFetch(`https://${domain}`);

  if (!homeRes.ok) {
    // Site unreachable — return all fail
    const failCheck = (label: string, raas = false): AuditCheckResult =>
      check(label, "fail", "Site erişilemedi.", "Sitenizin erişilebilir olduğundan emin olun.", raas);

    return {
      categories: [
        {
          name: "Yapılandırılmış Veri",
          checks: [
            failCheck("Product Schema", true),
            failCheck("Organization Schema"),
            failCheck("FAQ Schema", true),
            failCheck("Breadcrumb Schema", true),
          ],
        },
        {
          name: "İçerik",
          checks: [
            failCheck("Meta Açıklaması"),
            failCheck("Başlık Hiyerarşisi (H1)"),
            failCheck("Kelime Sayısı"),
          ],
        },
        {
          name: "Teknik",
          checks: [
            failCheck("HTTPS"),
            failCheck("Canonical URL", true),
            failCheck("robots.txt", true),
            failCheck("sitemap.xml", true),
          ],
        },
        {
          name: "Dış Platform",
          checks: [
            failCheck("Sosyal Medya Linkleri"),
            failCheck("Google Business Göstergeleri"),
          ],
        },
        {
          name: "Yapay Zeka Erişimi",
          checks: [
            failCheck("llms.txt"),
            failCheck("Yapay Zeka Bot Erişimi"),
            failCheck("Open Graph Etiketleri"),
          ],
        },
      ],
    };
  }

  const html = homeRes.text;

  const technicalResult = await checkTechnical(domain, html);
  const aiAccess = await checkAIAccess(domain, html, technicalResult.robotsText);

  return {
    categories: [
      checkStructuredData(html),
      checkContent(html),
      technicalResult.category,
      checkExternalPlatforms(html),
      aiAccess,
    ],
  };
}
