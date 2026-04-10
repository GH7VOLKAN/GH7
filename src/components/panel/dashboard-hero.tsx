"use client";

import { useState, useCallback } from "react";

interface DashboardHeroProps {
  tier: string;
  brandName: string;
  weekData?: {
    goodNews: number;
    goodDelta: number;
    badNews: number;
    badDesc: string;
  };
}

/* ── TAKIP HERO ────────────────────────────────────── */
function TakipHero({ weekData }: { weekData?: DashboardHeroProps["weekData"] }) {
  const good = weekData?.goodNews ?? 12;
  const goodDelta = weekData?.goodDelta ?? 2;
  const bad = weekData?.badNews ?? 3;
  const badDesc = weekData?.badDesc ?? "sorguda rakibiniz sizi ge\u00e7ti";

  return (
    <div className="takip-hero">
      <span className="th-week">Bu Hafta \u00b7 24-30 Mart 2026</span>
      <div className="th-split">
        <div className="th-cell">
          <span className="th-cell-label good">{"\u0130"}yi haber</span>
          <span className="th-cell-num">{good}</span>
          <div className="th-cell-desc">
            sorguda g\u00f6r\u00fcn\u00fcyorsunuz. Ge\u00e7en haftaya g\u00f6re <strong>+{goodDelta} sorgu</strong>.
          </div>
        </div>
        <div className="th-cell">
          <span className="th-cell-label bad">K\u00f6t\u00fc haber</span>
          <span className="th-cell-num">{bad}</span>
          <div className="th-cell-desc">
            {badDesc}. Ge\u00e7en hafta \u00f6ndeydiniz.
          </div>
        </div>
      </div>
      <div className="th-actions">
        <button className="btn-primary">Hangi sorgular? \u2192</button>
        <button className="btn-secondary">Ge\u00e7en haftayla kar\u015f\u0131la\u015ft\u0131r</button>
      </div>
    </div>
  );
}

