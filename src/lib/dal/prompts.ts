import { prisma } from "@/lib/db";
import { cache } from "react";
import type { PlatformKey, Sentiment } from "@/lib/types";

export interface PromptItemData {
  id: string;
  text: string;
  tags: string[];
  visibility: number;
  position: string;
  sentiment: Sentiment;
  topCompetitor: string;
  modelResults: Record<PlatformKey, boolean>;
}

export const getPromptsData = cache(async (brandId: string) => {
  const prompts = await prisma.prompt.findMany({
    where: { brandId, isActive: true },
    include: {
      results: {
        orderBy: { createdAt: "desc" },
        take: 4, // one per platform from latest scan
      },
    },
  });

  const promptItems: PromptItemData[] = prompts.map((p) => {
    const modelResults: Record<PlatformKey, boolean> = {
      chatgpt: false,
      claude: false,
      gemini: false,
      perplexity: false,
    };
    let bestPosition = "—";
    let sentiment: Sentiment = "nötr";
    let mentionCount = 0;

    for (const r of p.results) {
      const plat = r.platform as PlatformKey;
      if (r.mentioned) {
        modelResults[plat] = true;
        mentionCount++;
        if (r.position) bestPosition = r.position;
        if (r.sentiment) sentiment = r.sentiment as Sentiment;
      }
    }

    return {
      id: p.id,
      text: p.text,
      tags: p.tags,
      visibility: Math.round((mentionCount / 4) * 100),
      position: bestPosition,
      sentiment,
      topCompetitor: "—",
      modelResults,
    };
  });

  const suggested = await prisma.suggestedPrompt.findMany({
    where: { brandId },
    orderBy: { volume: "desc" },
  });

  const activeCount = prompts.length;
  const suggestedCount = suggested.length;

  return { promptItems, suggested, activeCount, suggestedCount };
});
