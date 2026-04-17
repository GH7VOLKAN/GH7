"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { AuditItemRow } from "./audit-item-row";
import { ProUpgradeBanner } from "@/components/panel/pro-upgrade-banner";
import type { AuditItemResult } from "@/lib/ai/audit-43";

interface Props {
  plan: string;
  userScore: number;
  competitorScore: number | null;
  competitorName: string | null;
  categories: {
    key: string;
    label: string;
    score: number;
    items: AuditItemResult[];
    summary?: string | null;
    criticalAction?: string | null;
  }[];
}

function scoreBarColor(score: number): string {
  if (score >= 60) return "bg-green-500";
  if (score >= 30) return "bg-yellow-500";
  return "bg-red-500";
}

export function AuditDetayContent({
  plan,
  userScore,
  competitorScore,
  competitorName,
  categories,
}: Props) {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat");
  const [openKey, setOpenKey] = useState<string | null>(initialCat);

  useEffect(() => {
    if (initialCat) {
      // Scroll to that category
      setTimeout(() => {
        const el = document.getElementById(`cat-${initialCat}`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [initialCat]);

  const toggle = (key: string) => setOpenKey((k) => (k === key ? null : key));

  return (
    <div className="space-y-6">
      {/* Comparison bar */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Skor Karşılaştırması
        </h2>
        <div className="mt-4 space-y-3">
          <ScoreBar label="Siz" score={userScore} />
          {competitorScore != null && (
            <ScoreBar
              label={competitorName ? `Rakip: ${competitorName}` : "Rakip"}
              score={competitorScore}
              muted
            />
          )}
        </div>
      </section>

      {/* 6 category accordion */}
      <section>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {categories.map((cat, idx) => {
            const isOpen = openKey === cat.key;
            const passCount = cat.items.filter((i) => i.status === "pass").length;
            const partialCount = cat.items.filter((i) => i.status === "partial").length;
            const failCount = cat.items.filter((i) => i.status === "fail").length;

            return (
              <div
                id={`cat-${cat.key}`}
                key={cat.key}
                className={idx > 0 ? "border-t border-gray-100" : ""}
              >
                <button
                  type="button"
                  onClick={() => toggle(cat.key)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {isOpen ? (
                      <ChevronDown className="size-4 shrink-0 text-gray-400" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 text-gray-400" />
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-900">
                        {cat.label}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <CheckCircle2 className="size-3" />
                          {passCount}
                        </span>
                        <span className="inline-flex items-center gap-1 text-yellow-700">
                          <AlertTriangle className="size-3" />
                          {partialCount}
                        </span>
                        <span className="inline-flex items-center gap-1 text-red-700">
                          <XCircle className="size-3" />
                          {failCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="text-lg font-bold text-gray-900">
                      {cat.score}
                      <span className="text-xs font-normal text-gray-400">/100</span>
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    {cat.summary && (
                      <div className="bg-gray-50 px-6 py-3 text-sm text-gray-700">
                        <strong className="text-gray-900">Durum:</strong>{" "}
                        {cat.summary}
                      </div>
                    )}
                    {cat.items.length === 0 ? (
                      <div className="px-6 py-6 text-center text-sm text-gray-500">
                        Bu kategoride henüz madde yok.
                      </div>
                    ) : (
                      <div>
                        {cat.items.map((item) => (
                          <AuditItemRow
                            key={item.key}
                            item={item}
                            plan={plan}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <h3 className="text-base font-semibold text-gray-900">
          Bu kırmızıları yeşile çevirelim
        </h3>
        <p className="mt-1.5 text-sm text-gray-600">
          Eksiklerinizi profesyonel hizmet paketlerimizle kapatabilirsiniz.
        </p>
        <Link
          href="/panel/hizmetler"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Hizmet Paketlerini Gör
          <ArrowRight className="size-4" />
        </Link>
      </section>

      <ProUpgradeBanner plan={plan} variant="page" />
    </div>
  );
}

function ScoreBar({
  label,
  score,
  muted,
}: {
  label: string;
  score: number;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className={muted ? "text-gray-600" : "text-gray-900 font-medium"}>
          {label}
        </span>
        <span className="font-bold text-gray-900">
          {score}
          <span className="text-xs font-normal text-gray-400">/100</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${scoreBarColor(score)} ${muted ? "opacity-60" : ""}`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  );
}
