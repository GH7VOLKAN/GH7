"use client";

/* eslint-disable @next/next/no-img-element */

/* ─────────────────────────────────────────────────────
   AI Platform Logos — Real webp icons from /public/
   ChatGPT (#10a37f), Claude (#d97706), Gemini (#4285f4), Perplexity (#14b8a6)
   ───────────────────────────────────────────────────── */

interface LogoProps {
  size?: number;
  mentioned?: boolean;
  className?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  chatgpt: "#10a37f",
  openai: "#10a37f",
  claude: "#d97706",
  anthropic: "#d97706",
  gemini: "#4285f4",
  google: "#4285f4",
  perplexity: "#14b8a6",
  google_aio: "#4285f4",
};

export function getPlatformColor(platform: string): string {
  const key = platform.toLowerCase().replace(/[\s-_]/g, "");
  for (const [k, v] of Object.entries(PLATFORM_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "#888";
}

/** Map platform key to its webp icon path */
function getPlatformIconPath(platform: string): string {
  const key = platform.toLowerCase();
  if (key.includes("chatgpt") || key.includes("openai")) return "/chatgpt-icon.webp";
  if (key.includes("claude") || key.includes("anthropic")) return "/claude-ai-icon.webp";
  if (key.includes("google_aio")) return "/google-ai-studio-icon.webp";
  if (key.includes("gemini")) return "/google-gemini-icon.webp";
  if (key.includes("google")) return "/google-gemini-icon.webp";
  if (key.includes("perplexity")) return "/perplexity-ai-icon.webp";
  return "/chatgpt-icon.webp";
}

/** Get the right logo component for a platform string */
export function PlatformLogo({
  platform,
  size = 28,
  mentioned = true,
  className,
}: LogoProps & { platform: string }) {
  const iconPath = getPlatformIconPath(platform);

  return (
    <img
      src={iconPath}
      alt={getPlatformDisplayName(platform)}
      width={size}
      height={size}
      className={className}
      style={{
        opacity: mentioned ? 1 : 0.25,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
      }}
    />
  );
}

/** Platform name to display name map */
export function getPlatformDisplayName(platform: string): string {
  const key = platform.toLowerCase();
  if (key.includes("chatgpt") || key.includes("openai")) return "ChatGPT";
  if (key.includes("claude") || key.includes("anthropic")) return "Claude";
  if (key.includes("google_aio")) return "Google AIO";
  if (key.includes("gemini") || key.includes("google")) return "Gemini";
  if (key.includes("perplexity")) return "Perplexity";
  return platform;
}
