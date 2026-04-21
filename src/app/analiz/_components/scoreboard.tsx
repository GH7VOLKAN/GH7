"use client";

import s from "../analiz.module.css";
import type { AnalysisResult } from "@/lib/analiz/types";
import { AI_PROVIDERS, AI_PROVIDER_LABELS } from "@/lib/analiz/types";

type Props = { analysis: AnalysisResult };

export function Scoreboard({ analysis }: Props) {
  const { queries, yourBrandName, competitorBrandName } = analysis;

  const yourTotals = AI_PROVIDERS.map((prov) =>
    queries.reduce((acc, q) => {
      const a = q.answers.find((x) => x.provider === prov);
      return acc + (a?.mentionedYou ? 1 : 0);
    }, 0),
  );
  const themTotals = AI_PROVIDERS.map((prov) =>
    queries.reduce((acc, q) => {
      const a = q.answers.find((x) => x.provider === prov);
      return acc + (a?.mentionedThem ? 1 : 0);
    }, 0),
  );

  const totalYou = yourTotals.reduce((a, b) => a + b, 0);
  const totalCells = queries.length * AI_PROVIDERS.length;

  return (
    <section className={s.screen}>
      <div className={s.screenLabel}>Ekran 4 · Sonuç</div>

      {analysis.cached && (
        <div className={s.cachedBadge}>Önbellekten · son 7 gün</div>
      )}

      <div className={s.resultHit}>
        <span>{totalCells} cevaptan</span>
        <br />
        <span className={s.resultHitBig}>{totalYou}&apos;inde</span>{" "}
        {totalYou === 0 ? "yoktun" : "önerildin"}.
      </div>
      <div className={s.resultSub}>
        Rakibin <strong>{competitorBrandName}</strong>:{" "}
        <strong>
          {themTotals.reduce((a, b) => a + b, 0)}/{totalCells}
        </strong>
      </div>

      <div className={s.scoreboard}>
        <div className={s.sbHead}>
          <div>Sorgu</div>
          {AI_PROVIDERS.map((prov) => (
            <div key={prov}>{AI_PROVIDER_LABELS[prov]}</div>
          ))}
        </div>

        {queries.map((q) => (
          <div key={q.id} className={s.sbRow}>
            <div className={s.sbQuery}>{q.text}</div>
            {AI_PROVIDERS.map((prov) => {
              const a = q.answers.find((x) => x.provider === prov);
              const mentioned = a?.mentionedYou ?? false;
              return (
                <div key={prov}>
                  <span
                    className={`${s.mark} ${mentioned ? s.markYes : s.markNo}`}
                  />
                </div>
              );
            })}
          </div>
        ))}

        <div className={`${s.sbRow} ${s.sbTotal}`}>
          <div>{yourBrandName} toplam</div>
          {yourTotals.map((n, i) => (
            <div key={i} className={s.sbTotalNum}>
              {n}
            </div>
          ))}
        </div>
        <div className={`${s.sbRow} ${s.sbTotal}`}>
          <div>{competitorBrandName} toplam</div>
          {themTotals.map((n, i) => (
            <div key={i} className={s.sbTotalNum}>
              {n}
            </div>
          ))}
        </div>
      </div>

      <div className={s.legend}>
        <span>
          <span className={`${s.legendDot} ${s.markYes}`} /> AI seni/rakibini andı
        </span>
        <span>
          <span className={`${s.legendDot} ${s.markNo}`} /> Anmadı
        </span>
      </div>

      <div className={s.queriesBlock}>
        <h3>AI ne dedi · detayları gör</h3>
        {queries.map((q) => {
          const mentionedInProv = q.answers.filter((a) => a.mentionedYou).length;
          return (
            <details key={q.id} className={s.queryDetails}>
              <summary>
                <span>&ldquo;{q.text}&rdquo;</span>
                <span style={{ fontSize: 12, color: "var(--g500)" }}>
                  {mentionedInProv}/{AI_PROVIDERS.length}
                </span>
              </summary>
              <div className={s.answers}>
                {q.answers.map((a, i) => (
                  <div key={i} className={s.answer}>
                    <div className={s.answerHead}>
                      <span>{AI_PROVIDER_LABELS[a.provider]}</span>
                      <span
                        className={a.mentionedYou ? s.answerMentioned : ""}
                      >
                        {a.mentionedYou
                          ? a.yourRank
                            ? `${yourBrandName} anıldı · sıra ${a.yourRank}`
                            : `${yourBrandName} anıldı`
                          : `${yourBrandName} anılmadı`}
                      </span>
                    </div>
                    <p style={{ margin: 0 }}>
                      <AnswerText
                        text={a.text}
                        yourBrand={yourBrandName}
                        themBrand={competitorBrandName}
                      />
                    </p>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Cevap metninde marka adlarını vurgular.
 * Turkish normalization'ı brüt: case-insensitive ve "ı/i" ile küçük bir toleransla.
 */
function AnswerText({
  text,
  yourBrand,
  themBrand,
}: {
  text: string;
  yourBrand: string;
  themBrand: string;
}) {
  // Basit tokenize: büyük harf duyarsız, ı/i tolere
  const regexSafe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const youPattern = new RegExp(
    `\\b(${regexSafe(yourBrand)}|${regexSafe(yourBrand.replace(/I/g, "İ"))})\\b`,
    "gi",
  );
  const themPattern = new RegExp(`\\b${regexSafe(themBrand)}\\b`, "gi");

  // Sırayla: önce you, sonra them. Birleştirilmiş bir split yap.
  type Piece = { text: string; kind: "plain" | "you" | "them" };
  let pieces: Piece[] = [{ text, kind: "plain" }];

  const applyPattern = (pattern: RegExp, kind: "you" | "them") => {
    const next: Piece[] = [];
    for (const p of pieces) {
      if (p.kind !== "plain") {
        next.push(p);
        continue;
      }
      const parts = p.text.split(pattern);
      const matches = p.text.match(pattern) ?? [];
      parts.forEach((part, i) => {
        if (part) next.push({ text: part, kind: "plain" });
        if (matches[i]) next.push({ text: matches[i], kind });
      });
    }
    pieces = next;
  };

  applyPattern(youPattern, "you");
  applyPattern(themPattern, "them");

  return (
    <>
      {pieces.map((p, i) => {
        if (p.kind === "you") return <span key={i} className={s.mentionYou}>{p.text}</span>;
        if (p.kind === "them") return <span key={i} className={s.mentionThem}>{p.text}</span>;
        return <span key={i}>{p.text}</span>;
      })}
    </>
  );
}
