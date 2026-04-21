"use client";

import { useState } from "react";
import s from "../analiz.module.css";
import type { Competitor } from "@/lib/analiz/types";
import { isValidDomain, normalizeDomain } from "@/lib/analiz/domain";

type Props = {
  productName: string;
  competitors: Competitor[];
  selectedId: string | null;
  onSelect: (c: Competitor) => void;
};

export function CompetitorPicker({
  productName,
  competitors,
  selectedId,
  onSelect,
}: Props) {
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState("");

  const handleManualSubmit = () => {
    const normalized = normalizeDomain(manualInput);
    if (!isValidDomain(normalized)) return;
    const manualComp: Competitor = {
      id: `manual-${normalized}`,
      domain: normalized,
      mentions: {},
    };
    onSelect(manualComp);
  };

  return (
    <section className={s.screen}>
      <div className={s.screenLabel}>Ekran 2b · Rakip seç</div>
      <h2 className={s.h2}>Kimle kıyaslayalım?</h2>
      <p className={s.sub}>
        {productName} için AI&apos;ların önerdiği rakipler. Biri yeterli.
      </p>

      <ul className={s.cards}>
        {competitors.map((c) => {
          const mentionStr = Object.entries(c.mentions)
            .slice(0, 2)
            .map(([prov, rank]) => `${prov} ${rank}`)
            .join(" · ");
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c)}
                className={`${s.card} ${selectedId === c.id ? s.cardSelected : ""}`}
              >
                <span className={s.cardTitle}>{c.domain}</span>
                <span className={s.cardMeta}>{mentionStr || "—"}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {!manualMode ? (
        <button
          type="button"
          className={s.manualLink}
          onClick={() => setManualMode(true)}
        >
          Rakibini elle gir →
        </button>
      ) : (
        <div className={s.manualForm}>
          <input
            className={s.manualInput}
            type="text"
            placeholder="rakip.com"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
            autoFocus
          />
          <button
            type="button"
            className={s.manualSubmit}
            onClick={handleManualSubmit}
          >
            Kıyasla
          </button>
        </div>
      )}
    </section>
  );
}
