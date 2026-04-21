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
  const [pulseIdx, setPulseIdx] = useState(0);

  // Stage progress
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

  // Pulse animation — dokuz nokta, bir dalga gibi
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIdx((p) => (p + 1) % 9);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={s.analyzing}>
      {/* Hero — GH7 + slogan */}
      <div className={s.analyzingHero}>
        <div className={s.analyzingLogo}>GH7</div>
        <div className={s.analyzingSlogan}>GEO is the new SEO.</div>
      </div>

      {/* Pulse animasyonu — 9 nokta, dalga gibi */}
      <div className={s.pulseContainer}>
        {Array.from({ length: 9 }).map((_, i) => {
          const distance = Math.abs(i - pulseIdx);
          const opacity = Math.max(0.15, 1 - distance * 0.2);
          const scale = distance === 0 ? 1.4 : 1;
          return (
            <div
              key={i}
              className={s.pulseDot}
              style={{
                opacity,
                transform: `scale(${scale})`,
              }}
            />
          );
        })}
      </div>

      {/* Status */}
      <div className={s.analyzingStatus}>
        {firmDomain && (
          <div className={s.analyzingDomain}>{firmDomain}</div>
        )}
        <div className={s.analyzingCurrent}>
          {STAGES[currentIdx]?.label ?? "Tamamlandı"}
        </div>
      </div>

      {/* Stage timeline */}
      <ul className={s.stageList}>
        {STAGES.map((stage, i) => {
          const status = i < currentIdx ? "done" : i === currentIdx ? "running" : "pending";
          return (
            <li key={stage.label} className={`${s.stageItem} ${s[`stage_${status}`]}`}>
              <span className={s.stageLabel}>{stage.label}</span>
              <span className={s.stageStatus}>
                {status === "done" ? "tamam" : status === "running" ? "çalışıyor" : "bekliyor"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
