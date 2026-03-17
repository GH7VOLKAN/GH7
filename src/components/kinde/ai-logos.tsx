"use client";

/* ─────────────────────────────────────────────────────
   AI Platform Logos — SVG circle icons
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
};

export function getPlatformColor(platform: string): string {
  const key = platform.toLowerCase().replace(/[\s-_]/g, "");
  for (const [k, v] of Object.entries(PLATFORM_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "#888";
}

export function ChatGPTLogo({ size = 28, mentioned = true, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} style={{ opacity: mentioned ? 1 : 0.25 }}>
      <circle cx="14" cy="14" r="14" fill="#10a37f" />
      <text x="14" y="18" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="DM Sans, sans-serif">G</text>
    </svg>
  );
}

export function ClaudeLogo({ size = 28, mentioned = true, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} style={{ opacity: mentioned ? 1 : 0.25 }}>
      <circle cx="14" cy="14" r="14" fill="#d97706" />
      <text x="14" y="18" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="DM Sans, sans-serif">C</text>
    </svg>
  );
}

export function GeminiLogo({ size = 28, mentioned = true, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} style={{ opacity: mentioned ? 1 : 0.25 }}>
      <circle cx="14" cy="14" r="14" fill="#4285f4" />
      <text x="14" y="18" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="DM Sans, sans-serif">G</text>
    </svg>
  );
}

export function PerplexityLogo({ size = 28, mentioned = true, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} style={{ opacity: mentioned ? 1 : 0.25 }}>
      <circle cx="14" cy="14" r="14" fill="#14b8a6" />
      <text x="14" y="18" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="DM Sans, sans-serif">P</text>
    </svg>
  );
}

/** Get the right logo component for a platform string */
export function PlatformLogo({
  platform,
  size = 28,
  mentioned = true,
  className,
}: LogoProps & { platform: string }) {
  const key = platform.toLowerCase();
  if (key.includes("chatgpt") || key.includes("openai"))
    return <ChatGPTLogo size={size} mentioned={mentioned} className={className} />;
  if (key.includes("claude") || key.includes("anthropic"))
    return <ClaudeLogo size={size} mentioned={mentioned} className={className} />;
  if (key.includes("gemini") || key.includes("google"))
    return <GeminiLogo size={size} mentioned={mentioned} className={className} />;
  if (key.includes("perplexity"))
    return <PerplexityLogo size={size} mentioned={mentioned} className={className} />;
  // Fallback
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} style={{ opacity: mentioned ? 1 : 0.25 }}>
      <circle cx="14" cy="14" r="14" fill="#888" />
      <text x="14" y="18" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="DM Sans, sans-serif">?</text>
    </svg>
  );
}

/** Platform name to display name map */
export function getPlatformDisplayName(platform: string): string {
  const key = platform.toLowerCase();
  if (key.includes("chatgpt") || key.includes("openai")) return "ChatGPT";
  if (key.includes("claude") || key.includes("anthropic")) return "Claude";
  if (key.includes("gemini") || key.includes("google")) return "Gemini";
  if (key.includes("perplexity")) return "Perplexity";
  return platform;
}
