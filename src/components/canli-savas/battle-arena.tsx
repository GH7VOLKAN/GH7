"use client";

import { useState, useCallback, useRef } from "react";
import { PlatformCard } from "./platform-card";
import { GH7Logo } from "@/components/gh7-logo";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";
import Link from "next/link";

type PlatformKey = "chatgpt" | "claude" | "gemini" | "perplexity" | "google_aio";
type Status = "waiting" | "streaming" | "done";

interface PlatformState {
  key: PlatformKey;
  label: string;
  icon: AIPlatform;
  text: string;
  status: Status;
  mentioned: boolean | null;
}

const INITIAL_PLATFORMS: PlatformState[] = [
  { key: "chatgpt", label: "ChatGPT", icon: "chatgpt", text: "", status: "waiting", mentioned: null },
  { key: "claude", label: "Claude", icon: "claude", text: "", status: "waiting", mentioned: null },
  { key: "gemini", label: "Gemini", icon: "gemini", text: "", status: "waiting", mentioned: null },
  { key: "perplexity", label: "Perplexity", icon: "perplexity", text: "", status: "waiting", mentioned: null },
  { key: "google_aio", label: "Google AIO", icon: "google_aio", text: "", status: "waiting", mentioned: null },
];

interface Props {
  /** Hide the CTA section (for panel version) */
  hideCTA?: boolean;
  /** Check if user already used free trial */
  checkFreeLimit?: boolean;
}

export function BattleArena({ hideCTA = false, checkFreeLimit = false }: Props) {
  const [question, setQuestion] = useState("");
  const [brandName, setBrandName] = useState("");
  const [platforms, setPlatforms] = useState<PlatformState[]>(INITIAL_PLATFORMS);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const mentionedCount = platforms.filter((p) => p.mentioned === true).length;
  const doneCount = platforms.filter((p) => p.status === "done").length;

  const startBattle = useCallback(async () => {
    if (!question.trim() || !brandName.trim()) return;

    // Free limit check
    if (checkFreeLimit) {
      const today = new Date().toDateString();
      const stored = localStorage.getItem("gh7_battle_date");
      const count = parseInt(localStorage.getItem("gh7_battle_count") ?? "0", 10);

      if (stored === today && count >= 1) {
        setError("Günlük ücretsiz deneme hakkınızı kullandınız. Pro ile sınırsız kullanın!");
        return;
      }

      // Increment
      if (stored !== today) {
        localStorage.setItem("gh7_battle_date", today);
        localStorage.setItem("gh7_battle_count", "1");
      } else {
        localStorage.setItem("gh7_battle_count", String(count + 1));
      }
    }

    setError(null);
    setIsRunning(true);
    setIsComplete(false);
    setPlatforms(INITIAL_PLATFORMS);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/canli-savas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), brandName: brandName.trim() }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setError("Sunucu hatası. Lütfen tekrar deneyin.");
        setIsRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const dataStr = line.slice(6).trim();
          if (!dataStr) continue;

          try {
            const event = JSON.parse(dataStr);

            if (event.type === "start") {
              setPlatforms((prev) =>
                prev.map((p) =>
                  p.key === event.platform ? { ...p, status: "streaming" as Status } : p
                )
              );
            }

            if (event.type === "chunk") {
              setPlatforms((prev) =>
                prev.map((p) =>
                  p.key === event.platform
                    ? { ...p, text: p.text + event.text, status: "streaming" as Status }
                    : p
                )
              );
            }

            if (event.type === "done") {
              setPlatforms((prev) =>
                prev.map((p) =>
                  p.key === event.platform
                    ? { ...p, status: "done" as Status, mentioned: event.mentioned }
                    : p
                )
              );
            }

            if (event.type === "complete") {
              setIsComplete(true);
              setIsRunning(false);
            }
          } catch {
            // Skip malformed events
          }
        }
      }

      setIsRunning(false);
      setIsComplete(true);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      }
      setIsRunning(false);
    }
  }, [question, brandName, checkFreeLimit]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center">
              <GH7Logo size="default" />
            </Link>
            {!hideCTA && (
              <Link
                href="/analiz"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Detaylı Analiz &rarr;
              </Link>
            )}
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              CANLI
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Yapay Zeka Sizi Tanıyor mu?
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto">
              Sorunuzu yazın, 5 AI platformunun canlı yanıtlarını izleyin
            </p>
          </div>

          {/* Input Form */}
          <div className="max-w-2xl mx-auto space-y-3">
            <input
              type="text"
              placeholder={"Örn: \"İstanbul'da en iyi yerden ısıtma firması hangisi?\""}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isRunning}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
              onKeyDown={(e) => e.key === "Enter" && !isRunning && startBattle()}
            />
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Marka adınız (örn: ISITMAX)"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                disabled={isRunning}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={startBattle}
                disabled={isRunning || !question.trim() || !brandName.trim()}
                className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Taranıyor...
                  </>
                ) : (
                  <>⚡ Savaşı Başlat</>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl">
                {error}
                {error.includes("Pro") && (
                  <Link href="/panel/abonelik" className="ml-2 underline font-medium">
                    Pro&apos;ya Geç
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Score Bar */}
      {(isRunning || isComplete) && (
        <div className="bg-white border-b border-gray-200 py-3">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Skor:</span>
              <span className="text-2xl font-bold text-gray-900">
                {mentionedCount}/{doneCount > 0 ? doneCount : 5}
              </span>
              <span className="text-sm text-gray-400">platformda bahsediliyorsunuz</span>
            </div>
            {isRunning && (
              <span className="text-xs text-blue-600 font-medium animate-pulse">
                Yanıtlar alınıyor...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Platform Cards Grid */}
      {(isRunning || isComplete) && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {platforms.map((p) => (
              <PlatformCard
                key={p.key}
                platform={p.icon}
                label={p.label}
                text={p.text}
                status={p.status}
                mentioned={p.mentioned}
                brandName={brandName}
              />
            ))}
          </div>
        </div>
      )}

      {/* CTA after completion */}
      {isComplete && !hideCTA && (
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {mentionedCount >= 3
                ? "Harika! Ama düzenli takip şart."
                : mentionedCount > 0
                ? "İyileşme potansiyeliniz yüksek."
                : "Acil müdahale gerekiyor."}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {mentionedCount >= 3
                ? "Rakipleriniz de büyüyor. Haftalık takip ile liderliğinizi koruyun."
                : "GH7 ile haftalık izleme, aksiyon planı ve içerik üretimi ile AI görünürlüğünüzü artırın."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/analiz"
                className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Ücretsiz Detaylı Analiz
              </Link>
              <Link
                href="/panel/abonelik"
                className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Pro ile Haftalık Takip
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
