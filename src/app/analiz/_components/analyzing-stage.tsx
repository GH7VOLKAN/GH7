"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import s from "../analiz.module.css";

// Lottie SSR'da çalışmaz — dynamic import
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import aiLoadingAnimation from "../../../../public/animations/ai-loading.json";

const STAGES = [
  { label: "Site okunuyor", duration: 8000 },
  { label: "Bağlam analiz ediliyor", duration: 6000 },
  { label: "Sorgular üretiliyor", duration: 5000 },
  { label: "5 AI paralel çağrılıyor", duration: 25000 },
  { label: "Cevaplar işleniyor", duration: 8000 },
  { label: "Rakipler tespit ediliyor", duration: 6000 },
];

// Lottie bekleme sırasında rotasyon yapılacak teaser mesajları
const TEASER_ROTATION = [
  "ChatGPT search ile canlı veriye bakılıyor",
  "Claude web search aktif, gerçek cevaplar toplanıyor",
  "Gemini grounding ile kaynaklardan okuma yapılıyor",
  "Perplexity Sonar sektörü tarıyor",
  "Google AI Overview paralelde analiz ediyor",
  "Opus cevapları birleştiriyor",
  "Rakipler frekansa göre sıralanıyor",
  "Sonuç raporu hazırlanıyor",
];

export function AnalyzingStage({ firmDomain }: { firmDomain?: string }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [teaserIdx, setTeaserIdx] = useState(0);

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

  // Teaser rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTeaserIdx((p) => (p + 1) % TEASER_ROTATION.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={s.analyzing}>
      <div className={s.analyzingHero}>
        <div className={s.analyzingLogo}>GH7</div>
        <div className={s.analyzingSlogan}>GEO is the new SEO.</div>
      </div>

      <div className={s.lottieWrap}>
        <Lottie
          animationData={aiLoadingAnimation}
          loop
          autoplay
          style={{ width: "100%", maxWidth: 280, height: "auto" }}
        />
      </div>

      <div className={s.analyzingStatus}>
        {firmDomain && <div className={s.analyzingDomain}>{firmDomain}</div>}
        <div className={s.analyzingCurrent}>
          {STAGES[currentIdx]?.label ?? "Tamamlandı"}
        </div>
        <div className={s.analyzingTeaser}>
          {TEASER_ROTATION[teaserIdx]}
        </div>
      </div>

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
