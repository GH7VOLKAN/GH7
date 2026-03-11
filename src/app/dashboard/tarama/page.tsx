"use client";

import { mockBrand, PlatformKey } from "@/lib/mock-data";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { PlatformCard } from "@/components/dashboard/platform-card";
import { QueryTable } from "@/components/dashboard/query-table";
import { formatDate } from "@/lib/utils";

const platforms: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

export default function TaramaPage() {
  return (
    <div className="space-y-8">
      {/* Genel Skor */}
      <div className="flex flex-col items-center gap-6 rounded-[14px] border border-border bg-card p-8 sm:flex-row sm:items-start">
        <ScoreRing score={mockBrand.overallScore} />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            AI GÖRÜNÜRLÜK SKORU
          </p>
          <h1 className="mt-1 text-3xl font-light tracking-[-0.04em]">
            {mockBrand.domain}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sektör: {mockBrand.sector}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Son tarama: {formatDate(mockBrand.lastScan)}
          </p>
          <button className="mt-4 rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-transform hover:scale-[1.03] active:scale-[0.97]">
            Yeniden Tara
          </button>
        </div>
      </div>

      {/* Platform Kartlari */}
      <div>
        <h2 className="mb-4 text-xl font-light tracking-[-0.04em]">
          Platform Skorları
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {platforms.map((p) => (
            <PlatformCard key={p} platform={p} data={mockBrand.platforms[p]} />
          ))}
        </div>
      </div>

      {/* Son Tarama Detayi */}
      <div>
        <h2 className="mb-4 text-xl font-light tracking-[-0.04em]">
          Son Tarama Detayı
        </h2>
        <div className="rounded-[14px] border border-border bg-card p-5">
          <QueryTable queries={mockBrand.queries} />
        </div>
      </div>
    </div>
  );
}
