"use client";

import { competitorRows, competitorDetail } from "@/lib/mock-data/competitors";
import { platformLabels, PlatformKey } from "@/lib/types";
import { getScoreColor } from "@/lib/utils";

const platforms: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

const userRow = competitorRows.find((r) => r.isUser);
const competitorCount = competitorRows.filter((r) => !r.isUser).length;

export default function Rakipler() {
  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="rounded-[14px] border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          RAKİP İSTİHBARATI
        </p>
        <h1 className="mt-1 text-2xl font-light tracking-[-0.04em]">
          Rakip Analizi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {competitorCount} rakip takip ediliyor
        </p>
      </div>

      {/* Competitor table */}
      <div className="rounded-[14px] border border-border bg-card p-5">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Tüm Rakipler
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Firma
                </th>
                <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Domain
                </th>
                <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Atıf Skoru
                </th>
                <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Hazırlık Skoru
                </th>
                {platforms.map((p) => (
                  <th
                    key={p}
                    className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {platformLabels[p].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitorRows.map((row) => (
                <tr
                  key={row.domain}
                  className={`border-b border-border last:border-0 ${
                    row.isUser ? "bg-muted/30" : ""
                  }`}
                >
                  <td className="py-3 pr-4">
                    <span
                      className={`tracking-[-0.02em] ${
                        row.isUser ? "font-bold" : "font-medium"
                      }`}
                    >
                      {row.name}
                    </span>
                    {row.isUser && (
                      <span className="ml-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        (siz)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {row.domain}
                  </td>
                  <td
                    className={`px-3 py-3 text-center font-black tracking-[-0.05em] ${getScoreColor(
                      row.mentionScore
                    )}`}
                  >
                    {row.mentionScore}
                  </td>
                  <td
                    className={`px-3 py-3 text-center font-black tracking-[-0.05em] ${getScoreColor(
                      row.readinessScore
                    )}`}
                  >
                    {row.readinessScore}
                  </td>
                  {platforms.map((p) => (
                    <td
                      key={p}
                      className={`px-3 py-3 text-center font-bold ${getScoreColor(
                        row.platforms[p]
                      )}`}
                    >
                      {row.platforms[p]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gap Analysis */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Why Rakip A is ahead */}
        <div className="rounded-[14px] border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Fark Analizi
          </p>
          <h3 className="mt-1 text-sm font-medium tracking-[-0.04em] uppercase">
            {competitorDetail.name} Neden Önde?
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {competitorDetail.name}:{" "}
            <span
              className={`font-bold ${getScoreColor(
                competitorDetail.mentionScore
              )}`}
            >
              {competitorDetail.mentionScore} puan
            </span>{" "}
            vs{" "}
            {userRow?.name ?? "ISITMAX"}:{" "}
            <span
              className={`font-bold ${getScoreColor(
                competitorDetail.userMentionScore
              )}`}
            >
              {competitorDetail.userMentionScore} puan
            </span>
          </p>
          <ul className="mt-4 space-y-2">
            {competitorDetail.readinessGaps.map((gap, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-[3px] shrink-0 text-score-low">·</span>
                <span className="text-foreground">{gap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Top source pages */}
        <div className="rounded-[14px] border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Kaynak Sayfalar
          </p>
          <h3 className="mt-1 text-sm font-medium tracking-[-0.04em] uppercase">
            {competitorDetail.name} En Çok Atıf Alan Sayfalar
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            AI modellerinde en sık kaynak gösterilen sayfalar
          </p>
          <div className="mt-4 space-y-3">
            {competitorDetail.topSourcePages.map((page, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-foreground">{page.path}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-foreground">
                    {page.promptCount}
                  </span>
                  <span className="text-xs text-muted-foreground">prompt</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
