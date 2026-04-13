"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight, MessageCircle, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import {
  generateWhatsAppShareLink,
  generateActionShareMessage,
} from "@/lib/whatsapp";
import type { ActionTaskData, SituationAnalysis } from "@/lib/dal/actions";
import { useRouter } from "next/navigation";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  high: { label: "Yüksek Öncelik", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
  medium: { label: "Orta Öncelik", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  low: { label: "Düşük Öncelik", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  EASY: { label: "Kolay", color: "text-green-700", bg: "bg-green-50" },
  MEDIUM: { label: "Orta", color: "text-amber-700", bg: "bg-amber-50" },
  HARD: { label: "Zor", color: "text-red-700", bg: "bg-red-50" },
};

interface Props {
  actionTasks: ActionTaskData[];
  situationAnalysis: SituationAnalysis;
  brandId: string;
}

export default function AksiyonlarContent({ actionTasks, situationAnalysis, brandId }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState(actionTasks);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const incompleteTasks = optimisticTasks.filter((t) => !t.completed);
  const completedTasks = optimisticTasks.filter((t) => t.completed);

  // Group incomplete by priority
  const highTasks = incompleteTasks.filter((t) => t.priority === "high");
  const mediumTasks = incompleteTasks.filter((t) => t.priority === "medium");
  const lowTasks = incompleteTasks.filter((t) => t.priority === "low");

  const toggleComplete = async (taskId: string, currentCompleted: boolean) => {
    // Optimistic update
    setOptimisticTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !currentCompleted } : t))
    );

    try {
      const res = await fetch("/api/panel/actions/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed: !currentCompleted }),
      });
      if (!res.ok) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      // Revert on error
      setOptimisticTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: currentCompleted } : t))
      );
    }
  };

  const handleWhatsAppShare = (task: ActionTaskData) => {
    const message = generateActionShareMessage({
      keyword: task.title,
      issue: task.impact,
      recommendation: task.description ?? task.title,
    });
    const url = generateWhatsAppShareLink({ text: message });
    window.open(url, "_blank", "noopener");
  };

  const renderTaskCard = (task: ActionTaskData) => {
    const isExpanded = expandedId === task.id;
    const diffConfig = task.difficulty ? DIFFICULTY_CONFIG[task.difficulty] : null;

    return (
      <div
        key={task.id}
        className={`border border-gray-200 rounded-xl transition-colors ${
          task.completed ? "bg-gray-50 opacity-60" : "bg-white"
        }`}
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            <button
              onClick={() => toggleComplete(task.id, task.completed)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                task.completed
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {task.completed && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-sm font-semibold ${task.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                  {task.title}
                </h3>
                {diffConfig && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diffConfig.color} ${diffConfig.bg}`}>
                    {diffConfig.label}
                  </span>
                )}
                {task.estimatedTime && (
                  <span className="text-xs text-gray-400">⏱ {task.estimatedTime}</span>
                )}
              </div>

              {!task.completed && (
                <>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium text-gray-700">Neden: </span>
                    {task.impact}
                  </p>

                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}

                  {/* Self-service steps accordion */}
                  {task.selfServiceSteps.length > 0 && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : task.id)}
                      className="flex items-center gap-1 mt-3 text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      Nasıl yapılır? ({task.selfServiceSteps.length} adım)
                    </button>
                  )}

                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <button
                      onClick={() => toggleComplete(task.id, task.completed)}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Tamamladım ✓
                    </button>
                    <button
                      onClick={() => handleWhatsAppShare(task)}
                      className="px-4 py-2 border border-green-600 text-sm font-medium text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Expandable steps */}
        {isExpanded && task.selfServiceSteps.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
            <ol className="space-y-2">
              {task.selfServiceSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="text-xs font-bold text-gray-400 mt-0.5 w-5 text-right flex-shrink-0">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  const renderGroup = (tasks: ActionTaskData[], priority: string) => {
    if (tasks.length === 0) return null;
    const config = PRIORITY_CONFIG[priority];
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <h2 className={`text-sm font-bold ${config.color}`}>{config.label}</h2>
          <span className="text-xs text-gray-400">({tasks.length})</span>
        </div>
        <div className="space-y-3">{tasks.map(renderTaskCard)}</div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Situation Analysis Card */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white mb-8">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Durum Analizi</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400">GEO Skoru</p>
            <p className="text-lg font-bold text-gray-900">{situationAnalysis.mentionScore}/100</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">En Güçlü Platform</p>
            <p className="text-sm font-semibold text-gray-900">{situationAnalysis.topPlatform ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">En Zayıf Platform</p>
            <p className="text-sm font-semibold text-gray-900">{situationAnalysis.weakPlatform ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Rakip Sayısı</p>
            <p className="text-sm font-semibold text-gray-900">{situationAnalysis.competitorCount}</p>
            {situationAnalysis.topCompetitor && (
              <p className="text-xs text-gray-400">En güçlü: {situationAnalysis.topCompetitor}</p>
            )}
          </div>
        </div>
      </div>

      {/* Impact Cards — Before/After tracking */}
      {completedTasks.some((t) => t.impactSnapshot) && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Aksiyon Etki Takibi
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {completedTasks
              .filter((t) => t.impactSnapshot)
              .slice(0, 6)
              .map((task) => {
                const hasResult = !!task.impactResult;
                const delta = task.impactResult?.delta ?? 0;
                const before = task.impactSnapshot?.mentionScore ?? 0;
                const after = task.impactResult?.mentionScoreAfter ?? 0;

                return (
                  <div
                    key={task.id}
                    className={`border rounded-xl p-4 ${
                      hasResult
                        ? delta > 0
                          ? "border-green-200 bg-green-50/50"
                          : delta < 0
                          ? "border-orange-200 bg-orange-50/50"
                          : "border-gray-200 bg-gray-50/50"
                        : "border-gray-200 bg-gray-50/50"
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-500 truncate mb-2">
                      {task.title}
                    </p>
                    {hasResult ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Skor: {before}</span>
                        <span className="text-gray-300">&rarr;</span>
                        <span className="text-sm font-semibold text-gray-900">{after}</span>
                        <span
                          className={`text-sm font-bold ${
                            delta > 0
                              ? "text-green-600"
                              : delta < 0
                              ? "text-orange-600"
                              : "text-gray-400"
                          }`}
                        >
                          {delta > 0 ? (
                            <span className="flex items-center gap-0.5">
                              <TrendingUp className="w-3.5 h-3.5" /> +{delta}
                            </span>
                          ) : delta < 0 ? (
                            <span className="flex items-center gap-0.5">
                              <TrendingDown className="w-3.5 h-3.5" /> {delta}
                            </span>
                          ) : (
                            "0"
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        Sonraki taramada etki ölçülecek
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Incomplete Actions by Priority */}
      {incompleteTasks.length > 0 ? (
        <>
          {renderGroup(highTasks, "high")}
          {renderGroup(mediumTasks, "medium")}
          {renderGroup(lowTasks, "low")}
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg font-semibold">Tüm aksiyonlar tamamlandı! 🎉</p>
          <p className="text-sm mt-1">Bir sonraki taramadan sonra yeni aksiyonlar oluşturulacak.</p>
        </div>
      )}

      {/* Completed Actions */}
      {completedTasks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-gray-500 mb-3">
            Tamamlanan ({completedTasks.length})
          </h2>
          <div className="space-y-2">{completedTasks.map(renderTaskCard)}</div>
        </div>
      )}

      <div className="mt-12">
        <PageBottomCTA />
      </div>
    </div>
  );
}
