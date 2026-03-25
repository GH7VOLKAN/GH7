"use client";

import { useState, useMemo } from "react";
import {
  DEMO_CITY_DATA,
  DEMO_METRICS,
  DEMO_KEYWORDS,
  DEMO_COMPETITORS,
  getScoreColor,
  getScoreLabel,
  getCityStats,
} from "@/data/demo-data";
import { TurkeyMap } from "@/components/panel/turkey-map";
import { MapPin } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortField = "city" | "score" | "shareOfVoice" | "coverage" | "topCompetitor";
type SortDirection = "asc" | "desc";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", İ: "i", i: "i", I: "i",
  ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u",
};

function toSlug(name: string): string {
  return name
    .split("")
    .map((c) => TURKISH_CHAR_MAP[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Find the original city name (key in DEMO_CITY_DATA) from a slug */
function cityNameFromSlug(slug: string): string | null {
  for (const name of Object.keys(DEMO_CITY_DATA)) {
    if (toSlug(name) === slug) return name;
  }
  return null;
}

/** Derive per-city metrics from the base metrics, adjusted by the city score */
function getCityMetrics(cityScore: number) {
  const factor = cityScore / 100;
  return [
    {
      label: "GEO Skor",
      value: cityScore,
      suffix: "/100",
      change: Math.round((DEMO_METRICS.changes.geoScore ?? 0) * factor),
    },
    {
      label: "Ses Payı",
      value: Math.round(DEMO_METRICS.shareOfVoice * factor),
      suffix: "%",
      change: Math.round((DEMO_METRICS.changes.shareOfVoice ?? 0) * factor),
    },
    {
      label: "Kapsam",
      value: Math.round(DEMO_METRICS.coverage * factor),
      suffix: "%",
      change: 0,
    },
    {
      label: "Ort. Pozisyon",
      value: +(DEMO_METRICS.avgPosition + (1 - factor) * 0.8).toFixed(1),
      suffix: "",
      change: DEMO_METRICS.changes.avgPosition,
    },
  ];
}

/** Generate city-specific keywords */
function getCityKeywords(cityName: string) {
  return DEMO_KEYWORDS.map((kw) => ({
    ...kw,
    keyword: `${cityName} ${kw.keyword}`,
  }));
}

/** Generate city-specific competitors with slight score variation */
function getCityCompetitors(cityScore: number) {
  const factor = cityScore / 100;
  return DEMO_COMPETITORS.map((c) => ({
    ...c,
    share: Math.round(c.share * (0.7 + factor * 0.6)),
  }));
}

/** Referenced pages (static demo data) */
const REFERENCED_PAGES = [
  { path: "/banyo-yerden-isitma", cites: 7 },
  { path: "/endustriyel-varil-isitma-kabli", cites: 5 },
  { path: "/seralarda-toprak-alti-yerden-isitma-projeleri", cites: 5 },
  { path: "/boru-isitici-kablo-heat-trace", cites: 5 },
];

// ---------------------------------------------------------------------------
// Sort icon
// ---------------------------------------------------------------------------

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <span className="inline-flex flex-col ml-1 leading-none -space-y-0.5">
      <svg
        width="8"
        height="6"
        viewBox="0 0 8 6"
        className={active && direction === "asc" ? "text-gray-900" : "text-gray-300"}
      >
        <path d="M4 0L8 6H0L4 0Z" fill="currentColor" />
      </svg>
      <svg
        width="8"
        height="6"
        viewBox="0 0 8 6"
        className={active && direction === "desc" ? "text-gray-900" : "text-gray-300"}
      >
        <path d="M4 6L0 0H8L4 6Z" fill="currentColor" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function IllerPage() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // ---- Tracked cities for table ----
  const trackedCities = useMemo(() => {
    return Object.entries(DEMO_CITY_DATA)
      .filter(([, d]) => d.status !== "not-tracked")
      .map(([name, d]) => {
        const factor = d.score / 100;
        return {
          city: name,
          score: d.score,
          status: d.status,
          shareOfVoice: Math.round(DEMO_METRICS.shareOfVoice * factor),
          coverage: Math.round(DEMO_METRICS.coverage * factor),
          topCompetitor:
            DEMO_COMPETITORS.find((c) => c.name !== "ISITMAX" && c.name !== "Diğer")?.name ?? "-",
        };
      });
  }, []);

  const sortedCities = useMemo(() => {
    const copy = [...trackedCities];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "city":
          cmp = a.city.localeCompare(b.city, "tr");
          break;
        case "score":
          cmp = a.score - b.score;
          break;
        case "shareOfVoice":
          cmp = a.shareOfVoice - b.shareOfVoice;
          break;
        case "coverage":
          cmp = a.coverage - b.coverage;
          break;
        case "topCompetitor":
          cmp = a.topCompetitor.localeCompare(b.topCompetitor, "tr");
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [trackedCities, sortField, sortDirection]);

  // ---- Derived selected-city data ----
  const selectedCityName = selectedCity ? cityNameFromSlug(selectedCity) : null;
  const selectedCityData = selectedCityName ? DEMO_CITY_DATA[selectedCityName] : null;

  // ---- Event handlers ----
  function handleCityClick(slug: string) {
    setSelectedCity((prev) => (prev === slug ? null : slug));
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSelectedCity(val || null);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }

  // ---- Stats ----
  const stats = getCityStats();

  // ---- Render ----
  return (
    <div className="flex flex-col gap-6 px-4 py-4 md:gap-8 md:px-6 md:py-6">
      {/* Empty state - aktif data yokken gösterilir */}
      {/* {trackedCities.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="Henüz il takip etmiyorsunuz"
          description="Takip etmek istediğiniz illeri ekleyin."
          action={<button className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium">+ İl Ekle</button>}
        />
      )} */}

      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">İller</h1>
          <p className="text-sm text-gray-500 mt-1">
            Şehir bazlı GEO görünürlük analizi &middot;{" "}
            <span className="font-medium text-gray-700">{stats.strong + stats.moderate + stats.weak}</span>{" "}
            il takip ediliyor
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-500">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Yeni il ekle
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4.1 — Türkiye Haritası */}
      {/* ------------------------------------------------------------------ */}
      <div className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-sm transition-shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold">Türkiye Haritası</h2>

          {/* City picker dropdown */}
          <select
            value={selectedCity ?? ""}
            onChange={handleSelectChange}
            className="w-full sm:w-64 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-gray-400 focus:outline-none"
          >
            <option value="">Bir il seçin...</option>
            {Object.entries(DEMO_CITY_DATA)
              .filter(([, d]) => d.status !== "not-tracked")
              .sort(([a], [b]) => a.localeCompare(b, "tr"))
              .map(([name]) => (
                <option key={name} value={toSlug(name)}>
                  {name}
                </option>
              ))}
          </select>
        </div>

        <TurkeyMap
          cityData={DEMO_CITY_DATA}
          onCityClick={handleCityClick}
          className="min-h-[280px]"
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4.2 — İl Detay Paneli */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          selectedCityName && selectedCityData
            ? "max-h-[2000px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        {selectedCityName && selectedCityData && (
          <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col gap-6 hover:shadow-sm transition-shadow">
            {/* City header */}
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">{selectedCityName}</h2>
                <p className="text-sm text-gray-500">{getScoreLabel(selectedCityData.score)}</p>
              </div>
              <div
                className="ml-auto flex items-center justify-center w-16 h-16 rounded-full text-white text-xl font-bold"
                style={{ backgroundColor: getScoreColor(selectedCityData.score) }}
              >
                {selectedCityData.score}
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {getCityMetrics(selectedCityData.score).map((m) => (
                <div
                  key={m.label}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col gap-1 hover:shadow-sm transition-shadow"
                >
                  <span className="text-xs text-gray-500">{m.label}</span>
                  <span className="text-xl font-bold">
                    {m.value}
                    {m.suffix && <span className="text-sm font-normal text-gray-400">{m.suffix}</span>}
                  </span>
                  {m.change !== 0 && (
                    <span
                      className={`text-xs font-medium ${
                        m.change > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {m.change > 0 ? "+" : ""}
                      {m.change}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Keywords */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Bu ilde en çok sorulan aramalar
              </h3>
              <div className="flex flex-wrap gap-2">
                {getCityKeywords(selectedCityName).map((kw) => (
                  <span
                    key={kw.keyword}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700"
                  >
                    {kw.keyword}
                    <span className="text-gray-400">({kw.shareOfVoice}%)</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Competitors */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Bu ildeki rakipler</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {getCityCompetitors(selectedCityData.score).map((c) => (
                  <div
                    key={c.name}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-center"
                  >
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.share}% ses payı</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Referenced pages */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Referans alınan sayfalarınız
              </h3>
              <ul className="space-y-2">
                {REFERENCED_PAGES.map((p) => (
                  <li
                    key={p.path}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2 text-sm"
                  >
                    <span className="font-mono text-gray-700">{p.path}</span>
                    <span className="text-gray-500">{p.cites} referans</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <button className="w-full sm:w-auto self-start inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow transition hover:bg-gray-800">
              Bu ili optimize et &rarr; Ajansınıza gönderin
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4.3 — Il Karşılaştırma Tablosu */}
      {/* ------------------------------------------------------------------ */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-sm transition-shadow">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">İl Karşılaştırma Tablosu</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Takip edilen {trackedCities.length} il
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {(
                  [
                    ["city", "İl"],
                    ["score", "GEO Skor"],
                    ["shareOfVoice", "Ses Payı"],
                    ["coverage", "Kapsam"],
                    ["topCompetitor", "1. Rakip"],
                  ] as [SortField, string][]
                ).map(([field, label]) => (
                  <th
                    key={field}
                    className="px-6 py-3 cursor-pointer select-none whitespace-nowrap hover:text-gray-700 transition-colors"
                    onClick={() => handleSort(field)}
                  >
                    <span className="inline-flex items-center">
                      {label}
                      <SortIcon active={sortField === field} direction={sortDirection} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCities.map((row) => {
                const isSelected = selectedCity === toSlug(row.city);
                return (
                  <tr
                    key={row.city}
                    onClick={() => handleCityClick(toSlug(row.city))}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${
                      isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">{row.city}</td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: `${getScoreColor(row.score)}18`,
                          color: getScoreColor(row.score),
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: getScoreColor(row.score) }}
                        />
                        {row.score}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{row.shareOfVoice}%</td>
                    <td className="px-6 py-3 text-gray-600">{row.coverage}%</td>
                    <td className="px-6 py-3 text-gray-600">{row.topCompetitor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
