import type { PlatformResult } from "@/lib/free-tool/types";

const platformIcons: Record<string, { color: string; bgColor: string }> = {
  chatgpt: { color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950" },
  claude: { color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950" },
  gemini: { color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950" },
  perplexity: { color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950" },
};

export function PlatformResultCard({ result }: { result: PlatformResult }) {
  const style = platformIcons[result.platform] ?? {
    color: "text-foreground",
    bgColor: "bg-background-secondary",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-lg ${style.bgColor}`}
          >
            <span className={`text-sm font-bold ${style.color}`}>
              {result.label.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold">{result.label}</p>
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
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {result.excerpt}
      </p>
    </div>
  );
}
