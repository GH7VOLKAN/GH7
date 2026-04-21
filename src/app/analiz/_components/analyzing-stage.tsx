"use client";

import { useEffect, useState } from "react";
import s from "../analiz.module.css";

const STAGES = [
  { label: "Site okunuyor", duration: 8000 },
  { label: "Bağlam analiz ediliyor", duration: 6000 },
  { label: "Sorgular üretiliyor", duration: 5000 },
  { label: "5 AI paralel çağrılıyor", duration: 25000 },
  { label: "Cevaplar işleniyor", duration: 8000 },
  { label: "Rakipler tespit ediliyor", duration: 6000 },
];

export function AnalyzingStage({ firmDomain }: { firmDomain?: string }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let idx = 0;

    const tick = () => {
      if (cancelled) return;
      if (idx >= STAGES.length) return;
      setCurrentIdx(idx);
      setTimeout(() => {
        idx++;
        tick();
      }, STAGES[idx].duration);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={s.screen}>
      <div className={s.screenLabel}>Ekran 2 · Analiz Ediliyor</div>
      <h2 className={s.h2}>Taranıyor.</h2>
      {firmDomain && (
        <p className={s.sub} style={{ fontFamily: "monospace", fontSize: 13 }}>
          {firmDomain}
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: "32px 0 0", maxWidth: 400 }}>
        {STAGES.map((stage, i) => {
          const status = i < currentIdx ? "done" : i === currentIdx ? "running" : "pending";
          return (
            <li
              key={stage.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--g100)",
                color:
                  status === "pending"
                    ? "var(--g300)"
                    : status === "running"
                      ? "var(--black)"
                      : "var(--g500)",
                fontSize: 14,
              }}
            >
              <span>{stage.label}</span>
              <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {status === "done" ? "tamam" : status === "running" ? "çalışıyor" : "bekliyor"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
