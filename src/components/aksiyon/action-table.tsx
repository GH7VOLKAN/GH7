"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Priority } from "@/lib/types";
import { completeActionTask } from "@/lib/actions";

export interface ActionTaskItem {
  id: string;
  priority: Priority;
  title: string;
  impact: string;
  source: string;
  detail: string | null;
  completed: boolean;
  raasEligible: boolean;
  // AI action plan fields
  description: string | null;
  difficulty: string | null;
  estimatedTime: string | null;
  canWeDoIt: boolean;
  selfServiceSteps: string[];
}

const priorityLabel: Record<Priority, string> = {
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
};

const difficultyLabel: Record<string, { label: string; color: string }> = {
  EASY: { label: "Kolay", color: "text-green-600 bg-green-50 border-green-200" },
  MEDIUM: { label: "Orta", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  HARD: { label: "Zor", color: "text-red-600 bg-red-50 border-red-200" },
};

interface ActionTableProps {
  brandId: string;
  tasks: ActionTaskItem[];
  raasSelected: Set<string>;
  onRaasToggle: (id: string) => void;
}

export function ActionTable({
  brandId,
  tasks,
  raasSelected,
  onRaasToggle,
}: ActionTableProps) {
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const completedCount = tasks.filter((t) => t.completed).length;

  function handleComplete(taskId: string) {
    startTransition(async () => {
      await completeActionTask(brandId, taskId);
    });
  }

  function toggleExpand(taskId: string) {
    setExpandedId((prev) => (prev === taskId ? null : taskId));
  }

  const hasAiFields = tasks.some((t) => t.difficulty || t.description);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Görevler</CardTitle>
        <CardDescription>
          {tasks.length} görev · {completedCount} tamamlandı
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Öncelik</TableHead>
                <TableHead>Görev</TableHead>
                {hasAiFields && (
                  <TableHead className="hidden sm:table-cell">Zorluk</TableHead>
                )}
                <TableHead className="hidden sm:table-cell">Etki</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">RaaS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const isExpanded = expandedId === task.id;
                const hasDetail = task.description || (task.selfServiceSteps?.length > 0);
                const diff = task.difficulty ? difficultyLabel[task.difficulty] : null;

                return (
                  <>
                    <TableRow
                      key={task.id}
                      className={`${task.completed ? "opacity-50" : ""} ${hasDetail ? "cursor-pointer" : ""}`}
                      onClick={hasDetail ? () => toggleExpand(task.id) : undefined}
                    >
                      <TableCell>
                        <Badge
                          variant={task.priority === "high" ? "default" : "outline"}
                          className={
                            task.priority !== "high" ? "text-muted-foreground" : ""
                          }
                        >
                          {priorityLabel[task.priority]}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`font-medium max-w-[300px] ${
                          task.completed ? "line-through" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {hasDetail && (
                            <svg
                              className={`size-3.5 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                          )}
                          <div>
                            <span>{task.title}</span>
                            {task.estimatedTime && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({task.estimatedTime})
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      {hasAiFields && (
                        <TableCell className="hidden sm:table-cell">
                          {diff ? (
                            <Badge variant="outline" className={diff.color}>
                              {diff.label}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {task.impact}
                      </TableCell>
                      <TableCell>
                        {task.completed ? (
                          <Badge variant="secondary">Tamamlandı</Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplete(task.id);
                            }}
                          >
                            {isPending ? "..." : "Tamamla"}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {task.raasEligible && !task.completed ? (
                          <Checkbox
                            checked={raasSelected.has(task.id)}
                            onCheckedChange={() => onRaasToggle(task.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                    {isExpanded && hasDetail && (
                      <TableRow key={`${task.id}-detail`}>
                        <TableCell colSpan={hasAiFields ? 6 : 5} className="bg-muted/30 px-6 py-4">
                          <div className="space-y-3">
                            {task.description && (
                              <p className="text-sm text-foreground">{task.description}</p>
                            )}
                            {task.selfServiceSteps?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                                  {task.canWeDoIt ? "Kendi başınıza yapabilirsiniz:" : "Adımlar:"}
                                </p>
                                <ol className="list-decimal list-inside space-y-1">
                                  {task.selfServiceSteps.map((step, i) => (
                                    <li key={i} className="text-sm text-muted-foreground">{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
