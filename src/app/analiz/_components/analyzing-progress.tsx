"use client";

import s from "../analiz.module.css";
import type { ProgressStep } from "@/lib/analiz/types";

type Props = {
  steps: ProgressStep[];
  generatedQueries: string[];
};

export function AnalyzingProgress({ steps, generatedQueries }: Props) {
  return (
    <section className={s.screen}>
      <div className={s.screenLabel}>Ekran 3 · Analiz ediliyor</div>
      <h2 className={s.h2}>Taramalar yapılıyor.</h2>
      <p className={s.sub}>
        5 yapay zekaya, {generatedQueries.length || 5} farklı sorgu.
      </p>

      <div className={s.analyzeGrid}>
        <ul className={s.progressList}>
          {steps.map((step) => {
            const cls =
              step.status === "done"
                ? s.progressDone
                : step.status === "running"
                  ? s.progressRunning
                  : "";
            return (
              <li key={step.key} className={`${s.progressItem} ${cls}`}>
                <span className={s.progressLabel}>{step.label}</span>
                <span className={s.progressState}>
                  {step.status === "done"
                    ? step.detail ?? "tamam"
                    : step.status === "running"
                      ? "çalışıyor"
                      : "sırada"}
                </span>
              </li>
            );
          })}
        </ul>

        <div className={s.eduCard}>
          <h4>Üretilen sorgular</h4>
          <div className={s.generatedQueries}>
            {generatedQueries.length === 0 ? (
              <span style={{ color: "var(--g400)" }}>Sorgular üretiliyor…</span>
            ) : (
              generatedQueries.map((q, i) => (
                <strong key={i}>&ldquo;{q}&rdquo;</strong>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
