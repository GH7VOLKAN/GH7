import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

interface Ranking { name: string; position: number; platformCount: number }
interface Platform { platform: string; mentioned: boolean }

const PLATFORM_COLORS: Record<string, string> = {
  chatgpt: "#10A37F", claude: "#D97706", gemini: "#8B5CF6",
  perplexity: "#22D3EE", google_aio: "#4285F4", copilot: "#00BCF2",
};
const PLATFORM_NAMES: Record<string, string> = {
  chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini",
  perplexity: "Perplexity", google_aio: "AI Overview", copilot: "Copilot",
};

// SVG path data for each platform icon (viewBox 0 0 24 24)
const PLATFORM_SVG: Record<string, string> = {
  chatgpt: "M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z",
  gemini: "M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z",
  copilot: "M12 2C6.477 2 2 6.477 2 12c0 3.286 1.588 6.2 4.04 8.02A4.984 4.984 0 0 0 10 22h4a4.984 4.984 0 0 0 3.96-1.98A9.968 9.968 0 0 0 22 12c0-5.523-4.477-10-10-10zm-2 18a3 3 0 0 1-2.83-2H10a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H5.07A7.97 7.97 0 0 1 12 4a7.97 7.97 0 0 1 6.93 7H14a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2.83A3 3 0 0 1 14 20h-4z",
  perplexity: "M7.547 2v6.2L4 5.267V12h3.547v6.8L4 15.867V22h3.547V15.867L11.094 22V15.333h1.812V22l3.547-6.133V22H20v-6.133l-3.547 2.933V12H20V5.267L16.453 8.2V2h-3.547v6.133l-3.547-3.2V2z",
};

