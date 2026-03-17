import type { PlatformKey } from "@/lib/types";

/**
 * AI Platform ikonlari — SVG logolar
 * Her platformun resmi rengi ve logosu
 */

interface PlatformIconProps {
  platform: PlatformKey;
  size?: number;
  className?: string;
}

export function PlatformIcon({ platform, size = 20, className = "" }: PlatformIconProps) {
  const config = PLATFORM_ICONS[platform];
  return (
    <svg
      viewBox={config.viewBox}
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={config.label}
    >
      {config.paths}
    </svg>
  );
}

/** Platform renkleri — tasarimda kullanilacak merkezi kaynak */
export const PLATFORM_COLORS: Record<PlatformKey, {
  text: string;
  bg: string;
  border: string;
  dot: string;
  hex: string;
}> = {
  chatgpt: {
    text: "text-[#10A37F]",
    bg: "bg-[#10A37F]/8",
    border: "border-[#10A37F]/15",
    dot: "bg-[#10A37F]",
    hex: "#10A37F",
  },
  claude: {
    text: "text-[#D97757]",
    bg: "bg-[#D97757]/8",
    border: "border-[#D97757]/15",
    dot: "bg-[#D97757]",
    hex: "#D97757",
  },
  gemini: {
    text: "text-[#4285F4]",
    bg: "bg-[#4285F4]/8",
    border: "border-[#4285F4]/15",
    dot: "bg-[#4285F4]",
    hex: "#4285F4",
  },
  perplexity: {
    text: "text-[#20808D]",
    bg: "bg-[#20808D]/8",
    border: "border-[#20808D]/15",
    dot: "bg-[#20808D]",
    hex: "#20808D",
  },
  groq: {
    text: "text-[#f55036]",
    bg: "bg-[#f55036]/8",
    border: "border-[#f55036]/15",
    dot: "bg-[#f55036]",
    hex: "#f55036",
  },
};

/** Platform badge — ikon + isim birlikte */
export function PlatformBadge({
  platform,
  size = "sm",
  showName = true,
}: {
  platform: PlatformKey;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}) {
  const colors = PLATFORM_COLORS[platform];
  const config = PLATFORM_ICONS[platform];
  const iconSize = size === "sm" ? 14 : size === "md" ? 18 : 22;
  const textSize = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base";
  const padding = size === "sm" ? "px-2 py-1" : size === "md" ? "px-2.5 py-1.5" : "px-3 py-2";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md ${colors.bg} ${colors.border} border ${padding}`}>
      <PlatformIcon platform={platform} size={iconSize} />
      {showName && <span className={`${textSize} font-medium ${colors.text}`}>{config.label}</span>}
    </span>
  );
}

const PLATFORM_ICONS: Record<PlatformKey, {
  label: string;
  viewBox: string;
  paths: React.ReactNode;
}> = {
  chatgpt: {
    label: "ChatGPT",
    viewBox: "0 0 24 24",
    paths: (
      <path
        d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"
        fill="#10A37F"
      />
    ),
  },
  claude: {
    label: "Claude",
    viewBox: "0 0 24 24",
    paths: (
      <>
        <path d="M16.171 3.072l-5.28 14.746a.483.483 0 0 1-.593.3l-.073-.026a.483.483 0 0 1-.273-.62L15.23 2.726a.483.483 0 0 1 .667-.247.483.483 0 0 1 .274.593z" fill="#D97757" />
        <path d="M21.167 10.005l-12.16 6.563a.483.483 0 0 1-.651-.193l-.037-.07a.483.483 0 0 1 .194-.65L20.672 9.09a.483.483 0 0 1 .655.193.483.483 0 0 1-.16.722z" fill="#D97757" />
        <path d="M18.469 6.2l-10.44 10.08a.483.483 0 0 1-.682-.017l-.05-.054a.483.483 0 0 1 .018-.682L17.753 5.45a.483.483 0 0 1 .699.018.483.483 0 0 1 .017.732z" fill="#D97757" />
        <path d="M14.065 3.972l-7.773 13.394a.483.483 0 0 1-.66.176l-.064-.039a.483.483 0 0 1-.176-.66l7.773-13.393a.483.483 0 0 1 .66-.177.483.483 0 0 1 .24.699z" fill="#D97757" />
        <path d="M20.698 13.352l-14.144 3.29a.483.483 0 0 1-.576-.363l-.017-.073a.483.483 0 0 1 .363-.577L20.468 12.34a.483.483 0 0 1 .577.363.483.483 0 0 1-.347.649z" fill="#D97757" />
        <path d="M11.398 3.504l-5.64 14.618a.483.483 0 0 1-.613.282l-.07-.028a.483.483 0 0 1-.282-.613L10.434 3.15a.483.483 0 0 1 .672-.229.483.483 0 0 1 .292.583z" fill="#D97757" />
        <circle cx="5.08" cy="18.282" r="1.207" fill="#D97757" />
      </>
    ),
  },
  gemini: {
    label: "Gemini",
    viewBox: "0 0 24 24",
    paths: (
      <>
        <defs>
          <linearGradient id="gemini-gradient" x1="0" y1="0" x2="24" y2="24">
            <stop stopColor="#4285F4" />
            <stop offset="1" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <path
          d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z"
          fill="url(#gemini-gradient)"
        />
      </>
    ),
  },
  perplexity: {
    label: "Perplexity",
    viewBox: "0 0 24 24",
    paths: (
      <>
        <path d="M7.547 2v6.2L4 5.267V12h3.547v6.8L4 15.867V22h3.547V15.867L11.094 22V15.333h1.812V22l3.547-6.133V22H20v-6.133l-3.547 2.933V12H20V5.267L16.453 8.2V2h-3.547v6.133l-3.547-3.2V2z" fill="#20808D" />
        <path d="M11.094 12V5.867L7.547 2v6.2m0 3.8h3.547m0 0h1.812m-1.812 0v3.333m1.812-3.333V5.867L16.453 2v6.2M16.453 12h-3.547m3.547 0V8.2L20 5.267V12m-3.547 0v6.8L20 15.867V22m-3.547-6.133V22h-3.547m3.547-6.133L20 22M7.547 12V8.2L4 5.267V12m3.547 0v6.8L4 15.867V22m3.547-6.133V22h3.547m-3.547-6.133L4 22m7.094-6.667V22l3.547-6.133" stroke="#20808D" strokeWidth="0.3" fill="none" />
      </>
    ),
  },
  groq: {
    label: "Groq (Llama)",
    viewBox: "0 0 24 24",
    paths: (
      <text x="12" y="17" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#f55036">G</text>
    ),
  },
};
