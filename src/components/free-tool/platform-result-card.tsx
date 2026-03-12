import type { PlatformResult } from "@/lib/free-tool/types";

const platformStyles: Record<string, { color: string; bgColor: string; barColor: string }> = {
  chatgpt: { color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950", barColor: "bg-green-500" },
  claude: { color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950", barColor: "bg-orange-500" },
  gemini: { color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950", barColor: "bg-blue-500" },
  perplexity: { color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950", barColor: "bg-purple-500" },
};

const sentimentConfig = {
  pozitif: { label: "Pozitif", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
  nötr: { label: "Nötr", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  negatif: { label: "Negatif", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
};

export function PlatformResultCard({ result }: { result: PlatformResult }) {
  const style = platformStyles[result.platform] ?? {
    color: "text-foreground",
    bgColor: "bg-background-secondary",
    barColor: "bg-foreground",
  };
  const sentimentStyle = sentimentConfig[result.sentiment];

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-lg ${style.bgColor}`}>
            <span className={`text-sm font-bold ${style.color}`}>
              {result.label.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold">{result.label}</p>
            <p className="text-[11px] text-muted-foreground">{result.position}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            result.found
              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
          }`}
        >
          {result.found ? (
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {result.found ? "Tanıyor" : "Tanımıyor"}
        </div>
      </div>

      {/* Excerpt */}
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {result.excerpt}
      </p>

      {/* Footer: sentiment + score bar */}
      <div className="mt-4 flex items-center gap-3">
        {result.found && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sentimentStyle.className}`}>
            {sentimentStyle.label}
          </span>
        )}
        <div className="flex flex-1 items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-all duration-700 ${style.barColor}`}
              style={{ width: `${result.visibilityScore}%` }}
            />
          </div>
          <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
            {result.visibilityScore}
          </span>
        </div>
      </div>
    </div>
  );
}
