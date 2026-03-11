"use client";

import { useState } from "react";
import { actionTasks, raasOffer } from "@/lib/mock-data/actions";
import type { ActionTask } from "@/lib/mock-data/actions";
import { getScoreColor } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

const priorityLabel: Record<ActionTask["priority"], string> = {
  high: "YÜKSEK",
  medium: "ORTA",
  low: "DÜŞÜK",
};

const priorityColor: Record<ActionTask["priority"], string> = {
  high: "text-score-low",
  medium: "text-score-mid",
  low: "text-muted-foreground",
};

// ── Task Card ─────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  raasActive,
  onRaasToggle,
}: {
  task: ActionTask;
  raasActive: boolean;
  onRaasToggle: (id: number) => void;
}) {
  return (
    <div
      className={`rounded-[14px] border border-border bg-card p-5 transition-opacity ${
        task.completed ? "opacity-50" : "opacity-100"
      }`}
    >
      {/* Top row: priority badge + title */}
      <div className="flex flex-wrap items-start gap-3">
        {/* Priority badge */}
        <span
          className={`shrink-0 text-[10px] font-black uppercase tracking-[0.14em] ${
            priorityColor[task.priority]
          }`}
        >
          {priorityLabel[task.priority]}
        </span>

        {/* Title */}
        <span
          className={`flex-1 text-sm font-bold tracking-[-0.02em] leading-snug ${
            task.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* Impact */}
      <p className="mt-2 text-sm text-foreground font-medium">{task.impact}</p>

      {/* Source */}
      <p className="mt-1 text-xs text-muted-foreground">{task.source}</p>

      {/* Detail */}
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
        {task.detail}
      </p>

      {/* RaaS toggle */}
      {task.raasEligible && !task.completed && (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => onRaasToggle(task.id)}
            className={`rounded-lg border px-4 py-1.5 text-xs font-bold tracking-[-0.02em] transition-all ${
              raasActive
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            Biz Uygulayalım
          </button>
          <button
            onClick={() => raasActive && onRaasToggle(task.id)}
            className={`rounded-lg border px-4 py-1.5 text-xs font-bold tracking-[-0.02em] transition-all ${
              !raasActive
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            Kendiniz Uygulayın
          </button>
        </div>
      )}
    </div>
  );
}

// ── RaaS Offer Card ───────────────────────────────────────────────────────────

function RaasOfferCard({
  selectedCount,
  currentScore,
  targetScore,
  price,
  deposit,
  timeline,
}: typeof raasOffer) {
  return (
    <div className="rounded-[14px] border border-dashed border-border bg-background-secondary p-5">
      {/* Section label */}
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
        RaaS Teklifi
      </p>

      {/* Summary row */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {/* Selected tasks */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Görev
          </p>
          <p className="mt-1 text-xl font-black tracking-[-0.04em] text-foreground">
            {selectedCount}
          </p>
          <p className="text-xs text-muted-foreground">görev seçildi</p>
        </div>

        {/* Score trajectory */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Skor
          </p>
          <div className="mt-1 flex items-end gap-1">
            <span
              className={`text-xl font-black tracking-[-0.04em] leading-none ${getScoreColor(
                currentScore
              )}`}
            >
              {currentScore}
            </span>
            <span className="mb-0.5 text-sm font-bold text-muted-foreground leading-none">
              →
            </span>
            <span
              className={`text-xl font-black tracking-[-0.04em] leading-none ${getScoreColor(
                targetScore
              )}`}
            >
              {targetScore}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">hedef skor</p>
        </div>

        {/* Price */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Fiyat
          </p>
          <p className="mt-1 text-xl font-black tracking-[-0.04em] text-foreground">
            {price}
          </p>
          <p className="text-xs text-muted-foreground leading-tight">{deposit}</p>
        </div>

        {/* Timeline */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Süre
          </p>
          <p className="mt-1 text-xl font-black tracking-[-0.04em] text-foreground">
            {timeline}
          </p>
          <p className="text-xs text-muted-foreground">tahmini süre</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-5 h-px w-full bg-border" />

      {/* CTA */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          GH7 ekibi seçili görevleri sizin adınıza uygular. Ödemenin %70'i
          hedefe ulaşıldığında tahsil edilir.
        </p>
        <button className="shrink-0 rounded-lg bg-foreground px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97]">
          Teklif Al
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AksiyonPage() {
  // Track which raas-eligible tasks are toggled to "Biz Uygulayalım"
  const [raasSelected, setRaasSelected] = useState<Set<number>>(
    () =>
      new Set(
        actionTasks
          .filter((t) => t.raasSelected && t.raasEligible)
          .map((t) => t.id)
      )
  );

  function handleRaasToggle(id: number) {
    setRaasSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const completedCount = actionTasks.filter((t) => t.completed).length;
  const totalCount = actionTasks.length;
  const pct = Math.round((completedCount / totalCount) * 100);

  const raasSelectedCount = raasSelected.size;

  // Build a live offer reflecting current selections
  const liveOffer = {
    ...raasOffer,
    selectedCount: raasSelectedCount,
  };

  return (
    <div className="space-y-6">
      {/* ── Header card ───────────────────────────────────────────────── */}
      <div className="rounded-[14px] border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          AKSİYON PLANI
        </p>
        <h1 className="mt-1 text-2xl font-light tracking-[-0.04em]">
          {totalCount} görev · {completedCount} tamamlandı
        </h1>
        {/* Progress bar */}
        <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          %{pct} tamamlandı
        </p>
      </div>

      {/* ── Task list ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {actionTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            raasActive={raasSelected.has(task.id)}
            onRaasToggle={handleRaasToggle}
          />
        ))}
      </div>

      {/* ── RaaS offer card (only shown when at least 1 task selected) ─ */}
      {raasSelectedCount > 0 && (
        <RaasOfferCard {...liveOffer} />
      )}

      {/* Fallback nudge when nothing selected yet */}
      {raasSelectedCount === 0 && (
        <div className="rounded-[14px] border border-dashed border-border p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Uygulanmasını istediğiniz görevler için{" "}
            <span className="font-bold text-foreground">Biz Uygulayalım</span>{" "}
            seçeneğini etkinleştirin, teklif otomatik oluşsun.
          </p>
        </div>
      )}
    </div>
  );
}
