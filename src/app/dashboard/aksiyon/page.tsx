"use client";

import { useState } from "react";
import { actionTasks, raasOffer } from "@/lib/mock-data/actions";
import type { ActionTask } from "@/lib/mock-data/actions";
import { ExpandCard } from "@/components/ui/expand-card";

// ── Helpers ───────────────────────────────────────────────────────────────────

const priorityLabel: Record<ActionTask["priority"], string> = {
  high: "YÜKSEK",
  medium: "ORTA",
  low: "DÜŞÜK",
};

const priorityStyle: Record<ActionTask["priority"], string> = {
  high: "text-foreground",
  medium: "text-muted-foreground",
  low: "text-muted-foreground",
};

// ── Task Summary (ExpandCard front) ───────────────────────────────────────────

function TaskSummary({ task }: { task: ActionTask }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${priorityStyle[task.priority]}`}
        >
          {priorityLabel[task.priority]}
        </span>
        {task.completed && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            · tamamlandı
          </span>
        )}
      </div>
      <p
        className={`font-medium text-sm leading-snug ${
          task.completed ? "line-through opacity-50" : ""
        }`}
      >
        {task.title}
      </p>
      <p className="text-xs text-muted-foreground">{task.impact}</p>
      <p className="text-xs text-muted-foreground opacity-60">{task.source}</p>
    </div>
  );
}

// ── Task Detail (ExpandCard expand) ───────────────────────────────────────────

function TaskDetail({
  task,
  raasActive,
  onRaasToggle,
}: {
  task: ActionTask;
  raasActive: boolean;
  onRaasToggle: (id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        {task.detail}
      </p>

      {task.raasEligible && !task.completed && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => !raasActive && onRaasToggle(task.id)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold tracking-[-0.02em] transition-all ${
              raasActive
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            Biz Uygulayalım
          </button>
          <button
            onClick={() => raasActive && onRaasToggle(task.id)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold tracking-[-0.02em] transition-all ${
              !raasActive
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            Kendiniz Uygulayın
          </button>
        </div>
      )}

      {!task.completed && (
        <button className="self-start rounded-lg border border-border px-4 py-1.5 text-xs font-bold text-muted-foreground tracking-[-0.02em] transition-all hover:border-foreground hover:text-foreground">
          Tamamlandı İşaretle
        </button>
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
    <div className="reveal rounded-xl border border-dashed border-border bg-background-secondary p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
        RaaS Teklifi
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
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
            <span className="text-xl font-black tracking-[-0.04em] leading-none text-foreground">
              {currentScore}
            </span>
            <span className="mb-0.5 text-sm font-bold text-muted-foreground leading-none">
              →
            </span>
            <span className="text-xl font-black tracking-[-0.04em] leading-none text-foreground">
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

      <div className="mt-5 h-px w-full bg-border" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
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

  const liveOffer = {
    ...raasOffer,
    selectedCount: raasSelectedCount,
  };

  return (
    <div className="space-y-10">
      {/* ── Header Card ───────────────────────────────────────────────────── */}
      <div className="reveal rounded-xl border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
          AKSİYON PLANI
        </p>
        <h1 className="text-2xl font-light tracking-[-0.04em]">
          {totalCount} görev · {completedCount} tamamlandı
        </h1>
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

      {/* ── Task Cards ────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
          Görevler
        </p>
        <div className="flex flex-col gap-[10px]">
          {actionTasks.map((task) => (
            <div key={task.id} className="reveal">
              <ExpandCard
                summary={<TaskSummary task={task} />}
                detail={
                  <TaskDetail
                    task={task}
                    raasActive={raasSelected.has(task.id)}
                    onRaasToggle={handleRaasToggle}
                  />
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── RaaS Offer Card ───────────────────────────────────────────────── */}
      {raasSelectedCount > 0 ? (
        <RaasOfferCard {...liveOffer} />
      ) : (
        <div className="reveal rounded-xl border border-dashed border-border p-5 text-center">
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
