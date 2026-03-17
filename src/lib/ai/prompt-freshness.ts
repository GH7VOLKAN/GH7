/**
 * Prompt Freshness Check — Aylik Sonar-tabanli soru guncellik dogrulamasi
 *
 * Her ay soruların hala guncel olup olmadigini kontrol eder.
 * Guncelligini yitirmis sorulari isaretler, yeni trend sorular onerir.
 */

import { querySonar } from "./sonar-research";

export interface FreshnessResult {
  promptId: string;
  promptText: string;
  isStale: boolean;
  reason: string | null; // neden guncel degil
  suggestedReplacement: string | null; // onerilen yeni soru
}

export interface FreshnessReport {
  checkedCount: number;
  staleCount: number;
  results: FreshnessResult[];
  newTrendPrompts: string[]; // yeni trend sorular
}

/**
 * Bir grup sorunun guncelligini kontrol et
 */
export async function checkPromptFreshness(
  prompts: { id: string; text: string }[],
  sector: string,
  city: string,
): Promise<FreshnessReport> {
  if (prompts.length === 0) {
    return { checkedCount: 0, staleCount: 0, results: [], newTrendPrompts: [] };
  }

  // Batch check — max 20 prompts at a time
  const batch = prompts.slice(0, 20);
  const promptList = batch
    .map((p, i) => `${i + 1}. "${p.text}"`)
    .join("\n");

  try {
    const response = await querySonar(
      `Asagidaki sorular "${sector}" sektorunde "${city}" bolgesinde yapay zekalara sorulmak uzere hazirlandi.
Her sorunun 2024-2025 itibariyle hala guncel ve anlamli olup olmadigini degerlendir.

Sorular:
${promptList}

Her soru icin su formatta JSON dizisi don:
[
  {
    "index": 1,
    "isStale": false,
    "reason": null,
    "suggestedReplacement": null
  },
  {
    "index": 2,
    "isStale": true,
    "reason": "Bu hizmet artik yasaklandi",
    "suggestedReplacement": "Yeni alternatif soru metni"
  }
]

Ek olarak, bu sektor icin guncel 3 yeni trend soru oner ve bunlari ayri bir "newTrends" dizisinde ver:
{
  "results": [...],
  "newTrends": ["Soru 1", "Soru 2", "Soru 3"]
}

Sadece JSON don, baska bir sey yazma. Turkce cevap ver.`,
    );

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        checkedCount: batch.length,
        staleCount: 0,
        results: batch.map((p) => ({
          promptId: p.id,
          promptText: p.text,
          isStale: false,
          reason: null,
          suggestedReplacement: null,
        })),
        newTrendPrompts: [],
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const rawResults = Array.isArray(parsed.results) ? parsed.results : [];
    const newTrends = Array.isArray(parsed.newTrends) ? parsed.newTrends : [];

    const results: FreshnessResult[] = batch.map((p, i) => {
      const match = rawResults.find(
        (r: { index: number }) => r.index === i + 1,
      );
      return {
        promptId: p.id,
        promptText: p.text,
        isStale: match?.isStale ?? false,
        reason: match?.reason ?? null,
        suggestedReplacement: match?.suggestedReplacement ?? null,
      };
    });

    const staleCount = results.filter((r) => r.isStale).length;

    return {
      checkedCount: batch.length,
      staleCount,
      results,
      newTrendPrompts: newTrends.slice(0, 5),
    };
  } catch (err) {
    console.error("[prompt-freshness] check error:", err);
    return {
      checkedCount: batch.length,
      staleCount: 0,
      results: batch.map((p) => ({
        promptId: p.id,
        promptText: p.text,
        isStale: false,
        reason: null,
        suggestedReplacement: null,
      })),
      newTrendPrompts: [],
    };
  }
}
