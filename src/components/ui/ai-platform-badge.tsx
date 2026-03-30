/**
 * AI Platform Badge & Icon System
 *
 * Unified, monochrome-compatible icon/badge components for all
 * supported AI platforms. Uses clean SVG paths at viewBox 0 0 24 24.
 */

import type { JSX } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AIPlatform =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "perplexity"
  | "google_aio"
  | "copilot";

// ---------------------------------------------------------------------------
// Platform info mapping
// ---------------------------------------------------------------------------

export const PLATFORM_INFO: Record<
  AIPlatform,
  { name: string; color: string; description: string }
> = {
  chatgpt: {
    name: "ChatGPT",
    color: "#10A37F",
    description: "Sohbet tabanlı AI",
  },
  claude: {
    name: "Claude",
    color: "#D97706",
    description: "Anthropic AI",
  },
  gemini: {
    name: "Gemini",
    color: "#8B5CF6",
    description: "Google AI asistanı",
  },
  perplexity: {
    name: "Perplexity",
    color: "#22D3EE",
    description: "AI arama motoru",
  },
  google_aio: {
    name: "AI Overview",
    color: "#4285F4",
    description: "Google arama AI özeti",
  },
  copilot: {
    name: "Copilot",
    color: "#00BCF2",
    description: "Microsoft AI",
  },
};

/** All supported platform keys */
export const AI_PLATFORM_KEYS: AIPlatform[] = [
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
  "google_aio",
  "copilot",
];

// ---------------------------------------------------------------------------
// SVG path renderers (viewBox 0 0 24 24)
// ---------------------------------------------------------------------------

const PLATFORM_PATHS: Record<AIPlatform, (fill: string, colored: boolean) => JSX.Element> = {
  // ChatGPT — OpenAI logo (interlocking curved segments)
  chatgpt: (fill) => (
    <path
      d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"
      fill={fill}
    />
  ),

  // Claude — Anthropic sunburst mark (radiating lines from center dot)
  claude: (fill) => (
    <>
      <path
        d="M16.171 3.072l-5.28 14.746a.483.483 0 0 1-.593.3l-.073-.026a.483.483 0 0 1-.273-.62L15.23 2.726a.483.483 0 0 1 .667-.247.483.483 0 0 1 .274.593z"
        fill={fill}
      />
      <path
        d="M21.167 10.005l-12.16 6.563a.483.483 0 0 1-.651-.193l-.037-.07a.483.483 0 0 1 .194-.65L20.672 9.09a.483.483 0 0 1 .655.193.483.483 0 0 1-.16.722z"
        fill={fill}
      />
      <path
        d="M18.469 6.2l-10.44 10.08a.483.483 0 0 1-.682-.017l-.05-.054a.483.483 0 0 1 .018-.682L17.753 5.45a.483.483 0 0 1 .699.018.483.483 0 0 1 .017.732z"
        fill={fill}
      />
      <path
        d="M14.065 3.972l-7.773 13.394a.483.483 0 0 1-.66.176l-.064-.039a.483.483 0 0 1-.176-.66l7.773-13.393a.483.483 0 0 1 .66-.177.483.483 0 0 1 .24.699z"
        fill={fill}
      />
      <path
        d="M20.698 13.352l-14.144 3.29a.483.483 0 0 1-.576-.363l-.017-.073a.483.483 0 0 1 .363-.577L20.468 12.34a.483.483 0 0 1 .577.363.483.483 0 0 1-.347.649z"
        fill={fill}
      />
      <path
        d="M11.398 3.504l-5.64 14.618a.483.483 0 0 1-.613.282l-.07-.028a.483.483 0 0 1-.282-.613L10.434 3.15a.483.483 0 0 1 .672-.229.483.483 0 0 1 .292.583z"
        fill={fill}
      />
      <circle cx="5.08" cy="18.282" r="1.207" fill={fill} />
    </>
  ),

  // Gemini — Google four-pointed sparkle star
  gemini: (fill) => (
    <path
      d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z"
      fill={fill}
    />
  ),

  // Perplexity — abstract geometric search/compass shape
  perplexity: (fill) => (
    <>
      <path
        d="M7.547 2v6.2L4 5.267V12h3.547v6.8L4 15.867V22h3.547V15.867L11.094 22V15.333h1.812V22l3.547-6.133V22H20v-6.133l-3.547 2.933V12H20V5.267L16.453 8.2V2h-3.547v6.133l-3.547-3.2V2z"
        fill={fill}
      />
      <path
        d="M11.094 12V5.867L7.547 2v6.2m0 3.8h3.547m0 0h1.812m-1.812 0v3.333m1.812-3.333V5.867L16.453 2v6.2M16.453 12h-3.547m3.547 0V8.2L20 5.267V12m-3.547 0v6.8L20 15.867V22m-3.547-6.133V22h-3.547m3.547-6.133L20 22M7.547 12V8.2L4 5.267V12m3.547 0v6.8L4 15.867V22m3.547-6.133V22h3.547m-3.547-6.133L4 22m7.094-6.667V22l3.547-6.133"
        stroke={fill}
        strokeWidth="0.3"
        fill="none"
      />
    </>
  ),

  // Google AI Overview — Google "G" with 4 brand colors when colored
  google_aio: (fill, colored) =>
    colored ? (
      <>
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </>
    ) : (
      <>
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill={fill}
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill={fill}
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill={fill}
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill={fill}
        />
      </>
    ),

  // Copilot — Microsoft Copilot shape
  copilot: (fill) => (
    <path
      d="M12 2C6.477 2 2 6.477 2 12c0 3.286 1.588 6.2 4.04 8.02A4.984 4.984 0 0 0 10 22h4a4.984 4.984 0 0 0 3.96-1.98A9.968 9.968 0 0 0 22 12c0-5.523-4.477-10-10-10zm-2 18a3 3 0 0 1-2.83-2H10a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H5.07A7.97 7.97 0 0 1 12 4a7.97 7.97 0 0 1 6.93 7H14a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2.83A3 3 0 0 1 14 20h-4z"
      fill={fill}
    />
  ),
};

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

