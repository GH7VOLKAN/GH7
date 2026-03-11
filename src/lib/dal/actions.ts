import { prisma } from "@/lib/db";
import { cache } from "react";
import type { Priority } from "@/lib/types";

export interface ActionTaskData {
  id: string;
  priority: Priority;
  title: string;
  impact: string;
  source: string;
  detail: string | null;
  completed: boolean;
  raasEligible: boolean;
}

export const getActionsData = cache(async (brandId: string) => {
  const tasks = await prisma.actionTask.findMany({
    where: { brandId },
    orderBy: [{ completed: "asc" }, { priority: "asc" }, { createdAt: "asc" }],
  });

  const actionTasks: ActionTaskData[] = tasks.map((t) => ({
    id: t.id,
    priority: t.priority as Priority,
    title: t.title,
    impact: t.impact,
    source: t.source,
    detail: t.detail,
    completed: t.completed,
    raasEligible: t.raasEligible,
  }));

  const completedCount = actionTasks.filter((t) => t.completed).length;
  const totalCount = actionTasks.length;
  const raasEligibleCount = actionTasks.filter((t) => t.raasEligible).length;

  return { actionTasks, completedCount, totalCount, raasEligibleCount };
});

export async function toggleActionComplete(taskId: string, completed: boolean) {
  return prisma.actionTask.update({
    where: { id: taskId },
    data: { completed },
  });
}
