"use client";

/**
 * InsightView — Kinde editorial analiz detayı (Brief F Adım 2.1)
 *
 * Yapı:
 * - Label + H1 (2 satır)
 * - Subtitle + "Yeniden tara" link (Pro+ için)
 * - 01 Skor: text-metric + açıklama + Advisor commentary (siyah kart)
 * - 02 Rakipler: numaralı liste, separator ile
 * - 03 Sorgular: details/summary genişleme, per-query detay
 */

import Link from "next/link";
import { motion } from "motion/react";
import type {
  Brand,
  Scan,
  PromptResult,
  Prompt,
  Competitor,
} from "@prisma/client";
import { pageContainer, pageItem } from "@/lib/motion/variants";
import { generateInsightCommentary } from "@/lib/templates/insight/commentary";
import { formatPlatform } from "@/lib/templates/common/formatters";

type ScanWithResults = Scan & {
  results: (PromptResult & { prompt: Prompt })[];
};

type Props = {
  brand: Brand;
  scan: ScanWithResults | undefined;
  competitors: Competitor[];
  canStartNewAnalysis: boolean;
  plan: string;
};

export function InsightView({
  brand,
  scan,
  competitors,
  canStartNewAnalysis,
}: Props) {
  if (!scan) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="mb-6 text-muted-foreground">
          Henüz tamamlanmış tarama yok.
        </p>
        {canStartNewAnalysis && (
          <Link
            href="/analiz"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Yeni Analiz Başlat →
          </Link>
        )}
      </div>
    );
  }

  // promptId → { prompt, results[] }
  const promptsMap = new Map<
    string,
    { prompt: Prompt; results: PromptResult[] }
  >();
  for (const result of scan.results) {
    const key = result.promptId;
    if (!promptsMap.has(key)) {
      promptsMap.set(key, { prompt: result.prompt, results: [] });
    }
    promptsMap.get(key)!.results.push(result);
  }
  const prompts = Array.from(promptsMap.values());

  const score = scan.score ?? 0;
  const scoreTotal = scan.scoreTotal ?? 25;
  const ratio = scoreTotal > 0 ? score / scoreTotal : 0;
  const scoreText =
    score === scoreTotal
      ? "Tam eşleşme, tüm platformlarda bahsediliyorsun."
      : ratio >= 0.6
        ? "Güçlü performans, çoğu platformda bahsediliyorsun."
        : ratio >= 0.4
          ? "Orta düzey görünürlük, bazı platformlarda zayıfsın."
          : "Geliştirme alanı var, çoğu platformda görünmüyorsun.";

  const formattedDate = scan.completedAt
    ? new Date(scan.completedAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-4xl px-6 py-12 lg:py-20"
    >
      {/* HEADER */}
      <motion.div variants={pageItem} className="mb-16">
        <div className="text-label text-muted-foreground mb-6">GH7 Insight</div>
        <h1 className="text-h1 mb-6">
          Görünürlük
          <br />
          Detayı
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {brand.name} için {formattedDate} tarihinde yapılan tarama sonuçları.
          {canStartNewAnalysis && (
            <>
              {" "}
              <Link
                href="/analiz?force=true"
                className="text-foreground underline underline-offset-4 hover:no-underline"
              >
                Yeniden tara →
              </Link>
            </>
          )}
        </p>
      </motion.div>

      {/* 01 · SKOR */}
      <motion.section variants={pageItem} className="mb-20">
        <div className="mb-8 flex items-center gap-4">
          <div className="text-label text-muted-foreground">Skor</div>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mb-4 flex items-baseline gap-4">
          <span className="text-metric">{score}</span>
          <span className="text-2xl tabular-nums text-muted-foreground">
            / {scoreTotal}
          </span>
        </div>

        <p className="max-w-xl text-base text-muted-foreground">{scoreText}</p>

        {(() => {
          // Commentary: AI (scan.commentary) varsa onu göster, yoksa
          // statik template fallback (Brief H Aşama 2). Template Qwen/Claude
          // çağrısı yapmaz, 15 varyanttan birini deterministic seçer.
          const aiCommentary = scan.commentary?.trim();
          if (aiCommentary) {
            return (
              <div className="mt-12 rounded-xl bg-foreground p-8 text-background">
                <div className="text-label mb-4 text-background/60">
                  GH7 Advisor · Yorum
                </div>
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {aiCommentary}
                </p>
              </div>
            );
          }

          // Fallback — template üret
          const platformMentions = new Map<string, number>();
          for (const r of scan.results) {
            if (!r.mentioned) continue;
            const p = r.platform;
            platformMentions.set(p, (platformMentions.get(p) ?? 0) + 1);
          }
          const sortedPlatforms = [...platformMentions.entries()].sort(
            (a, b) => b[1] - a[1],
          );
          const enGuclu = sortedPlatforms[0]?.[0]
            ? formatPlatform(sortedPlatforms[0][0])
            : "ChatGPT";
          const enZayif = sortedPlatforms[sortedPlatforms.length - 1]?.[0]
            ? formatPlatform(
                sortedPlatforms[sortedPlatforms.length - 1][0],
              )
            : "Gemini";

          const templateCommentary = generateInsightCommentary({
            markaAdi: brand.name,
            skor: score,
            maksimumSkor: scoreTotal,
            platformSayisi: 5,
            mentionSayisi: scan.totalMentions ?? sortedPlatforms.length,
            enGuclu,
            enZayif,
            sektor: brand.sector ?? "işletme",
          });

          return (
            <div className="mt-12 rounded-xl bg-foreground p-8 text-background">
              <div className="text-label mb-4 text-background/60">
                GH7 Advisor · Yorum
              </div>
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {templateCommentary}
              </p>
            </div>
          );
        })()}
      </motion.section>

      {/* 02 · RAKİPLER */}
      {competitors.length > 0 && (
        <motion.section variants={pageItem} className="mb-20">
          <div className="mb-8 flex items-center gap-4">
            <div className="text-label text-muted-foreground">
              İzlenen Rakipler
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-0">
            {competitors.map((c, idx) => (
              <div
                key={c.id}
                className="flex items-baseline justify-between border-b border-border py-4 last:border-b-0"
              >
                <div className="flex items-baseline gap-6">
                  <span className="text-label tabular-nums text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base font-medium tracking-tight">
                    {c.name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {c.domain && !c.domain.endsWith(".placeholder")
                    ? c.domain
                    : "URL yok"}
                </span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* 03 · SORGULAR */}
      <motion.section variants={pageItem}>
        <div className="mb-8 flex items-center gap-4">
          <div className="text-label text-muted-foreground">
            Test Edilen Sorgular · {prompts.length}
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-0">
          {prompts.map(({ prompt, results }, idx) => {
            const mentionedCount = results.filter((r) => r.mentioned).length;
            const totalCount = results.length;
            const percentage = totalCount
              ? Math.round((mentionedCount / totalCount) * 100)
              : 0;
            const strength =
              mentionedCount === totalCount
                ? "Tam eşleşme"
                : percentage >= 60
                  ? "Güçlü"
                  : percentage >= 40
                    ? "Orta"
                    : "Zayıf";

            return (
              <details
                key={prompt.id}
                className="group border-b border-border py-6 last:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-baseline gap-6">
                  <span className="text-label tabular-nums text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <p className="mb-2 text-base font-medium leading-snug tracking-tight">
                      {prompt.text}
                    </p>
                    <div className="flex items-baseline gap-3 text-sm text-muted-foreground">
                      <span className="tabular-nums">
                        {mentionedCount} / {totalCount} AI
                      </span>
                      <span className="text-foreground/30">·</span>
                      <span>{strength}</span>
                    </div>
                  </div>
                  <span className="text-muted-foreground transition-transform group-open:rotate-90">
                    →
                  </span>
                </summary>

                <div className="mt-6 ml-12 space-y-4">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-lg border border-border bg-muted/40 p-5"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <span className="text-label text-muted-foreground">
                          {r.platform}
                        </span>
                        <span
                          className={`text-xs font-medium uppercase tracking-widest ${
                            r.mentioned
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {r.mentioned ? "✓ Bahsedildi" : "Bahsedilmedi"}
                        </span>
                      </div>
                      {r.fullResponse && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {r.fullResponse.slice(0, 300)}
                          {r.fullResponse.length > 300 ? "…" : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}
