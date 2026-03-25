"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import {
  DEMO_CITY_DATA,
  DEMO_METRICS,
  DEMO_KEYWORDS,
  DEMO_COMPETITORS,
  DEMO_CITED_PAGES,
  getScoreColor,
} from "@/data/demo-data";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSlug(name: string): string {
  return name
    .replace(/İ/g, "I")
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/\s+/g, "-");
}

function findCityBySlug(slug: string): string | null {
  for (const cityName of Object.keys(DEMO_CITY_DATA)) {
    if (toSlug(cityName) === slug) return cityName;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const cityName = findCityBySlug(slug);

  if (!cityName) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-20">
        <h1 className="text-2xl font-bold text-gray-900">Bu il bulunamadi</h1>
        <p className="text-sm text-gray-500">
          Aradiginiz il sistemde kayitli degil veya slug hatali.
        </p>
        <Link
          href="/panel/iller"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Iller sayfasina don
        </Link>
      </div>
    );
  }

  const city = DEMO_CITY_DATA[cityName];
  const factor = city.score / 100;

  // Derived metrics
  const metrics = [
    {
      label: "GEO Skor",
      value: city.score,
      suffix: "/100",
    },
    {
      label: "Ses Payi",
      value: Math.round(city.score * 0.35),
      suffix: "%",
    },
    {
      label: "Kapsam",
      value: city.score > 50 ? 100 : city.score + 20,
      suffix: "%",
    },
    {
      label: "Ort. Pozisyon",
      value: +(3.0 - city.score / 50).toFixed(1),
      suffix: "",
    },
  ];

  // City-specific keywords
  const cityKeywords = DEMO_KEYWORDS.map((kw) => ({
    ...kw,
    keyword: `${cityName} ${kw.keyword}`,
  }));

  // City-specific competitors
  const cityCompetitors = DEMO_COMPETITORS.map((c) => ({
    ...c,
    share: Math.round(c.share * (0.7 + factor * 0.6)),
  }));

  return (
    <div className="flex flex-col gap-6 px-4 py-4 md:gap-8 md:px-6 md:py-6">
      {/* Back link */}
      <Link
        href="/panel/iller"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-fit"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Iller
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {cityName}
        </h1>
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full text-white text-sm font-bold"
          style={{ backgroundColor: getScoreColor(city.score) }}
        >
          {city.score}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="border border-gray-200 rounded-xl p-6 flex flex-col gap-1"
          >
            <span className="text-xs text-gray-500">{m.label}</span>
            <span className="text-2xl font-bold text-gray-900">
              {m.value}
              {m.suffix && (
                <span className="text-sm font-normal text-gray-400">
                  {m.suffix}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Aramalar tablosu */}
      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aramalar</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Anahtar Kelime</th>
                <th className="px-4 py-3">Ses Payi</th>
                <th className="px-4 py-3">Kapsam</th>
                <th className="px-4 py-3">Ort. Pozisyon</th>
                <th className="px-4 py-3">Duygu</th>
              </tr>
            </thead>
            <tbody>
              {cityKeywords.map((kw) => (
                <tr
                  key={kw.keyword}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {kw.keyword}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full"
                          style={{ width: `${kw.shareOfVoice}%` }}
                        />
                      </div>
                      <span>{kw.shareOfVoice}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full"
                          style={{ width: `${kw.coverage}%` }}
                        />
                      </div>
                      <span>{kw.coverage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {kw.avgPosition}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full"
                          style={{ width: `${Math.round(kw.sentiment * 100)}%` }}
                        />
                      </div>
                      <span>{(kw.sentiment * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rakipler */}
      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rakipler</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {cityCompetitors.map((c) => (
            <div
              key={c.name}
              className="border border-gray-200 rounded-xl p-4 text-center"
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {c.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">{c.share}% ses payi</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referans Sayfalar */}
      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Referans Sayfalar
        </h2>
        <ul className="space-y-2">
          {DEMO_CITED_PAGES.map((p) => (
            <li
              key={p.path}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm"
            >
              <span className="font-mono text-gray-700">{p.path}</span>
              <span className="text-gray-500">
                {p.cites} referans &middot; {p.providers} saglayici
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow transition hover:bg-gray-800">
          Bu ili optimize et &rarr; Ajansınıza gönderin
        </button>
      </div>
    </div>
  );
}
