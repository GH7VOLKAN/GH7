"use client";

import { useState } from "react";
import { DEMO_OPTIMIZATION } from "@/data/demo-data";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// --- Types ---
type OptimizationItem = (typeof DEMO_OPTIMIZATION.toBeOptimized)[number];

// --- Provider chips ---
const PROVIDERS = [
  "ChatGPT",
  "Gemini",
  "Perplexity",
  "AI Overview",
  "Claude",
  "Copilot",
] as const;

// --- Sorting options ---
const SORT_OPTIONS = [
  { value: "default", label: "Varsayılan" },
  { value: "aiRank", label: "AI Sira" },
  { value: "seoVsMin", label: "SEO vs Min" },
] as const;

// --- Circular Gauge ---
function CircularGauge({
  score,
  maxScore = 100,
}: {
  score: number;
  maxScore?: number;
}) {
  const radius = 54;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = score / maxScore;
  const strokeDashoffset = circumference - progress * circumference;

  const color =
    score >= 70 ? "#22C55E" : score >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex flex-col items-center">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#E5E7EB"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
          className="transition-all duration-700"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-2xl font-bold"
          fill={color}
          style={{ fontSize: "22px", fontWeight: 700 }}
        >
          {score}
        </text>
      </svg>
      <span className="mt-1 text-xs text-gray-500">/ {maxScore}</span>
    </div>
  );
}

// --- Coverage bar ---
function CoverageBar({
  value,
  color = "bg-blue-500",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{value}%</span>
    </div>
  );
}

