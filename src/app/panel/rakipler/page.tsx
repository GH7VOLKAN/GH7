"use client";

import { useState } from "react";
import { DEMO_COMPETITORS, DEMO_KEYWORDS } from "@/data/demo-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Building } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import { Progress } from "@/components/ui/progress";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const ALL_COMPETITORS = [
  { name: "ISITMAX", domain: "isitmax.com", mentions: 5, share: 26 },
  { name: "Warmup", domain: "warmup.com.tr", mentions: 3, share: 5 },
  { name: "Viessmann", domain: "viessmann.com.tr", mentions: 4, share: 8 },
  { name: "Danfoss", domain: "danfoss.com", mentions: 2, share: 4 },
  { name: "RezistansMarket", domain: "rezistansmarket.com", mentions: 2, share: 4 },
  { name: "Uponor", domain: "uponor.com", mentions: 2, share: 3 },
  { name: "Alarko Carrier", domain: "alarko-carrier.com.tr", mentions: 1, share: 2 },
  { name: "ETI Muhendislik", domain: "etimuhendislik.com", mentions: 3, share: 5 },
  { name: "GSHP Türkiye", domain: "gshpturkiye.com", mentions: 3, share: 9 },
  { name: "HeatTrace", domain: "heattrace.com.tr", mentions: 2, share: 3 },
  { name: "Giacomini", domain: "giacomini.com", mentions: 1, share: 2 },
  { name: "Schluter Systems", domain: "schluter-systems.com", mentions: 1, share: 1 },
  { name: "Daikin", domain: "daikin.com.tr", mentions: 2, share: 3 },
  { name: "Bosch Termoteknoloji", domain: "bosch-climate.com.tr", mentions: 2, share: 3 },
  { name: "Buderus", domain: "buderus.com.tr", mentions: 1, share: 2 },
  { name: "Baymak", domain: "baymak.com.tr", mentions: 2, share: 3 },
  { name: "De Dietrich", domain: "dedietrich.com.tr", mentions: 1, share: 1 },
  { name: "Protherm", domain: "protherm.com.tr", mentions: 1, share: 2 },
  { name: "Ferroli", domain: "ferroli.com.tr", mentions: 1, share: 2 },
  { name: "Ariston", domain: "aristonthermo.com.tr", mentions: 2, share: 3 },
  { name: "Demirdöküm", domain: "demirdokum.com.tr", mentions: 2, share: 4 },
  { name: "Honeywell", domain: "honeywell.com", mentions: 1, share: 1 },
  { name: "Herz Armaturen", domain: "herz.com.tr", mentions: 1, share: 1 },
  { name: "Purmo", domain: "purmo.com", mentions: 1, share: 1 },
];

// The user brand (first entry)
const USER_BRAND = ALL_COMPETITORS[0];

// Competitors only (exclude self)
const COMPETITORS = ALL_COMPETITORS.filter((c) => c.name !== USER_BRAND.name);

// Build keyword comparison data for each competitor
type KeywordComparison = {
  keyword: string;
  yourPosition: number;
  competitorPosition: number;
  winner: "you" | "competitor" | "tie";
};

type CityComparison = {
  city: string;
  yourScore: number;
  competitorScore: number;
  leader: "you" | "competitor" | "tie";
};

function generateKeywordComparisons(competitorName: string): KeywordComparison[] {
  // Use DEMO_KEYWORDS to create comparisons, with deterministic pseudo-random values
  return DEMO_KEYWORDS.map((kw, idx) => {
    const seed = competitorName.length + idx;
    const yourPos = Math.max(1, Math.round(kw.avgPosition ?? 1.5));
    const compPos = Math.max(1, ((seed * 7 + 3) % 5) + 1);
    const winner: "you" | "competitor" | "tie" =
      yourPos < compPos ? "you" : yourPos > compPos ? "competitor" : "tie";
    return {
      keyword: kw.keyword,
      yourPosition: yourPos,
      competitorPosition: compPos,
      winner,
    };
  });
}

