"use client";

import { useState } from "react";
import type { ChecklistData, ChecklistItemFull } from "@/lib/dal/checklist";
import type { ActionTaskData } from "@/lib/dal/actions";
import type { AuditCategoryData } from "@/lib/dal/site-audit";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// --- Props ---
interface Props {
  checklistData: ChecklistData;
  actionsData: {
    actionTasks: ActionTaskData[];
    completedCount: number;
    totalCount: number;
    raasEligibleCount: number;
  };
  auditData: {
    auditCategories: AuditCategoryData[];
    totalScore: number;
    targetScore: number;
    passCount: number;
    failCount: number;
    partialCount: number;
    totalChecks: number;
    raasEligibleCount: number;
  };
  readinessScore: number;
}

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

// --- Status badge ---
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    complete: { bg: "bg-green-50", text: "text-green-700", label: "Tamamlandi" },
    warning: { bg: "bg-amber-50", text: "text-amber-700", label: "Dikkat" },
    missing: { bg: "bg-red-50", text: "text-red-700", label: "Eksik" },
    locked: { bg: "bg-gray-50", text: "text-gray-500", label: "Kilitli" },
  };
  const c = config[status] ?? config.missing;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// --- Difficulty badge ---
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    EASY: "bg-green-50 text-green-700",
    MEDIUM: "bg-amber-50 text-amber-700",
    HARD: "bg-red-50 text-red-700",
  };
  const labels: Record<string, string> = {
    EASY: "Kolay",
    MEDIUM: "Orta",
    HARD: "Zor",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[difficulty] ?? "bg-gray-50 text-gray-600"}`}>
      {labels[difficulty] ?? difficulty}
    </span>
  );
}

// --- Impact badge ---
function ImpactBadge({ impact }: { impact: string }) {
  const colors: Record<string, string> = {
    HIGH: "bg-red-50 text-red-700",
    MEDIUM: "bg-amber-50 text-amber-700",
    LOW: "bg-gray-50 text-gray-600",
  };
  const labels: Record<string, string> = {
    HIGH: "Yuksek Etki",
    MEDIUM: "Orta Etki",
    LOW: "Dusuk Etki",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[impact] ?? "bg-gray-50 text-gray-600"}`}>
      {labels[impact] ?? impact}
    </span>
  );
}

// --- Feasibility bar ---
function FeasibilityBar({ score }: { score: number }) {
  const pct = (score / 5) * 100;
  const color = score >= 4 ? "bg-green-500" : score >= 2 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 shrink-0 text-gray-500">Zorluk</span>
      <div className="h-1.5 flex-1 rounded-full bg-gray-100">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-gray-600">{score}/5</span>
    </div>
  );
}

