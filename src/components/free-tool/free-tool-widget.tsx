"use client";

import { useState, useTransition } from "react";
import {
  MessageSquareTextIcon,
  RotateCcwIcon,
  ShareIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ZapIcon,
  RepeatIcon,
  UsersIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { FreeToolMode, FreeToolResult } from "@/lib/free-tool/types";
import { runFreeToolQuery } from "@/lib/free-tool/action";
import { ScoreRing } from "./score-ring";
import { PlatformResultCard } from "./platform-result-card";
import { FreeInsights } from "./free-insights";
import { BlurredUpsell } from "./blurred-upsell";

export function FreeToolWidget() {
  const [mode, setMode] = useState<FreeToolMode>("kisisel");
  const [name, setName] = useState("");
  const [field, setField] = useState("");
  const [city, setCity] = useState("");
  const [result, setResult] = useState<FreeToolResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await runFreeToolQuery({
          mode,
          name: name.trim(),
          field: field.trim(),
          city: city.trim(),
        });
        setResult(res);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Bir hata oluştu. Tekrar deneyin.",
        );
      }
    });
  }

  function handleReset() {
    setResult(null);
    setName("");
    setField("");
    setCity("");
    setError(null);
  }

  const foundCount = result?.platforms.filter((p) => p.found).length ?? 0;
  const totalCount = result?.platforms.length ?? 0;

  return (
    <div>
      {/* Mode toggle */}
      <div className="mb-8 flex items-center justify-center">
        <div className="inline-flex rounded-lg border border-border bg-background-secondary p-1">
          <button
            type="button"
            onClick={() => {
              setMode("kisisel");
              setResult(null);
            }}
            className={`rounded-md px-5 py-2.5 text-sm font-medium transition-all ${
              mode === "kisisel"
                ? "bg-background font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Kendi adımı test et
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("firma");
              setResult(null);
            }}
            className={`rounded-md px-5 py-2.5 text-sm font-medium transition-all ${
              mode === "firma"
                ? "bg-background font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Firmamı test et
          </button>
        </div>
      </div>

      {/* Form */}
      {!result && (
        <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {mode === "kisisel" ? "Ad Soyad" : "Firma Adı"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                mode === "kisisel" ? "Ahmet Yılmaz" : "Acme Teknoloji"
              }
              required
              className="mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm transition-colors focus:border-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {mode === "kisisel" ? "Meslek / Uzmanlık" : "Sektör"}
            </label>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder={
                mode === "kisisel"
                  ? "Diş Hekimi, Avukat, Yazılımcı..."
                  : "SaaS, E-ticaret, Restoran..."
              }
              required
              className="mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm transition-colors focus:border-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Şehir
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="İstanbul"
              required
              className="mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm transition-colors focus:border-foreground focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-foreground px-6 py-3.5 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="size-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                AI platformları taranıyor...
              </span>
            ) : (
              "Test Et"
            )}
          </button>
        </form>
      )}

      {/* Results */}
      {result && (
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Score Ring */}
          <ScoreRing
            score={result.overallScore}
            label={result.scoreLabel}
            sectorAverage={result.sectorAverage}
          />

          {/* Quick summary */}
          <div className="mx-auto flex max-w-md items-center justify-center gap-6 rounded-xl border border-border bg-card px-6 py-4">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="size-4 text-emerald-500" />
              <span className="text-sm">
                <span className="font-bold">{foundCount}</span>{" "}
                <span className="text-muted-foreground">platform tanıyor</span>
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <XCircleIcon className="size-4 text-red-400" />
              <span className="text-sm">
                <span className="font-bold">{totalCount - foundCount}</span>{" "}
                <span className="text-muted-foreground">tanımıyor</span>
              </span>
            </div>
          </div>

          {/* What we asked */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <MessageSquareTextIcon className="size-4 text-muted-foreground" />
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                AI Platformlarına Sorduğumuz Soru
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card px-5 py-4">
              <p className="text-sm italic leading-relaxed text-foreground/70">
                &ldquo;{result.promptUsed}&rdquo;
              </p>
            </div>
          </div>

          {/* Platform cards */}
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Platform Bazlı Sonuçlar
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {result.platforms.map((p) => (
                <PlatformResultCard key={p.platform} result={p} />
              ))}
            </div>
          </div>

          {/* Free Insights */}
          <FreeInsights insights={result.freeInsights} />

          {/* Pro comparison banner */}
          <div className="rounded-xl border border-dashed border-foreground/15 bg-foreground/[0.02] p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
                <ZapIcon className="size-4 text-foreground/60" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  Bu ücretsiz test, 1 prompt ile anlık bir görüntüdür
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  Pro ile aynı analiz çok daha kapsamlı yapılır:
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-[13px] text-foreground/70">
                    <RepeatIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span>
                      <span className="font-medium">200 farklı prompt</span> ile
                      derinlemesine analiz
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-foreground/70">
                    <TrendingUpIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span>
                      <span className="font-medium">Haftada 3</span> otomatik
                      tarama
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-foreground/70">
                    <UsersIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span>
                      <span className="font-medium">Rakiplerinizin</span> de
                      aynı detayda analizi
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-foreground/70">
                    <ZapIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span>
                      Kaynak analizi, SEO önerileri,{" "}
                      <span className="font-medium">aksiyon planı</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blurred upsell */}
          <BlurredUpsell result={result} />

          {/* Actions */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              <RotateCcwIcon className="size-4" />
              Tekrar Dene
            </button>
            <button
              type="button"
              onClick={() => {
                const text =
                  mode === "kisisel"
                    ? `Yapay zeka beni tanıyor mu? AI görünürlük skorum: ${result.overallScore}/100! gh7.ai'da sen de test et.`
                    : `AI görünürlük skorumuz: ${result.overallScore}/100! gh7.ai'da siz de test edin.`;
                navigator.clipboard?.writeText(text);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              <ShareIcon className="size-4" />
              Sonucu Paylaş
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