/* ── COZUM HERO ────────────────────────────────────── */
function CozumHero() {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const total = 3;
  const doneCount = checkedItems.filter(Boolean).length;

  const handleToggleDone = useCallback((index: number) => {
    setCheckedItems((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const handleCopy = useCallback((index: number) => {
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const items = [
    {
      num: "01",
      title: "Havuz ekipmanlar\u0131 fiyatlar\u0131 \u2014 i\u00e7erik",
      desc: "ChatGPT bu sorguda sizi bulam\u0131yor. Haz\u0131r i\u00e7erik paragraf\u0131n\u0131 sayfan\u0131za ekleyin.",
    },
    {
      num: "02",
      title: "\u00dcr\u00fcn sayfalar\u0131 \u2014 schema kodu",
      desc: "Gemini ve AI Overview i\u00e7in schema markup. Ana sayfan\u0131z\u0131n <head> b\u00f6l\u00fcm\u00fcne yap\u0131\u015ft\u0131r\u0131n.",
    },
    {
      num: "03",
      title: "Rakip kar\u015f\u0131la\u015ft\u0131rma \u2014 ba\u015fl\u0131k ve FAQ",
      desc: "Perplexity\u2019de rakibiniz \u00f6ne \u00e7\u0131k\u0131yor. Bu ba\u015fl\u0131k ve 3 soru ile fark\u0131 kapatabilirsiniz.",
    },
  ];

  return (
    <div className="cozum-hero">
      <div className="ch-header">
        <div className="ch-title">
          Bu hafta 3 \u015fey haz\u0131r.
          <br />
          Kopyala, yap\u0131\u015ft\u0131r, bitti.
        </div>
        <div className="ch-sub">
          GH7 analiz etti, \u00e7\u00f6z\u00fcm \u00fcretti. Sizin yapman\u0131z gereken tek \u015fey uygulamak.
        </div>
      </div>
      <div className="ch-items">
        {items.map((item, i) => (
          <div className="ch-item" key={i}>
            <span className="ch-item-num">{item.num}</span>
            <div className="ch-item-text">
              <div className="ch-item-title">{item.title}</div>
              <div className="ch-item-desc">{item.desc}</div>
            </div>
            <button
              className={`btn-copy${copiedIndex === i ? " copied" : ""}`}
              onClick={() => handleCopy(i)}
            >
              {copiedIndex === i ? "Kopyaland\u0131" : "Kopyala"}
            </button>
            <div
              className={`ch-item-done${checkedItems[i] ? " checked" : ""}`}
              onClick={() => handleToggleDone(i)}
              role="checkbox"
              aria-checked={checkedItems[i]}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleToggleDone(i)}
            />
          </div>
        ))}
      </div>
      <div className="ch-progress">
        <div className="ch-progress-bar-wrap">
          <div
            className="ch-progress-bar"
            style={{ width: `${(doneCount / total) * 100}%` }}
          />
        </div>
        <span className="ch-progress-text">
          {doneCount} / {total} tamamland\u0131
        </span>
      </div>
    </div>
  );
}

/* ── UYGULAT HERO ──────────────────────────────────── */
function UygulatHero() {
  return (
    <div className="uygulat-hero">
      <div className="uh-header">
        <span className="uh-month">Mart 2026</span>
        <div className="uh-title">
          Ajans bu ay 4 \u015feyi uygulad\u0131.
          <br />
          Sonu\u00e7lar gelmeye ba\u015flad\u0131.
        </div>
        <div className="uh-sub">Siz onaylad\u0131n\u0131z, biz yapt\u0131k. \u0130\u015fte bu ayki de\u011fi\u015fim.</div>
      </div>

      <div className="uh-score-row">
        <div>
          <div className="uh-score-arrow">
            <span className="from">61</span>
            <span className="arr">{"\u2192"}</span>
            <span className="to">74</span>
          </div>
          <div className="uh-score-label">
            GEO Skoru {"\u00b7"} <strong>+13 puan</strong> bu ay
          </div>
        </div>
        <div className="uh-score-details">
          <div className="uh-detail-row">
            <span className="uh-detail-label">Ses Pay\u0131</span>
            <span className="uh-detail-val pos">%24 {"\u2192"} %26 {"\u2191"}</span>
          </div>
          <div className="uh-detail-row">
            <span className="uh-detail-label">G\u00f6r\u00fcn\u00fcr Sorgu</span>
            <span className="uh-detail-val pos">9 {"\u2192"} 12 {"\u2191"}</span>
          </div>
          <div className="uh-detail-row">
            <span className="uh-detail-label">Rakip \u00f6nde</span>
            <span className="uh-detail-val pos">5 {"\u2192"} 3 {"\u2193"}</span>
          </div>
          <div className="uh-detail-row">
            <span className="uh-detail-label">Ort. Pozisyon</span>
            <span className="uh-detail-val pos">2.1 {"\u2192"} 1.4 {"\u2191"}</span>
          </div>
        </div>
      </div>

      <div className="uh-done-list">
        <div className="uh-done">
          <div className="uh-done-title">Schema markup eklendi</div>
          <div className="uh-done-desc">12 \u00fcr\u00fcn sayfas\u0131na yap\u0131land\u0131r\u0131lm\u0131\u015f veri eklendi.</div>
          <span className="uh-done-status">Uyguland\u0131 {"\u00b7"} 3 Mart</span>
        </div>
        <div className="uh-done">
          <div className="uh-done-title">FAQ i\u00e7erikleri yaz\u0131ld\u0131</div>
          <div className="uh-done-desc">8 sorguda AI&apos;\u0131n arad\u0131\u011f\u0131 i\u00e7erik olu\u015fturuldu ve yay\u0131nland\u0131.</div>
          <span className="uh-done-status">Uyguland\u0131 {"\u00b7"} 8 Mart</span>
        </div>
        <div className="uh-done">
          <div className="uh-done-title">Ba\u015fl\u0131k ve meta g\u00fcncelleme</div>
          <div className="uh-done-desc">Ana sayfa ve 5 kategori sayfas\u0131nda AI uyumlu ba\u015fl\u0131klar.</div>
          <span className="uh-done-status">Uyguland\u0131 {"\u00b7"} 15 Mart</span>
        </div>
        <div className="uh-done">
          <div className="uh-done-title">Rakip bo\u015flu\u011fu i\u00e7erikleri</div>
          <div className="uh-done-desc">Rakibin \u00f6ne \u00e7\u0131kt\u0131\u011f\u0131 3 sorguda yeni i\u00e7erik \u00fcretildi.</div>
          <span className="uh-done-status">Uyguland\u0131 {"\u00b7"} 22 Mart</span>
        </div>
      </div>

      <div className="th-actions">
        <button className="btn-primary">Nisan plan\u0131n\u0131 g\u00f6r {"\u2192"}</button>
        <button className="btn-secondary">Detayl\u0131 rapor</button>
      </div>
    </div>
  );
}

/* ── FREE HERO ─────────────────────────────────────── */
function FreeHero() {
  return (
    <div className="free-hero">
      <div className="free-hero-title">GEO skorunuzu \u00f6\u011frenin</div>
      <div className="free-hero-desc">
        Markan\u0131z\u0131n AI arama motorlar\u0131nda nas\u0131l g\u00f6r\u00fcnd\u00fc\u011f\u00fcn\u00fc ke\u015ffedin.
        <br />
        Pro plana ge\u00e7erek haftal\u0131k \u00e7\u00f6z\u00fcm \u00f6nerileri al\u0131n.
      </div>
      <button className="btn-primary">Pro&apos;ya Ge\u00e7 {"\u2192"}</button>
    </div>
  );
}

/* ── MAIN EXPORT ───────────────────────────────────── */
export default function DashboardHero({ tier, brandName, weekData }: DashboardHeroProps) {
  const activeTier = tier === "free" ? "free" : "takip";

  return (
    <div className="hero-zone">
      <div className={`tier-panel${activeTier === "takip" ? " active" : ""}`}>
        <TakipHero weekData={weekData} />
      </div>
      <div className={`tier-panel${activeTier === "free" ? " active" : ""}`}>
        <FreeHero />
      </div>
    </div>
  );
}
