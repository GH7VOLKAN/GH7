"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PlayIcon,
  BrainCircuitIcon,
  BarChart3Icon,
  Loader2Icon,
  CheckIcon,
  ArrowRightIcon,
} from "lucide-react";

interface WelcomeHeroProps {
  brandId: string;
  brandName: string;
  activePromptCount: number;
}

export function WelcomeHero({ brandId, brandName, activePromptCount }: WelcomeHeroProps) {
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "failed">("idle");
  const [scanId, setScanId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  async function startScan() {
    setStatus("running");
    setProgress(5);
    try {
      const res = await fetch("/api/scans/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });
      const data = await res.json();
      if (res.ok || res.status === 409) {
        setScanId(data.scanId);
      } else {
        setStatus("failed");
      }
    } catch {
      setStatus("failed");
    }
  }

  const checkStatus = useCallback(async () => {
    if (!scanId) return;
    try {
      const res = await fetch(`/api/scans/${scanId}/status`);
      const data = await res.json();
      if (data.progress) setProgress(data.progress);
      if (data.status === "completed") {
        setStatus("completed");
        setProgress(100);
        setTimeout(() => window.location.reload(), 1500);
      } else if (data.status === "failed") {
        setStatus("failed");
      }
    } catch {
      // Ignore poll errors
    }
  }, [scanId]);

  useEffect(() => {
    if (status !== "running" || !scanId) return;
    const interval = setInterval(checkStatus, 3000);
    // Fake progress animation
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 90));
    }, 5000);
    return () => {
      clearInterval(interval);
      clearInterval(progressTimer);
    };
  }, [status, scanId, checkStatus]);

  const steps = [
    {
      icon: PlayIcon,
      title: "Taramayı Başlatın",
      desc: `${activePromptCount} soru, 4 platformda test edilecek`,
      active: status === "idle",
      done: status === "running" || status === "completed",
    },
    {
      icon: BrainCircuitIcon,
      title: "Yapay Zekalar Analiz Etsin",
      desc: "ChatGPT, Claude, Gemini, Perplexity",
      active: status === "running",
      done: status === "completed",
    },
    {
      icon: BarChart3Icon,
      title: "Sonuçlarınızı Görün",
      desc: "Skor, rakipler, kaynaklar, aksiyon planı",
      active: false,
      done: status === "completed",
    },
  ];

  return (
    <div className="px-4 lg:px-6">
      <div className="mx-auto max-w-2xl py-12 text-center">
        {/* Hero */}
        <h1 className="text-3xl font-light tracking-[-0.04em] md:text-4xl">
          Hoş Geldiniz!
          <br />
          <span className="font-semibold">İlk Taramanızı Başlatın</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          <span className="font-medium text-foreground">{brandName}</span> için{" "}
          {activePromptCount} soru hazir. 4 yapay zekada markanızın ne kadar
          tanındığını öğrenin.
        </p>

        {/* 3-Step Visual */}
        <div className="mx-auto mt-12 grid max-w-xl gap-4 sm:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={`relative rounded-xl border p-5 text-center transition-all ${
                  s.done
                    ? "border-foreground/20 bg-foreground/5"
                    : s.active
                      ? "border-foreground shadow-sm"
                      : "border-border"
                }`}
              >
                <div
                  className={`mx-auto flex size-10 items-center justify-center rounded-lg transition-colors ${
                    s.done
                      ? "bg-foreground text-background"
                      : s.active
                        ? "bg-foreground/10"
                        : "bg-muted"
                  }`}
                >
                  {s.done ? (
                    <CheckIcon className="size-5" />
                  ) : s.active && status === "running" ? (
                    <Loader2Icon className="size-5 animate-spin" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold">{s.title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{s.desc}</p>

                {/* Connector arrow */}
                {i < 2 && (
                  <ArrowRightIcon className="absolute -right-3 top-1/2 hidden size-4 -translate-y-1/2 text-muted-foreground/30 sm:block" />
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10">
          {status === "idle" && (
            <button
              onClick={startScan}
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-8 py-4 text-base font-semibold text-background transition-all hover:opacity-90 active:scale-[0.99]"
            >
              <PlayIcon className="size-5" />
              Taramayı Başlat
            </button>
          )}

          {status === "running" && (
            <div className="mx-auto max-w-xs space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <Loader2Icon className="size-4 animate-spin" />
                Tarama devam ediyor...
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Yaklaşık 2-3 dakika sürer
              </p>
            </div>
          )}

          {status === "completed" && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-foreground/10 px-6 py-3 text-sm font-medium">
              <CheckIcon className="size-4" />
              Tarama tamamlandı! Sayfa yenileniyor...
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-3 text-center">
              <p className="text-sm text-red-500">Tarama başlatılamadı. Tekrar deneyin.</p>
              <button
                onClick={startScan}
                className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background"
              >
                Tekrar Dene
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        {status === "idle" && (
          <p className="mt-6 text-xs text-muted-foreground/60">
            Tarama yaklaşık 2-3 dakika sürer. Sayfayı kapatabilirsiniz, sonuçlar hazır olunca bildirim alırsınız.
          </p>
        )}
      </div>
    </div>
  );
}