// Google AIO has multiple colored paths
const GOOGLE_AIO_PATHS = [
  { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z", fill: "#4285F4" },
  { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" },
  { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" },
  { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" },
];

// Claude has multiple paths + circle
const CLAUDE_PATHS = [
  "M16.171 3.072l-5.28 14.746a.483.483 0 0 1-.593.3l-.073-.026a.483.483 0 0 1-.273-.62L15.23 2.726a.483.483 0 0 1 .667-.247.483.483 0 0 1 .274.593z",
  "M21.167 10.005l-12.16 6.563a.483.483 0 0 1-.651-.193l-.037-.07a.483.483 0 0 1 .194-.65L20.672 9.09a.483.483 0 0 1 .655.193.483.483 0 0 1-.16.722z",
  "M18.469 6.2l-10.44 10.08a.483.483 0 0 1-.682-.017l-.05-.054a.483.483 0 0 1 .018-.682L17.753 5.45a.483.483 0 0 1 .699.018.483.483 0 0 1 .017.732z",
  "M14.065 3.972l-7.773 13.394a.483.483 0 0 1-.66.176l-.064-.039a.483.483 0 0 1-.176-.66l7.773-13.393a.483.483 0 0 1 .66-.177.483.483 0 0 1 .24.699z",
  "M20.698 13.352l-14.144 3.29a.483.483 0 0 1-.576-.363l-.017-.073a.483.483 0 0 1 .363-.577L20.468 12.34a.483.483 0 0 1 .577.363.483.483 0 0 1-.347.649z",
  "M11.398 3.504l-5.64 14.618a.483.483 0 0 1-.613.282l-.07-.028a.483.483 0 0 1-.282-.613L10.434 3.15a.483.483 0 0 1 .672-.229.483.483 0 0 1 .292.583z",
];

const FALLBACK = {
  title: "Yerden \u0131s\u0131tma kablosu en iyi firma hangisi?",
  rankings: [
    { name: "Warmup", position: 1, platformCount: 3 },
    { name: "ISITMAX", position: 2, platformCount: 2 },
    { name: "Giacomini", position: 3, platformCount: 2 },
  ] as Ranking[],
  platforms: [
    { platform: "chatgpt", mentioned: true },
    { platform: "gemini", mentioned: true },
    { platform: "perplexity", mentioned: true },
    { platform: "google_aio", mentioned: true },
    { platform: "claude", mentioned: true },
  ] as Platform[],
  runCount: 3,
  queryLanguage: "tr",
};

function PlatformIcon({ platform, size }: { platform: string; size: number }) {
  const color = PLATFORM_COLORS[platform] || "#666";

  if (platform === "google_aio") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
        {GOOGLE_AIO_PATHS.map((p, i) => (
          <path key={i} d={p.d} fill={p.fill} />
        ))}
      </svg>
    );
  }

  if (platform === "claude") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
        {CLAUDE_PATHS.map((d, i) => (
          <path key={i} d={d} fill={color} />
        ))}
        <circle cx="5.08" cy="18.282" r="1.207" fill={color} />
      </svg>
    );
  }

  const svgPath = PLATFORM_SVG[platform];
  if (!svgPath) return null;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
      <path d={svgPath} fill={color} />
    </svg>
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let title = FALLBACK.title;
  let rankings = FALLBACK.rankings;
  let platforms = FALLBACK.platforms;
  let runCount = FALLBACK.runCount;
  let queryLanguage = FALLBACK.queryLanguage;

  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { title: true, queryLanguage: true, rankings: true, platforms: true, runCount: true },
    });
    if (post) {
      title = post.title || title;
      const r = post.rankings as unknown as Ranking[] | null;
      const p = post.platforms as unknown as Platform[] | null;
      rankings = (r ?? []).length > 0 ? r! : FALLBACK.rankings;
      platforms = (p ?? []).length > 0 ? p! : FALLBACK.platforms;
      runCount = post.runCount || runCount;
      queryLanguage = post.queryLanguage || queryLanguage;
    }
  } catch { /* fallback */ }

  const activePlatforms = platforms.filter((p) => p.mentioned);
  const headerLabel = queryLanguage === "tr" ? "YAPAY ZEKAYA SORDUK" : "WE ASKED AI";
  const top3 = rankings.slice(0, 3);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", backgroundColor: "#212121", display: "flex", flexDirection: "column", position: "relative", fontFamily: "sans-serif" }}>
        {/* Grid pattern */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 60px", flex: 1, position: "relative" }}>

          {/* 1. GH7 Logo — en ust, ortali */}
          <svg viewBox="0 0 263 112" width={118} height={50} style={{ flexShrink: 0, marginBottom: 16 }}>
            <g fill="#FFFFFF">
              <path transform="translate(0.573, 98.017)" d="M 87.906 -50.391 L 87.906 -30.859 C 85.582 -20.172 80.492 -12.082 72.641 -6.594 C 64.785 -1.102 56.02 1.641 46.344 1.641 C 34.207 1.641 23.867 -2.898 15.328 -11.984 C 6.785 -21.078 2.516 -32.063 2.516 -44.938 C 2.516 -58.02 6.691 -69.066 15.047 -78.078 C 23.41 -87.098 33.844 -91.609 46.344 -91.609 C 60.957 -91.609 72.52 -86.484 81.031 -76.234 L 67.625 -61.516 C 62.821 -69.223 56.129 -73.078 47.547 -73.078 C 41.223 -73.078 35.821 -70.332 31.344 -64.844 C 26.875 -59.352 24.641 -52.719 24.641 -44.938 C 24.641 -37.301 26.875 -30.773 31.344 -25.359 C 35.821 -19.941 41.223 -17.234 47.547 -17.234 C 52.785 -17.234 57.348 -18.813 61.234 -21.969 C 65.129 -25.133 67.078 -29.336 67.078 -34.578 L 46.344 -34.578 L 46.344 -50.391 Z" />
              <path transform="translate(90.984, 98.017)" d="M 27.047 -36.094 L 27.047 0 L 6.547 0 L 6.547 -89.969 L 27.047 -89.969 L 27.047 -54.094 L 56.063 -54.094 L 56.063 -89.969 L 76.563 -89.969 L 76.563 0 L 56.063 0 L 56.063 -36.094 Z" />
            </g>
            <g fill="#FFFFFF">
              <path fillRule="evenodd" d="M 193.004 80.832 L 197.676 72.848 L 206.281 87.977 C 219.465 65.5 234.773 39.387 247.957 16.91 L 180.242 16.223 L 175.66 8.156 L 261.922 8.969 C 244.043 39.441 224.051 73.531 206.172 104.004 Z M 184.258 23.285 C 207.977 23.445 211.984 23.695 235.707 23.855 L 215.902 57.629 L 206.379 73.871 L 201.805 65.824 C 207.75 55.691 215.82 41.93 221.762 31.797 C 204.215 31.68 206.387 31.473 188.84 31.352 Z" />
            </g>
          </svg>

          {/* 3. Label + Hero title — ortali, flex-1 ile dikey ortala */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 22, fontWeight: 800, letterSpacing: 6, marginBottom: 20 }}>
              {headerLabel}
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 68, fontWeight: 800, lineHeight: 1.05, maxWidth: 1000, letterSpacing: -2 }}>
              {`\u201C${title.slice(0, 60)}\u201D`}
            </div>
          </div>

          {/* 4. Rankings — alt, ortali */}
          <div style={{ display: "flex", gap: 48, alignItems: "flex-end", justifyContent: "center", marginTop: 16 }}>
            {top3.map((r, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: i === 0 ? "#22C55E" : i === 1 ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)", marginBottom: 6 }}>
                  {`${i + 1}. SIRA`}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: i === 0 ? "#22C55E" : i === 1 ? "#FFFFFF" : "rgba(255,255,255,0.3)" }}>
                  {r.name}
                </div>
              </div>
            ))}
          </div>

          {/* 5. AI Platform SVG icons — alt, ortali */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", marginTop: 16 }}>
            {activePlatforms.slice(0, 5).map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <PlatformIcon platform={p.platform} size={18} />
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 600 }}>
                  {PLATFORM_NAMES[p.platform] || p.platform}
                </div>
              </div>
            ))}
          </div>

          {/* 6. Footer stats — en alt, ortali */}
          <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 11, fontWeight: 500, marginTop: 10 }}>
            {`${activePlatforms.length} platform \u00b7 ${runCount} tekrar \u00b7 Mart 2026 verisi`}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
