"use client";

import s from "../analiz.module.css";

type Props = {
  domain: string;
  sector?: string;
};

export function DetectingStrip({ domain, sector }: Props) {
  return (
    <section className={s.screen}>
      <div className={s.screenLabel}>Ekran 1 · Site okunuyor</div>
      <div className={s.detect}>
        <div className={s.detectRow}>
          <span className={s.detectLabel}>Domain</span>
          <span className={s.detectVal}>{domain}</span>
        </div>
        <div className={s.detectRow}>
          <span className={s.detectLabel}>Sektör tespiti</span>
          <span className={s.detectVal}>{sector ?? "•••"}</span>
        </div>
        <div className={s.detectRow}>
          <span className={s.detectLabel}>Ana ürünler</span>
          <span className={s.detectVal}>{sector ? "5 bulundu" : "•••"}</span>
        </div>
        <div className={s.detectRow}>
          <span className={`${s.detectLabel} ${s.detectDots}`}>Rakipler aranıyor</span>
          <span className={s.detectVal}>•</span>
        </div>
      </div>
    </section>
  );
}