interface AIPlatformIconProps {
  platform: AIPlatform;
  /** Icon size in pixels. Default 20. */
  size?: number;
  /** Use platform brand color instead of currentColor. */
  colored?: boolean;
  className?: string;
}

interface AIPlatformBadgeProps {
  platform: AIPlatform;
  /** Icon size in pixels. Default 20. */
  size?: number;
  /** Use platform brand color instead of currentColor. */
  colored?: boolean;
  /** Show the platform name next to the icon. */
  showName?: boolean;
  className?: string;
}

interface AIPlatformRowProps {
  /** Icon size in pixels. Default 20. */
  size?: number;
  /** Use platform brand colors instead of currentColor. */
  colored?: boolean;
  /** Show platform names next to icons. */
  showName?: boolean;
  /** Gap between items (Tailwind class). Default "gap-3". */
  gap?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// AIPlatformIcon
// ---------------------------------------------------------------------------

export function AIPlatformIcon({
  platform,
  size = 20,
  colored = false,
  className = "",
}: AIPlatformIconProps) {
  const info = PLATFORM_INFO[platform];
  const fill = colored ? info.color : "currentColor";

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={info.name}
      className={`shrink-0 ${className}`}
    >
      {PLATFORM_PATHS[platform](fill, colored)}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// AIPlatformBadge - icon + optional name
// ---------------------------------------------------------------------------

export function AIPlatformBadge({
  platform,
  size = 20,
  colored = false,
  showName = false,
  className = "",
}: AIPlatformBadgeProps) {
  const info = PLATFORM_INFO[platform];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <AIPlatformIcon platform={platform} size={size} colored={colored} />
      {showName && (
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {info.name}
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// AIPlatformRow - renders all platforms in a row
// ---------------------------------------------------------------------------

export function AIPlatformRow({
  size = 20,
  colored = false,
  showName = false,
  gap = "gap-3",
  className = "",
}: AIPlatformRowProps) {
  return (
    <div className={`flex flex-wrap items-center ${gap} ${className}`}>
      {AI_PLATFORM_KEYS.map((platform) => (
        <AIPlatformBadge
          key={platform}
          platform={platform}
          size={size}
          colored={colored}
          showName={showName}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

export function getPlatformLabel(platform: AIPlatform): string {
  return PLATFORM_INFO[platform].name;
}

export function getPlatformBrandColor(platform: AIPlatform): string {
  return PLATFORM_INFO[platform].color;
}
