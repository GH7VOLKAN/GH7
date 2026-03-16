import Link from "next/link";
import {
  LockIcon,
  TrophyIcon,
  SearchIcon,
  TargetIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "lucide-react";
import type { FreeToolResult } from "@/lib/free-tool/types";

// ── Blurred content wrapper ─────────────────────────
function BlurredRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none select-none blur-[5px]">
      {children}
    </div>
  );
}

// ── Section with lock icon ──────────────────────────
function ProSection({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Icon className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {badge}
            </span>
          )}
          <LockIcon className="size-3.5 text-muted-foreground/50" />
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function BlurredUpsell({ result }: { result: FreeToolResult }) {
  const isKisisel = result.input.mode === "kisisel";
  const competitors = result.competitors;

  // Generate fake but realistic extra competitors for padding
  const fakeExtras = [
    { name: "████████ ███████", score: 61, platforms: ["ChatGPT"] },
    { name: "███████ ██████", score: 54, platforms: ["Claude"] },
    { name: "██████████", score: 48, platforms: ["Gemini", "Perplexity"] },
    { name: "█████ ████████", score: 42, platforms: ["ChatGPT", "Gemini"] },
    { name: "████████████ ███", score: 35, platforms: ["Perplexity"] },
  ];

  // Combine real + padded to get at least 10 rows
  const displayCompetitors = [
    ...competitors,
    ...fakeExtras.slice(0, Math.max(0, 10 - competitors.length)),
  ].slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Pro Analizler
        </p>
        <span className="rounded-full bg-foreground/5 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
          Pro ile açılır
        </span>
      </div>

      {/* ── 1. COMPETITORS ─────────────────────────────── */}
      <ProSection
        icon={TrophyIcon}
        title={
          isKisisel
            ? "Senin Yerine Kim Öneriliyor?"
            : "Rakipleriniz Kimler?"
        }
        badge={`${displayCompetitors.length} rakip bulundu`}
      >
        <div className="space-y-0">
          {displayCompetitors.map((comp, i) => {
            const isFirst = i === 0 && competitors.length > 0;
            const isReal = i < competitors.length;

            return (
              <div
                key={i}
                className={`flex items-center gap-3 border-b border-border/30 py-2.5 last:border-0 ${
                  !isFirst ? "pointer-events-none select-none" : ""
                }`}
              >
                {/* Rank */}
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    isFirst
                      ? "bg-foreground text-background"
                      : "bg-muted-foreground/10 text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  {isFirst ? (
                    <p className="truncate text-sm font-medium">{comp.name}</p>
                  ) : (
                    <div className={isReal ? "blur-[5px]" : ""}>
                      <p className="truncate text-sm font-medium">
                        {isReal ? comp.name : comp.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Platforms */}
                {isFirst && comp.platforms && comp.platforms.length > 0 ? (
                  <div className="hidden shrink-0 items-center gap-1 sm:flex">
                    {comp.platforms.map((p, pi) => (
                      <span
                        key={pi}
                        className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                ) : !isFirst ? (
                  <div className="hidden shrink-0 sm:flex blur-[4px]">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                      {isReal
                        ? (comp.platforms?.[0] ?? "ChatGPT")
                        : "Platform"}
                    </span>
                  </div>
                ) : null}

                {/* Score */}
                <div
                  className={`shrink-0 text-right ${!isFirst ? "blur-[4px]" : ""}`}
                >
                  <span className="text-xs font-bold tabular-nums text-muted-foreground">
                    {comp.score}/100
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gradient overlay at bottom */}
        <div className="relative -mx-5 -mb-5 mt-3">
          <div className="h-px bg-border" />
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
            <LockIcon className="size-3" />
            <span>
              Tüm rakipleri görmek için{" "}
              <span className="font-semibold text-foreground">Pro</span>&apos;ya
              geç
            </span>
          </div>
        </div>
      </ProSection>

      {/* ── 2. WHY NOT FOUND ───────────────────────────── */}
      <ProSection
        icon={SearchIcon}
        title={isKisisel ? "AI Neden Seni Tanımıyor?" : "AI Neden Bahsetmiyor?"}
        badge="3 neden"
      >
        <div className="space-y-3">
          {result.whyNotFound.length > 0 ? (
            <>
              {/* First reason: visible */}
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-red-400" />
                <p className="text-sm leading-relaxed text-foreground/80">
                  {result.whyNotFound[0]}
                </p>
              </div>
              {/* Rest: blurred with real text */}
              {result.whyNotFound.slice(1).map((reason, i) => (
                <BlurredRow key={i}>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-400" />
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {reason}
                    </p>
                  </div>
                </BlurredRow>
              ))}
            </>
          ) : (
            <>
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-red-400" />
                <div className="h-4 w-5/6 rounded bg-muted-foreground/15" />
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-400" />
                <div className="h-4 w-4/6 rounded bg-muted-foreground/15" />
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-400" />
                <div className="h-4 w-3/6 rounded bg-muted-foreground/15" />
              </div>
            </>
          )}
        </div>
      </ProSection>

      {/* ── 3. ACTION PLAN ─────────────────────────────── */}
      <ProSection
        icon={TargetIcon}
        title="Kişiselleştirilmiş Aksiyon Planı"
        badge="5 adım"
      >
        <div className="space-y-2.5">
          {result.actionItems.length > 0 ? (
            <>
              {/* First action: visible */}
              <div className="flex items-center gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded border border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
                  <svg
                    className="size-3 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {result.actionItems[0]}
                </p>
              </div>
              {/* Rest: blurred with real text */}
              {result.actionItems.slice(1).map((item, i) => (
                <BlurredRow key={i}>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded border border-muted-foreground/20">
                      <span className="text-[10px] font-bold text-muted-foreground/40">
                        {i + 2}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {item}
                    </p>
                  </div>
                </BlurredRow>
              ))}
            </>
          ) : (
            ["w-full", "w-11/12", "w-5/6", "w-4/6", "w-3/4"].map((w, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded border border-muted-foreground/20">
                  <span className="text-[10px] font-bold text-muted-foreground/30">
                    {i + 1}
                  </span>
                </div>
                <div className={`h-4 rounded bg-muted-foreground/15 ${w}`} />
              </div>
            ))
          )}
        </div>
      </ProSection>

      {/* ── 4. WEEKLY TRACKING ─────────────────────────── */}
      <ProSection
        icon={TrendingUpIcon}
        title="Haftalık AI Takip Raporu"
        badge="7 gün"
      >
        <div className="pointer-events-none select-none blur-[4px]">
          <div className="flex h-20 items-end gap-2">
            {[28, 35, 32, 42, 38, 48, 52].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] tabular-nums text-muted-foreground">
                  {h}
                </span>
                <div
                  className="w-full rounded-t bg-foreground/20"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>Pzt</span>
            <span>Sal</span>
            <span>Çar</span>
            <span>Per</span>
            <span>Cum</span>
            <span>Cmt</span>
            <span>Paz</span>
          </div>
        </div>
      </ProSection>

      {/* ── 5. SITE AUDIT ──────────────────────────────── */}
      <ProSection
        icon={ShieldCheckIcon}
        title="Site Hazirlik Kontrolu"
        badge="12 kontrol"
      >
        <div className="pointer-events-none select-none blur-[4px]">
          <div className="space-y-2">
            {[
              { label: "Yapilandirilmis veri", pass: false },
              { label: "Yapay zeka erisim izinleri", pass: true },
              { label: "Site haritasi mevcut", pass: true },
              { label: "Sosyal medya onizleme bilgileri", pass: false },
              { label: "Sayfa yukleme hizi < 3s", pass: true },
              { label: "Guvenli baglanti aktif", pass: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`size-4 rounded-sm ${item.pass ? "bg-emerald-200 dark:bg-emerald-900" : "bg-red-200 dark:bg-red-900"}`}
                />
                <span className="text-sm text-foreground/70">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </ProSection>

      {/* ── CTA ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02] p-8 text-center">
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-foreground/[0.03]" />

        <div className="relative">
          <p className="text-xl font-bold tracking-[-0.03em]">
            Tüm sonuçlarını aç
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {isKisisel
              ? "Senin yerine kimin önerildiğini, neden tanınmadığını, kişiselleştirilmiş aksiyon planını ve haftalık ilerleme raporlarını gör."
              : "Rakip analizi, kaynak takibi, site SEO analizi, aksiyon planı ve haftalık AI görünürlük raporlarını aç."}
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-10 py-4 text-base font-bold text-background transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
          >
            Pro ile Başla
            <ArrowRightIcon className="size-4" />
          </Link>

          <div className="mt-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              7 gün ücretsiz dene — istediğin zaman iptal et
            </p>
            <p className="text-[11px] text-muted-foreground/50">
              2.495₺/ay • 1,247 profesyonel bu ay Pro&apos;ya geçti
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
