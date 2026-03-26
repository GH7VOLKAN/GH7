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
    description: "Sohbet tabanli AI",
  },
  claude: {
    name: "Claude",
    color: "#D97706",
    description: "Anthropic AI",
  },
  gemini: {
    name: "Gemini",
    color: "#8B5CF6",
    description: "Google AI asistani",
  },
  perplexity: {
    name: "Perplexity",
    color: "#22D3EE",
    description: "AI arama motoru",
  },
  google_aio: {
    name: "AI Overview",
    color: "#4285F4",
    description: "Google arama AI ozeti",
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

const PLATFORM_PATHS: Record<AIPlatform, (fill: string) => JSX.Element> = {
  // ChatGPT - OpenAI hexagonal sparkle
  chatgpt: (fill) => (
    <path
      d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"
      fill={fill}
    />
  ),

  // Claude - Anthropic sunburst mark
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

  // Gemini - four-pointed sparkle star
  gemini: (fill) => (
    <path
      d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z"
      fill={fill}
    />
  ),

  // Perplexity - abstract geometric search shape
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

  // Google AI Overview - styled "G"
  google_aio: (fill) => (
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.8 4.133-1.08 1.08-2.773 2.267-6.04 2.267-4.813 0-8.573-3.88-8.573-8.693S7.667 3.213 12.48 3.213c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      fill={fill}
    />
  ),

  // Copilot - infinity-like ribbon
  copilot: (fill) => (
    <path
      d="M11.087 7.556a5.25 5.25 0 0 0-7.1.483 5.25 5.25 0 0 0 .183 7.128l5.36 5.36a.75.75 0 0 0 1.06 0l2.31-2.31-4.2-4.2a2.25 2.25 0 0 1 3.18-3.18l1.06 1.06 1.06-1.06a5.22 5.22 0 0 0-2.913-3.281zm1.826 3.281l-1.06 1.06 4.2 4.2a2.25 2.25 0 0 0 3.18-3.18l-1.06-1.06-1.06 1.06 1.06 1.06a.75.75 0 1 1-1.06 1.06l-4.2-4.2zm2.12-2.12l1.06-1.06a.75.75 0 1 1 1.06 1.06l-1.06 1.06 1.06 1.06a5.25 5.25 0 0 0-.183-7.128 5.25 5.25 0 0 0-7.1.483 5.22 5.22 0 0 0-1.087 2.221l1.06 1.06a2.25 2.25 0 0 1 3.18-3.18l4.2 4.2-1.06 1.06-1.13-1.13z"
      fill={fill}
      fillRule="evenodd"
      clipRule="evenodd"
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
      {PLATFORM_PATHS[platform](fill)}
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