// --- Checklist item row ---
function ChecklistItemRow({ item, index }: { item: ChecklistItemFull; index: number }) {
  return (
    <AccordionItem value={`item-${index}`} className="border-b border-gray-100 last:border-b-0">
      <AccordionTrigger className="w-full hover:no-underline py-3 px-2">
        <div className="flex w-full flex-wrap items-center gap-3 text-sm">
          <span className="text-xs text-gray-400 font-mono w-8">{item.itemNumber}</span>
          <span className="mr-auto font-medium text-gray-900 min-w-[200px]">
            {item.simpleTitle}
          </span>
          <div className="flex items-center gap-2">
            <StatusBadge status={item.status} />
            <DifficultyBadge difficulty={item.difficulty} />
            <ImpactBadge impact={item.impact} />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 px-2 pb-4 pt-2">
          {/* Description */}
          <p className="text-sm text-gray-600">{item.simpleDescription}</p>

          {/* Competitor note */}
          {item.competitorNote && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
              <p className="text-xs font-medium text-amber-800 mb-1">Rakip Notu</p>
              <p className="text-sm text-amber-700">{item.competitorNote}</p>
            </div>
          )}

          {/* Feasibility + Time */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FeasibilityBar score={item.feasibilityScore} />
            {item.estimatedTime && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Tahmini sure:</span>
                <span className="font-medium text-gray-700">{item.estimatedTime}</span>
              </div>
            )}
          </div>

          {/* Self-service steps */}
          {item.selfServiceSteps.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Kendiniz Yapabilirsiniz:</p>
              <ol className="space-y-1 pl-4 list-decimal">
                {item.selfServiceSteps.map((step, i) => (
                  <li key={i} className="text-sm text-gray-600">{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Technical detail */}
          {item.technicalDetail && (
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-2">
              <p className="text-xs font-medium text-gray-700">Teknik Detay</p>
              <ul className="space-y-1 pl-4 list-disc">
                {item.technicalDetail.scope.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600">{s}</li>
                ))}
              </ul>
              {item.technicalDetail.researchNote && (
                <p className="text-xs text-gray-500 italic">{item.technicalDetail.researchNote}</p>
              )}
            </div>
          )}

          {/* Agency option */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {item.canAgencyDo && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Ajans yapabilir</span>
                {item.agencyPrice && (
                  <span className="font-medium text-gray-700">{item.agencyPrice}</span>
                )}
              </div>
            )}
            {item.canAgencyDo && (
              <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                Ajansiniza Gonderin
              </button>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// --- Action task row ---
function ActionTaskRow({ task }: { task: ActionTaskData }) {
  const priorityColors: Record<string, string> = {
    high: "bg-red-50 text-red-700",
    medium: "bg-amber-50 text-amber-700",
    low: "bg-gray-50 text-gray-600",
  };
  const priorityLabels: Record<string, string> = {
    high: "Yuksek",
    medium: "Orta",
    low: "Dusuk",
  };

  return (
    <div className={`rounded-lg border p-4 ${task.completed ? "border-green-200 bg-green-50/30" : "border-gray-200"}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${task.completed ? "border-green-500 bg-green-500" : "border-gray-300"}`}>
          {task.completed && (
            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-medium ${task.completed ? "text-gray-500 line-through" : "text-gray-900"}`}>
              {task.title}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority] ?? "bg-gray-50 text-gray-600"}`}>
              {priorityLabels[task.priority] ?? task.priority}
            </span>
            {task.raasEligible && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                RaaS
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{task.impact}</p>
          {task.description && (
            <p className="text-xs text-gray-600 mt-1">{task.description}</p>
          )}
          {task.selfServiceSteps.length > 0 && (
            <div className="mt-2">
              <ol className="space-y-0.5 pl-4 list-decimal">
                {task.selfServiceSteps.map((step, i) => (
                  <li key={i} className="text-xs text-gray-500">{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Audit check status icon ---
function AuditStatusIcon({ status }: { status: string }) {
  if (status === "pass")
    return <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs">&#10003;</span>;
  if (status === "fail")
    return <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs">&#10005;</span>;
  return <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs">!</span>;
}

// =====================
// Main Content Component
// =====================
export function IyilestirmeContent({
  checklistData,
  actionsData,
  auditData,
  readinessScore,
}: Props) {
  const [activeTab, setActiveTab] = useState<"checklist" | "actions" | "audit">("checklist");

  const incompleteItems = checklistData.layers.flatMap((l) =>
    l.items.filter((i) => i.status !== "complete")
  );
  const completedItems = checklistData.layers.flatMap((l) =>
    l.items.filter((i) => i.status === "complete")
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      {/* Site Health Score */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-sm transition-shadow">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          <CircularGauge score={readinessScore} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Site Saglik Skoru
            </h2>
            <p className="text-sm text-gray-500">
              AI SEO &amp; hazirlik analizi
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>Kontrol: {checklistData.total} madde</span>
              <span>Tamamlanan: {checklistData.completed}</span>
              <span>Denetim: {auditData.passCount}/{auditData.totalChecks} basarili</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: "checklist" as const, label: `Gelisim Plani (${checklistData.total})` },
          { key: "actions" as const, label: `Aksiyonlar (${actionsData.totalCount})` },
          { key: "audit" as const, label: `Site Denetimi (${auditData.totalChecks})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Checklist Tab */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          {/* Layers */}
          {checklistData.layers.map((layer) => (
            <div key={layer.layer} className="rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                <div className={`h-3 w-3 rounded-full ${layer.completed === layer.total ? "bg-green-500" : "bg-amber-400"}`} />
                <h3 className="text-base font-semibold text-gray-900">
                  {layer.name}
                </h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {layer.completed}/{layer.total}
                </span>
              </div>
              <div className="px-4 py-2">
                <Accordion>
                  {layer.items.map((item, idx) => (
                    <ChecklistItemRow key={item.id} item={item} index={idx} />
                  ))}
                </Accordion>
              </div>
            </div>
          ))}

          {/* Summary */}
          {incompleteItems.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4">
              <p className="text-sm text-amber-800">
                <strong>{incompleteItems.length}</strong> madde tamamlanmadi.{" "}
                {incompleteItems.filter((i) => i.feasibilityScore >= 4).length} tanesi kolay yapilabilir.
              </p>
            </div>
          )}
          {completedItems.length > 0 && completedItems.length === checklistData.total && (
            <div className="rounded-xl border border-green-200 bg-green-50/30 p-4">
              <p className="text-sm text-green-800">
                Tum maddeler tamamlandi! Harika is!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions Tab */}
      {activeTab === "actions" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Toplam: {actionsData.totalCount}</span>
            <span>Tamamlanan: {actionsData.completedCount}</span>
            {actionsData.raasEligibleCount > 0 && (
              <span className="text-blue-600">RaaS uygun: {actionsData.raasEligibleCount}</span>
            )}
          </div>

          {actionsData.actionTasks.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Henuz aksiyon onerisi yok.</p>
          ) : (
            <div className="space-y-3">
              {actionsData.actionTasks.map((task) => (
                <ActionTaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Audit summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">Toplam Skor</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{auditData.totalScore}</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">Basarili</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">{auditData.passCount}</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">Basarisiz</p>
              <p className="text-2xl font-semibold text-red-600 mt-1">{auditData.failCount}</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">Kismi</p>
              <p className="text-2xl font-semibold text-amber-600 mt-1">{auditData.partialCount}</p>
            </div>
          </div>

          {/* Audit categories */}
          {auditData.auditCategories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-base font-semibold text-gray-900">{cat.name}</h3>
                <span className="text-sm text-gray-500">{cat.score}/{cat.maxScore}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {cat.checks.map((check) => (
                  <div key={check.id} className="flex items-start gap-3 px-6 py-3">
                    <AuditStatusIcon status={check.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{check.label}</span>
                        <span className="text-xs text-gray-400">{check.score}/{check.maxScore}</span>
                        {check.raasEligible && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">RaaS</span>
                        )}
                      </div>
                      {check.detail && <p className="text-xs text-gray-500 mt-0.5">{check.detail}</p>}
                      {check.recommendation && (
                        <p className="text-xs text-amber-600 mt-0.5">{check.recommendation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
