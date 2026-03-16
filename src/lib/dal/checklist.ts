import { prisma } from "@/lib/db";
import { cache } from "react";
import { LAYER_NAMES, type TechnicalDetail } from "@/lib/checklist-defaults";

// ─── Types ──────────────────────────────────────────────

export interface ChecklistItemSummary {
  id: string;
  layer: number;
  itemNumber: string;
  simpleTitle: string;
  status: string; // complete, warning, missing, locked
}

export interface ChecklistSummary {
  total: number;
  completed: number;
  layers: {
    layer: number;
    name: string;
    items: ChecklistItemSummary[];
    completed: number;
    total: number;
  }[];
}

export interface ChecklistItemFull {
  id: string;
  layer: number;
  itemNumber: string;
  simpleTitle: string;
  simpleDescription: string;
  competitorNote: string | null;
  status: string;
  userMarkedDone: boolean;
  verifiedByAI: boolean;
  difficulty: string;
  impact: string;
  feasibilityScore: number; // 1-5: 1=çok zor, 5=çok kolay
  estimatedTime: string | null;
  technicalDetail: TechnicalDetail | null;
  selfServiceSteps: string[];
  canAgencyDo: boolean;
  agencyPrice: string | null;
  reminderDate: string | null;
  completedAt: string | null;
  verificationNote: string | null;
}

export interface ChecklistData {
  total: number;
  completed: number;
  layers: {
    layer: number;
    name: string;
    items: ChecklistItemFull[];
    completed: number;
    total: number;
  }[];
}

// ─── Sidebar için hafif veri ─────────────────────────────

export const getChecklistSummary = cache(
  async (brandId: string): Promise<ChecklistSummary> => {
    const items = await prisma.checklistItem.findMany({
      where: { brandId },
      select: {
        id: true,
        layer: true,
        itemNumber: true,
        simpleTitle: true,
        status: true,
      },
      orderBy: [{ layer: "asc" }, { itemNumber: "asc" }],
    });

    const layerMap = new Map<
      number,
      { items: ChecklistItemSummary[]; completed: number }
    >();

    for (const item of items) {
      if (!layerMap.has(item.layer)) {
        layerMap.set(item.layer, { items: [], completed: 0 });
      }
      const entry = layerMap.get(item.layer)!;
      entry.items.push(item);
      if (item.status === "complete") entry.completed++;
    }

    const layers = [1, 2, 3].map((layer) => {
      const entry = layerMap.get(layer) ?? { items: [], completed: 0 };
      return {
        layer,
        name: LAYER_NAMES[layer] ?? `Katman ${layer}`,
        items: entry.items,
        completed: entry.completed,
        total: entry.items.length,
      };
    });

    const total = items.length;
    const completed = items.filter((i) => i.status === "complete").length;

    return { total, completed, layers };
  },
);

// ─── Sayfa için full veri ────────────────────────────────

export const getChecklistData = cache(
  async (brandId: string): Promise<ChecklistData> => {
    const items = await prisma.checklistItem.findMany({
      where: { brandId },
      orderBy: [{ layer: "asc" }, { itemNumber: "asc" }],
    });

    const layerMap = new Map<
      number,
      { items: ChecklistItemFull[]; completed: number }
    >();

    for (const item of items) {
      if (!layerMap.has(item.layer)) {
        layerMap.set(item.layer, { items: [], completed: 0 });
      }
      const entry = layerMap.get(item.layer)!;
      entry.items.push({
        id: item.id,
        layer: item.layer,
        itemNumber: item.itemNumber,
        simpleTitle: item.simpleTitle,
        simpleDescription: item.simpleDescription,
        competitorNote: item.competitorNote,
        status: item.status,
        userMarkedDone: item.userMarkedDone,
        verifiedByAI: item.verifiedByAI,
        difficulty: item.difficulty,
        impact: item.impact,
        feasibilityScore: (item as Record<string, unknown>).feasibilityScore as number ?? 3,
        estimatedTime: item.estimatedTime,
        technicalDetail: item.technicalDetail as TechnicalDetail | null,
        selfServiceSteps: (item.selfServiceSteps as string[]) ?? [],
        canAgencyDo: item.canAgencyDo,
        agencyPrice: item.agencyPrice,
        reminderDate: item.reminderDate?.toISOString() ?? null,
        completedAt: item.completedAt?.toISOString() ?? null,
        verificationNote: item.verificationNote ?? null,
      });
      if (item.status === "complete") entry.completed++;
    }

    const layers = [1, 2, 3].map((layer) => {
      const entry = layerMap.get(layer) ?? { items: [], completed: 0 };
      return {
        layer,
        name: LAYER_NAMES[layer] ?? `Katman ${layer}`,
        items: entry.items,
        completed: entry.completed,
        total: entry.items.length,
      };
    });

    const total = items.length;
    const completed = items.filter((i) => i.status === "complete").length;

    return { total, completed, layers };
  },
);