function generateCityComparisons(competitorName: string): CityComparison[] {
  const cities = [
    "Istanbul",
    "Ankara",
    "Izmir",
    "Bursa",
    "Antalya",
    "Balikesir",
    "Konya",
    "Trabzon",
  ];
  return cities.map((city, idx) => {
    const seed = competitorName.length + idx;
    const yourScore = [82, 71, 65, 58, 45, 91, 38, 22][idx] ?? 50;
    const compScore = Math.max(0, ((seed * 13 + 7) % 80) + 10);
    const leader: "you" | "competitor" | "tie" =
      yourScore > compScore ? "you" : yourScore < compScore ? "competitor" : "tie";
    return { city, yourScore, competitorScore: compScore, leader };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RakiplerPage() {
  const [selectedCompetitor, setSelectedCompetitor] = useState<
    (typeof COMPETITORS)[number] | null
  >(null);

  const keywordComparisons = selectedCompetitor
    ? generateKeywordComparisons(selectedCompetitor.name)
    : [];

  const cityComparisons = selectedCompetitor
    ? generateCityComparisons(selectedCompetitor.name)
    : [];

  const yourWins = keywordComparisons.filter((k) => k.winner === "you").length;
  const compWins = keywordComparisons.filter((k) => k.winner === "competitor").length;

  return (
    <div className="space-y-6">
      {/* Empty state - aktif data yokken gösterilir */}
      {/* {COMPETITORS.length === 0 && (
        <EmptyState
          icon={Building}
          title="Rakip analizi için tarama başlatın"
          description="Rakiplerinizi ekleyin ve AI görünürlük karşılaştırması yapın."
          action={<button className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium">+ Rakip Ekle</button>}
        />
      )} */}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rakipler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI yanıtlarından otomatik tespit edilen rakipleriniz
          </p>
        </div>
        <Button className="bg-black text-white hover:bg-black/90">
          <Plus className="mr-1.5 size-4" />
          Rakip Ekle
        </Button>
      </div>

      {/* Competitor Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {COMPETITORS.map((comp) => (
          <button
            key={comp.domain}
            type="button"
            onClick={() => setSelectedCompetitor(comp)}
            className="flex items-start gap-4 rounded-xl border border-gray-200 p-6 text-left transition hover:shadow-sm"
          >
            {/* Avatar */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
              {comp.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {comp.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {comp.domain}
              </p>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">
                    {comp.mentions}
                  </span>{" "}
                  anahtar kelime
                </span>
                <span>
                  SoV{" "}
                  <span className="font-medium text-foreground">
                    %{comp.share}
                  </span>
                </span>
              </div>

              {/* Share of Voice progress bar */}
              <Progress value={Math.min(comp.share, 100)} className="mt-2 w-full [&_[data-slot=progress-track]]:h-1.5" />
            </div>
          </button>
        ))}
      </div>

      {/* Competitor Detail Dialog */}
      <Dialog
        open={!!selectedCompetitor}
        onOpenChange={(open) => {
          if (!open) setSelectedCompetitor(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Siz vs {selectedCompetitor?.name}
            </DialogTitle>
            <DialogDescription>
              Anahtar kelime ve il bazlı karşılaştırma
            </DialogDescription>
          </DialogHeader>

          {selectedCompetitor && (
            <div className="space-y-6">
              {/* Summary badges */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  Siz: {yourWins} kazanım
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                  {selectedCompetitor.name}: {compWins} kazanım
                </span>
              </div>

              {/* Keyword comparison table */}
              <div>
                <h3 className="mb-3 text-sm font-medium">
                  Anahtar Kelime Karşılaştırması
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        <th className="px-4 py-2.5 font-medium text-muted-foreground">
                          Anahtar Kelime
                        </th>
                        <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">
                          Siz
                        </th>
                        <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">
                          {selectedCompetitor.name}
                        </th>
                        <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">
                          Sonuç
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywordComparisons.map((row) => (
                        <tr
                          key={row.keyword}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="max-w-[220px] truncate px-4 py-2.5 text-xs">
                            {row.keyword}
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs tabular-nums">
                            #{row.yourPosition}
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs tabular-nums">
                            #{row.competitorPosition}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {row.winner === "you" ? (
                              <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                Siz
                              </span>
                            ) : row.winner === "competitor" ? (
                              <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                                {selectedCompetitor.name}
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500">
                                Eşit
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* City comparison */}
              <div>
                <h3 className="mb-3 text-sm font-medium">
                  İl Bazlı Karşılaştırma
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {cityComparisons.map((row) => (
                    <div
                      key={row.city}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5"
                    >
                      <span className="text-xs font-medium">{row.city}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span
                          className={
                            row.leader === "you"
                              ? "font-semibold text-green-600"
                              : "text-muted-foreground"
                          }
                        >
                          Siz: {row.yourScore}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span
                          className={
                            row.leader === "competitor"
                              ? "font-semibold text-red-600"
                              : "text-muted-foreground"
                          }
                        >
                          {selectedCompetitor.name}: {row.competitorScore}
                        </span>
                        {row.leader === "you" ? (
                          <span className="inline-flex size-5 items-center justify-center rounded-full bg-green-50 text-[10px] text-green-700">
                            +
                          </span>
                        ) : row.leader === "competitor" ? (
                          <span className="inline-flex size-5 items-center justify-center rounded-full bg-red-50 text-[10px] text-red-700">
                            -
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
