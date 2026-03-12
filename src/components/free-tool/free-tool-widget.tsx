"use client";

import { useState, useTransition } from "react";
import type { FreeToolMode, FreeToolResult } from "@/lib/free-tool/types";
import { runFreeToolQuery } from "@/lib/free-tool/action";
import { PlatformResultCard } from "./platform-result-card";
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
          err instanceof Error ? err.message : "Bir hata oluştu. Tekrar deneyin."
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
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
        <div className="mx-auto max-w-2xl">
          {/* Score summary */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background-secondary px-5 py-2.5">
              <span className="text-2xl font-bold">{result.score}</span>
              <span className="text-sm text-muted-foreground">/4 platform</span>
              <span className="text-sm font-medium">
                {mode === "kisisel" ? "seni tanıyor" : "markanızı tanıyor"}
              </span>
            </div>
          </div>

          {/* Platform cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {result.platforms.map((p) => (
              <PlatformResultCard key={p.platform} result={p} />
            ))}
          </div>

          {/* Blurred upsell */}
          <BlurredUpsell result={result} />

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Tekrar Dene
            </button>
            <button
              type="button"
              onClick={() => {
                const text =
                  mode === "kisisel"
                    ? `Yapay zeka beni tanıyor mu? ${result.score}/4 platform beni tanıyor! gh7.ai'da sen de test et.`
                    : `AI ${result.score}/4 platformda markamızı tanıyor! gh7.ai'da siz de test edin.`;
                navigator.clipboard?.writeText(text);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Sonucu Paylaş
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
