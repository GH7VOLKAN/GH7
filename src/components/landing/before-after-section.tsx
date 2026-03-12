import { CheckIcon, XIcon } from "lucide-react";

const platforms = ["ChatGPT", "Claude", "Gemini", "Perplexity"];

const before = [
  { found: false, note: "yoksun" },
  { found: false, note: "yoksun" },
  { found: false, note: "yoksun" },
  { found: false, note: "yoksun" },
];

const after = [
  { found: true, note: "1. sırada" },
  { found: true, note: "2. sırada" },
  { found: true, note: "tanıyor" },
  { found: true, note: "tanıyor" },
];

export function BeforeAfterSection() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground">
          &ldquo;İstanbul&apos;da iyi bir ortopedist öner&rdquo;
        </p>

        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          {/* Önce */}
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900 dark:bg-red-950/20">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              Önce
            </p>
            <div className="mt-4 space-y-3">
              {platforms.map((p, i) => (
                <div key={p} className="flex items-center justify-between">
                  <span className="text-sm">{p}</span>
                  <span className="flex items-center gap-1.5 text-sm text-red-500">
                    <XIcon className="size-3.5" />
                    {before[i].note}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-red-200 pt-3 text-center dark:border-red-900">
              <span className="text-2xl font-bold text-red-500">0/4</span>
            </div>
          </div>

          {/* Sonra */}
          <div className="rounded-2xl border border-green-200 bg-green-50/50 p-6 dark:border-green-900 dark:bg-green-950/20">
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              Sonra
            </p>
            <div className="mt-4 space-y-3">
              {platforms.map((p, i) => (
                <div key={p} className="flex items-center justify-between">
                  <span className="text-sm">{p}</span>
                  <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                    <CheckIcon className="size-3.5" />
                    {after[i].note}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-green-200 pt-3 text-center dark:border-green-900">
              <span className="text-2xl font-bold text-green-500">4/4</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Ne değişti?{" "}
          <span className="font-medium text-foreground">
            5 şey yapıldı. 4-6 hafta sürdü.
          </span>
        </p>
      </div>
    </section>
  );
}
