"use client";

import Link from "next/link";
import type { Brand, Scan, PromptResult, Prompt, Competitor } from "@prisma/client";
import s from "../insight.module.css";

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
      <div className={s.shell}>
        <main className={s.main}>
          <div className={s.empty}>
            <p>Henüz tamamlanmış tarama yok.</p>
            {canStartNewAnalysis && (
              <Link href="/analiz" className={s.primaryBtn}>
                Yeni Analiz Başlat →
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Sorguları gruplama: promptId → { prompt, results[] }
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

  return (
    <div className={s.shell}>
      <main className={s.main}>
        {/* Banner: GH7 INSIGHT */}
        <div className={s.banner}>
          <span className={s.bannerBrand}>GH7 INSIGHT</span>
          <span className={s.bannerSub}>· Canlı AI görünürlük analizi</span>
        </div>

        {/* Header: brand + Yeni analiz butonu */}
        <div className={s.header}>
          <div>
            <Link href="/dashboard" className={s.backLink}>
              ← Dashboard
            </Link>
            <h1 className={s.title}>{brand.name}</h1>
            <p className={s.subtitle}>
              {brand.domain}
              {brand.sector ? ` · ${brand.sector}` : " · Sektör belirsiz"}
              {brand.city ? ` · ${brand.city}` : ""}
            </p>
          </div>
          {canStartNewAnalysis && (
            <Link href="/analiz?force=true" className={s.primaryBtn}>
              Yeni Analiz Başlat →
            </Link>
          )}
        </div>

        {/* Score card */}
        <div className={s.scoreCard}>
          <div className={s.scoreBig}>
            {scan.score ?? 0}
            <span className={s.scoreTotal}> / {scan.scoreTotal ?? 25}</span>
          </div>
          <div className={s.scoreLabel}>AI Görünürlük Skoru</div>
          <div className={s.scoreMeta}>
            {scan.totalQueries ?? prompts.length} sorgu · 5 AI platform
            {scan.completedAt
              ? ` · ${new Date(scan.completedAt).toLocaleDateString("tr-TR")}`
              : ""}
          </div>
        </div>

        {/* Commentary (GH7 ADVISOR) */}
        {scan.commentary && (
          <div className={s.commentary}>
            <div className={s.commentaryHeader}>
              <span className={s.commentaryBrand}>GH7 ADVISOR</span>
              <span className={s.commentarySub}>· Analiz Raporu</span>
            </div>
            <p className={s.commentaryText}>{scan.commentary}</p>
          </div>
        )}

        {/* Competitors */}
        {competitors.length > 0 && (
          <section className={s.section}>
            <h2 className={s.sectionTitle}>İzlenen Rakipler</h2>
            <div className={s.competitorList}>
              {competitors.map((c) => (
                <div key={c.id} className={s.competitorItem}>
                  <span className={s.competitorName}>{c.name}</span>
                  {c.domain && !c.domain.endsWith(".placeholder") && (
                    <span className={s.competitorDomain}>{c.domain}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prompts */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>Test Edilen Sorgular</h2>
          <div className={s.promptList}>
            {prompts.map(({ prompt, results }, idx) => (
              <details key={prompt.id} className={s.promptItem}>
                <summary className={s.promptHeader}>
                  <span className={s.promptNum}>{idx + 1}</span>
                  <span className={s.promptText}>{prompt.text}</span>
                  <span className={s.promptScore}>
                    {results.filter((r) => r.mentioned).length} / {results.length}
                  </span>
                </summary>
                <div className={s.promptBody}>
                  {results.map((r) => (
                    <div key={r.id} className={s.resultItem}>
                      <div className={s.resultHeader}>
                        <span className={s.resultPlatform}>{r.platform}</span>
                        <span
                          className={
                            r.mentioned
                              ? s.mentionedBadge
                              : s.notMentionedBadge
                          }
                        >
                          {r.mentioned ? "✓ Bahsedildi" : "✗ Bahsedilmedi"}
                        </span>
                      </div>
                      {r.fullResponse && (
                        <p className={s.resultText}>
                          {r.fullResponse.slice(0, 400)}
                          {r.fullResponse.length > 400 ? "..." : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
