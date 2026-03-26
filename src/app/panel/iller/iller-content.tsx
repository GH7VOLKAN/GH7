"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TurkeyMap } from "@/components/panel/turkey-map";
import type { CityData } from "./page";

// --- Props ---
interface Props {
  cities: CityData[];
  mapCityData: Record<string, { score: number; status: string }>;
  strongCount: number;
  moderateCount: number;
  weakCount: number;
  topCompetitorName: string | null;
}

type SortField = "city" | "score" | "mentionRate" | "mentionCount";
type SortDirection = "asc" | "desc";

// --- Helpers ---
function getScoreColor(score: number): string {
  if (score >= 50) return "#22C55E";
  if (score >= 20) return "#F59E0B";
  return "#EF4444";
}

function toSlug(name: string): string {
  const TURKISH_CHAR_MAP: Record<string, string> = {
    "\u00E7": "c", "\u011F": "g", "ı": "i", "İ": "i", "\u00F6": "o",
    "\u015F": "s", "\u00FC": "u", "\u00C7": "c", "\u011E": "g", "\u00D6": "o",
    "\u015E": "s", "\u00DC": "u",
  };
  return name
    .split("")
    .map((c) => TURKISH_CHAR_MAP[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// --- Sort icon ---
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

// --- Main Component ---
export function IllerContent({
  cities,
  mapCityData,
  strongCount,
  moderateCount,
  weakCount,
  topCompetitorName,
}: Props) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const trackedCities = useMemo(() => {
    return cities.filter((c) => c.status !== "not-tracked");
  }, [cities]);

  const sortedCities = useMemo(() => {
    const copy = [...trackedCities];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "city": cmp = a.name.localeCompare(b.name, "tr"); break;
        case "score": cmp = a.score - b.score; break;
        case "mentionRate": cmp = a.mentionRate - b.mentionRate; break;
        case "mentionCount": cmp = a.mentionCount - b.mentionCount; break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [trackedCities, sortField, sortDirection]);

  const selectedCityData = selectedCity
    ? cities.find((c) => c.slug === selectedCity) ?? null
    : null;

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

  const totalTracked = strongCount + moderateCount + weakCount;

  return (
    <div className="flex flex-col gap-6 px-4 py-4 md:gap-8 md:px-6 md:py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">İller</h1>
          <p className="text-sm text-gray-500 mt-1">
            Şehir bazlı GEO görünürlük analizi &middot;{" "}
            <span className="font-medium text-gray-700">{totalTracked}</span> il takip ediliyor
          </p>
        </div>
      </div>

      {/* Turkey Map */}
      <div className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-sm transition-shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold">Türkiye Haritası</h2>

          <select
            value={selectedCity ?? ""}
            onChange={handleSelectChange}
            className="w-full sm:w-64 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-gray-400 focus:outline-none"
          >
            <option value="">Bir il seçin...</option>
            {cities
              .filter((c) => c.status !== "not-tracked")
              .sort((a, b) => a.name.localeCompare(b.name, "tr"))
              .map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        <TurkeyMap
          cityData={mapCityData}
          onCityClick={(city: string) => handleCityClick(toSlug(city))}
          className="min-h-[280px]"
        />
      </div>

      {/* City Detail Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          selectedCityData ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {selectedCityData && (
          <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col gap-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">{selectedCityData.name}</h2>
                <p className="text-sm text-gray-500">
                  {selectedCityData.status === "strong"
                    ? "Güçlü"
                    : selectedCityData.status === "moderate"
                    ? "Orta"
                    : "Zayıf"}
                </p>
              </div>
              <div
                className="ml-auto flex items-center justify-center w-16 h-16 rounded-full text-white text-xl font-bold"
                style={{ backgroundColor: getScoreColor(selectedCityData.score) }}
              >
                {selectedCityData.score}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xs text-gray-500">GEO Skor</span>
                <span className="text-xl font-bold">{selectedCityData.score}<span className="text-sm font-normal text-gray-400">/100</span></span>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xs text-gray-500">Mention Oranı</span>
                <span className="text-xl font-bold">{selectedCityData.mentionRate}<span className="text-sm font-normal text-gray-400">%</span></span>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xs text-gray-500">Mention Sayısı</span>
                <span className="text-xl font-bold">{selectedCityData.mentionCount}</span>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xs text-gray-500">Toplam Sonuç</span>
                <span className="text-xl font-bold">{selectedCityData.totalResults}</span>
              </div>
            </div>

            <Link
              href={`/panel/iller/${selectedCityData.slug}`}
              className="w-full sm:w-auto self-start inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow transition hover:bg-gray-800"
            >
              Detaylı il analizi &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* City Comparison Table */}
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
                    ["city", "Il"],
                    ["score", "GEO Skor"],
                    ["mentionRate", "Mention Oranı"],
                    ["mentionCount", "Mention"],
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
                <th className="px-6 py-3 whitespace-nowrap">1. Rakip</th>
              </tr>
            </thead>
            <tbody>
              {sortedCities.map((row) => {
                const isSelected = selectedCity === row.slug;
                return (
                  <tr
                    key={row.slug}
                    onClick={() => handleCityClick(row.slug)}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${
                      isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">{row.name}</td>
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
                    <td className="px-6 py-3 text-gray-600">{row.mentionRate}%</td>
                    <td className="px-6 py-3 text-gray-600">{row.mentionCount}/{row.totalResults}</td>
                    <td className="px-6 py-3 text-gray-600">{topCompetitorName ?? "-"}</td>
                  </tr>
                );
              })}
              {sortedCities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                    Takip edilen il bulunamadı. Tarama tamamlandıktan sonra veriler görünecek.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
