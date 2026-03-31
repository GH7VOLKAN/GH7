/**
 * Batch Analyzer — Madde 15b
 *
 * Cron job'lari Anthropic Batch API ile calistirir.
 * Prompt cache + Batch API birlesimiyle %80 maliyet tasarrufu.
 *
 * Cron schedule:
 * - 06:00 → AI platformlarina sorgu gonder (mevcut)
 * - 06:30 → Gelen yanitlari batch olarak Claude'a analiz ettir (bu dosya)
 * - 09:00 → Batch sonuclarini kontrol et, DB'ye yaz (checkBatchResults)
 */

import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult } from "./types";

const ANALYZER_SYSTEM_PROMPT = `Sen bir marka bahsedilme analizcisisin. Bir AI platformunun verdigi yaniti analiz edip markanin nasil bahsedildigini belirle.

JSON formatinda yanit ver (baska bir sey yazma):
{
  "mentioned": boolean,
  "mentionType": "direct" | "indirect" | "none",
  "position": "1. sira" | "2. sira" | "3. sira" | "bahsediliyor" | null,
  "sentiment": "pozitif" | "notr" | "negatif",
  "excerpt": "en fazla 200 karakter, markanin bahsedildigi kisim",
  "citations": ["url1", "url2"],
  "competitors": [{"name": "rakip adi", "position": "1. sira|2. sira|3. sira|bahsediliyor|null", "sentiment": "pozitif|notr|negatif"}],
  "citationSources": [{"name": "kaynak adi", "url": "https://...", "type": "website|directory|social|news|review|other"}],
  "mentionContext": "kisa alinti",
  "competitorAdvantage": "rakip varsa neden onde bahsedildiginin kisa analizi"
}

Kurallar:
- "direct": Firma adi yanıtta acikca geciyor
- "indirect": Firma adi gecmiyor AMA sektor/bolge/hizmet tanimi firma ile eslesiyor
- "none": Firma hic bahsedilmiyor
- Turkce karakter normalizasyonu yap (i/I, s/S, c/C, g/G, u/U, o/O)
- Listeleme formatı farklı olabilir: numaralı, madde isaretli, kalin, virgülle ayrilmis`;

export interface BatchAnalysisTask {
  projectId: string;
  keyword: string;
  platform: string;
  brandName: string;
  aiResponse: string;
}

function getClient(): Anthropic {
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}

/**
 * Tum analiz gorevlerini tek batch'te gonder.
 * Batch 24 saat icinde tamamlanir — genellikle 1-3 saat.
 * Prompt cache ile system prompt %90 indirimli okunur.
 */
export async function runBatchAnalysis(
  tasks: BatchAnalysisTask[],
): Promise<string> {
  const client = getClient();

  const batch = await client.messages.batches.create({
    requests: tasks.map((task) => ({
      custom_id: `${task.projectId}--${task.platform}--${encodeURIComponent(task.keyword.slice(0, 80))}`,
      params: {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: [
          {
            type: "text" as const,
            text: ANALYZER_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" as const },
          },
        ],
        messages: [
          {
            role: "user" as const,
            content: `Marka: "${task.brandName}"\nPlatform: ${task.platform}\nSorgu: ${task.keyword}\n\nYanit:\n${task.aiResponse.slice(0, 3000)}`,
          },
        ],
      },
    })),
  });

  return batch.id;
}

/**
 * Batch sonuclarini kontrol et.
 * Tamamlandiysa sonuclari parse edip dondur.
 */
export async function checkBatchResults(
  batchId: string,
): Promise<
  | { status: "processing" }
  | { status: "ended"; results: Map<string, AnalysisResult> }
> {
  const client = getClient();
  const batch = await client.messages.batches.retrieve(batchId);

  if (batch.processing_status !== "ended") {
    return { status: "processing" };
  }

  const results = new Map<string, AnalysisResult>();

  // Batch results: SDK may return a decoder or async iterable
  const decoder = await client.messages.batches.results(batchId);
  const items = Symbol.asyncIterator in decoder
    ? decoder
    : (decoder as unknown as { data: Anthropic.Messages.Batches.MessageBatchIndividualResponse[] }).data ?? [];

  for await (const result of items as AsyncIterable<Anthropic.Messages.Batches.MessageBatchIndividualResponse>) {
    if (result.result.type === "succeeded") {
      try {
        const text = result.result.message.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");

        const parsed = JSON.parse(text) as AnalysisResult;
        results.set(result.custom_id, parsed);
      } catch {
        // skip malformed results
      }
    }
  }

  return { status: "ended", results };
}

/**
 * Haftalik rapor ve blog iceriklerini batch ile uret.
 * Opus modeli kullanilir. Prompt cache ayni sekilde calisir.
 */
export async function runBatchReports(
  customers: Array<{
    id: string;
    name: string;
    weeklyData: Record<string, unknown>;
  }>,
): Promise<string> {
  const client = getClient();

  const REPORT_SYSTEM_PROMPT = `Sen bir GEO analiz uzmanisin.
Sana bir firmanin haftalik AI gorunurluk verilerini gonderecegim.
Kisisellestirilmis bir rapor yaz.
Rapor formati:
1. Genel degerlendirme (2 paragraf)
2. Bu hafta ne degisti
3. Rakip hareketleri
4. Oncelikli aksiyonlar (3 madde)
5. Gelecek hafta beklentisi
Ton: profesyonel ama samimi, Turkce.`;

  const batch = await client.messages.batches.create({
    requests: customers.map((c) => ({
      custom_id: `report-${c.id}`,
      params: {
        model: "claude-opus-4-20250514",
        max_tokens: 4096,
        system: [
          {
            type: "text" as const,
            text: REPORT_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" as const },
          },
        ],
        messages: [
          {
            role: "user" as const,
            content: `Firma: ${c.name}\nBu hafta: ${JSON.stringify(c.weeklyData)}`,
          },
        ],
      },
    })),
  });

  return batch.id;
}