// --- Optimization bar (for expanded content) ---
function OptBar({ label, value }: { label: string; value: number }) {
  const barColor =
    value >= 80 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 text-gray-500">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-gray-100">
        <div
          className={`h-1.5 rounded-full ${barColor}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="w-8 text-right text-gray-600">{value}%</span>
    </div>
  );
}

// --- Tag badge ---
function TagBadge({ tag }: { tag: string }) {
  if (tag === "Fırsat kanalları") {
    return (
      <span className="inline-flex items-center rounded-full border border-yellow-400 bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700">
        {tag}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
      {tag}
    </span>
  );
}

// --- Keyword row (accordion item) ---
function KeywordRow({
  item,
  index,
  variant,
}: {
  item: OptimizationItem;
  index: number;
  variant: "yellow" | "green";
}) {
  // Demo data for expanded section
  const demoPages = [
    {
      url: "isitmax.com/urunler/catida-buz-eritme",
      aiSeo: 42,
      icerik: 55,
      baslik: 70,
      aciklama: 30,
    },
    {
      url: "isitmax.com/blog/kis-donemi-cozumleri",
      aiSeo: 38,
      icerik: 40,
      baslik: 60,
      aciklama: 25,
    },
  ];

  const demoCompetitors = [
    { url: "warmup.com.tr/cati-isitma-sistemleri", score: 78 },
    { url: "isitemhatti.com/kar-eritme-cozumleri", score: 72 },
    { url: "teknoisitma.com/catida-buz-onleme", score: 65 },
  ];

  const demoOpportunityChannels = ["YouTube", "LinkedIn"];

  const coverageColor =
    variant === "green" ? "bg-green-500" : item.coverage >= 60 ? "bg-blue-500" : "bg-orange-400";

  return (
    <AccordionItem value={`${variant}-${index}`} className="border-b border-gray-100 last:border-b-0">
      <AccordionTrigger className="w-full hover:no-underline py-3 px-2">
        <div className="flex w-full flex-wrap items-center gap-3 text-sm">
          {/* Keyword */}
          <span className="mr-auto font-medium text-gray-900 min-w-[200px]">
            {item.keyword}
          </span>

          {/* Tags */}
          <div className="flex gap-1.5">
            {item.tags?.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-gray-400">My AI SEO</span>
              <span className="font-semibold">{item.myAiSeo}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-gray-400">AI Gap</span>
              <span className="font-semibold">{item.aiGap}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-gray-400">SEO vs Min</span>
              <span className="font-semibold">{item.seoVsMin}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-gray-400">Coverage</span>
              <CoverageBar value={item.coverage} color={coverageColor} />
            </div>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="space-y-5 px-2 pb-4 pt-2">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: Your pages */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700">
                Sayfalarınız
              </h4>
              <div className="space-y-3">
                {demoPages.map((page) => (
                  <div
                    key={page.url}
                    className="rounded-lg border border-gray-100 bg-gray-50/50 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-blue-600 hover:underline cursor-pointer">
                        {page.url}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        AI SEO: {page.aiSeo}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <OptBar label="Icerik %" value={page.icerik} />
                      <OptBar label="Baslik %" value={page.baslik} />
                      <OptBar label="Aciklama %" value={page.aciklama} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Top referenced pages */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700">
                En Çok Referans Alan Sayfalar
              </h4>
              <div className="space-y-2">
                {demoCompetitors.map((comp) => (
                  <div
                    key={comp.url}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5"
                  >
                    <span className="text-xs text-gray-700">{comp.url}</span>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      {comp.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Opportunity channels */}
          {item.tags?.includes("Fırsat kanalları") && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">
                Fırsat Kanalları
              </h4>
              <div className="flex gap-2">
                {demoOpportunityChannels.map((ch) => (
                  <span
                    key={ch}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700"
                  >
                    {ch === "YouTube" && (
                      <svg className="h-3.5 w-3.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    )}
                    {ch === "LinkedIn" && (
                      <svg className="h-3.5 w-3.5 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    )}
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Send to agency button */}
          <div className="flex justify-end">
            <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50">
              Ajansınıza Gönder
            </button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// =====================
// Main Page Component
// =====================
export default function İyileştirmePage() {
  const [selectedPrompt, setSelectedPrompt] = useState("all");
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedIl, setSelectedIl] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const toggleProvider = (provider: string) => {
    setSelectedProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider]
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      {/* ===== 2.1 — Site Sağlık Skoru ===== */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          <CircularGauge score={DEMO_OPTIMIZATION.domainSeoScore} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Site Sağlık Skoru
            </h2>
            <p className="text-sm text-gray-500">
              AI SEO &amp; SEO zorluk analizi
            </p>
          </div>
        </div>
      </div>

      {/* ===== 2.2 — Filtreleme ===== */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4">
          {/* Row 1: Prompt + Il selects */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Prompt dropdown */}
            <select
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            >
              <option value="all">Tum Promptlar</option>
              <option value="branded">Markali Promptlar</option>
              <option value="generic">Genel Promptlar</option>
            </select>

            {/* Il dropdown */}
            <select
              value={selectedIl}
              onChange={(e) => setSelectedIl(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            >
              <option value="all">Tum Iller</option>
              <option value="istanbul">Istanbul</option>
              <option value="ankara">Ankara</option>
              <option value="izmir">Izmir</option>
            </select>
          </div>

          {/* Row 2: Provider chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Provider:</span>
            {PROVIDERS.map((provider) => {
              const isActive = selectedProviders.includes(provider);
              return (
                <button
                  key={provider}
                  onClick={() => toggleProvider(provider)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {provider}
                </button>
              );
            })}
          </div>

          {/* Row 3: Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Siralama:</span>
            <div className="flex rounded-lg border border-gray-200">
              {SORT_OPTIONS.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    i > 0 ? "border-l border-gray-200" : ""
                  } ${
                    sortBy === opt.value
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== 2.3 — Güçlendirilmesi Gereken ===== */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Yellow header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <h3 className="text-base font-semibold text-gray-900">
            Güçlendirilmesi Gereken
          </h3>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            {DEMO_OPTIMIZATION.toBeOptimized.length}
          </span>
        </div>

        <div className="px-4 py-2">
          <Accordion>
            {DEMO_OPTIMIZATION.toBeOptimized.map((item, idx) => (
              <KeywordRow
                key={idx}
                item={item}
                index={idx}
                variant="yellow"
              />
            ))}
          </Accordion>
        </div>
      </div>

      {/* ===== 2.4 — Güçlü Alanlar ===== */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Green header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <h3 className="text-base font-semibold text-gray-900">
            Güçlü Alanlar
          </h3>
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            {DEMO_OPTIMIZATION.alreadyOptimized.length}
          </span>
        </div>

        <div className="px-6 py-3">
          <p className="mb-2 text-sm text-green-600">
            Bu alanda güçlüsunuz, korumaya devam edin
          </p>
        </div>

        <div className="px-4 pb-2">
          <Accordion>
            {DEMO_OPTIMIZATION.alreadyOptimized.map((item, idx) => (
              <KeywordRow
                key={idx}
                item={item as OptimizationItem}
                index={idx}
                variant="green"
              />
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
