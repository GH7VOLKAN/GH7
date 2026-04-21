"use client";

import { useState } from "react";
import s from "../analiz.module.css";
import { AI_PROVIDER_LABELS } from "@/lib/analiz/types";
import type {
  AnalyzeResult,
  CandidateCompetitor,
  SelectedCompetitor,
} from "@/lib/analiz/types";
import { MarkdownView } from "./markdown-view";

type Props = {
  result: AnalyzeResult;
  onFinalize: (selected: SelectedCompetitor[]) => void;
};

export function ResultStage({ result, onFinalize }: Props) {
  const [selected, setSelected] = useState<SelectedCompetitor[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [openQuery, setOpenQuery] = useState<string | null>(null);

  const profile = result.firmProfile;

  const toggle = (cand: CandidateCompetitor) => {
    setSelected((prev) => {
      if (prev.some((c) => c.name === cand.name)) {
        return prev.filter((c) => c.name !== cand.name);
      }
      if (prev.length >= 3) return prev;
      return [...prev, { name: cand.name, url: cand.url, isNew: false }];
    });
  };

  const addManual = () => {
    const name = manualInput.trim();
    if (!name || selected.length >= 3) return;
    if (selected.some((c) => c.name === name)) return;
    setSelected((prev) => [...prev, { name, url: null, isNew: true }]);
    setManualInput("");
  };

  const canFinalize = selected.length >= 1 && selected.length <= 3;

  return (
    <>
      {/* Firm Profile */}
      <section className={s.screen}>
        <div className={s.screenLabel}>Ekran 3 · Senin Profilin</div>
        <h2 className={s.h2}>{profile.name}</h2>
        <p className={s.sub}>{profile.sector}</p>
        {(profile.location.district || profile.location.city) && (
          <p style={{ color: "var(--g500)", marginTop: 4, fontSize: 14 }}>
            {[profile.location.district, profile.location.city].filter(Boolean).join(", ")}
          </p>
        )}

        {profile.distinctives.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 11, color: "var(--g500)", letterSpacing: "0.08em", marginBottom: 12 }}>
              AYIRT EDİCİ ÖZELLİKLER
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {profile.distinctives.map((d) => (
                <li
                  key={d}
                  style={{
                    padding: "6px 12px",
                    background: "var(--g50)",
                    borderRadius: 4,
                    fontSize: 13,
                  }}
                >
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {profile.products.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 11, color: "var(--g500)", letterSpacing: "0.08em", marginBottom: 12 }}>
              ANA ÜRÜN/HİZMETLER
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {profile.products.map((p) => (
                <li key={p} style={{ padding: "4px 0", fontSize: 14 }}>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Scoreboard */}
      <section className={s.screen}>
        <div className={s.screenLabel}>Ekran 4 · Skor</div>
        <h2 className={s.h2}>
          {result.userMentions.totalMentions} / {result.queries.length * 5}
        </h2>
        <p className={s.sub}>
          5 AI × {result.queries.length} sorguda {result.userMentions.totalMentions} kez anıldın.
          {result.healingAttempted && " İlk deneme yetersiz, ikinci geçiş yapıldı."}
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24, fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--g200)" }}>
              <th style={{ textAlign: "left", padding: "8px 4px", fontSize: 11, color: "var(--g500)", letterSpacing: "0.08em" }}>
                SORGU
              </th>
              {Object.keys(AI_PROVIDER_LABELS).map((p) => (
                <th
                  key={p}
                  style={{
                    padding: "8px 4px",
                    fontSize: 11,
                    color: "var(--g500)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {AI_PROVIDER_LABELS[p as keyof typeof AI_PROVIDER_LABELS]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.queries.map((q) => (
              <tr key={q.id} style={{ borderBottom: "1px solid var(--g100)" }}>
                <td style={{ padding: "10px 4px", maxWidth: 300 }}>
                  {q.text}
                  {q.generation === 2 && (
                    <span
                      style={{
                        marginLeft: 6,
                        padding: "1px 4px",
                        background: "var(--g100)",
                        borderRadius: 2,
                        fontSize: 9,
                        letterSpacing: "0.08em",
                      }}
                    >
                      2.GEÇİŞ
                    </span>
                  )}
                </td>
                {Object.keys(AI_PROVIDER_LABELS).map((p) => {
                  const ans = q.answers.find((a) => a.provider === p);
                  const mark = ans?.mentionedYou
                    ? "●"
                    : ans?.text
                      ? "○"
                      : "—";
                  return (
                    <td
                      key={p}
                      style={{
                        padding: "10px 4px",
                        textAlign: "center",
                        color: ans?.mentionedYou ? "var(--black)" : "var(--g400)",
                        fontWeight: ans?.mentionedYou ? 700 : 400,
                      }}
                    >
                      {mark}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Query + Answer Details (accordion) */}
      <section className={s.screen}>
        <div className={s.screenLabel}>Ekran 5 · AI Cevapları</div>
        <h2 className={s.h2}>Detaylar.</h2>

        {result.queries.map((q) => {
          const open = openQuery === q.id;
          const mentionCount = q.answers.filter((a) => a.mentionedYou).length;
          return (
            <div key={q.id} style={{ borderBottom: "1px solid var(--g200)" }}>
              <button
                onClick={() => setOpenQuery(open ? null : q.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  padding: "16px 0",
                  background: "none",
                  border: "none",
                  fontFamily: "inherit",
                  fontSize: 15,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span>&ldquo;{q.text}&rdquo;</span>
                <span style={{ fontSize: 13, color: "var(--g500)", whiteSpace: "nowrap", marginLeft: 12 }}>
                  {mentionCount}/5 {open ? "−" : "+"}
                </span>
              </button>
              {open && (
                <div style={{ paddingBottom: 24 }}>
                  {q.answers.map((a) => (
                    <div key={a.provider} style={{ padding: "16px 0", borderTop: "1px solid var(--g100)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <strong style={{ fontSize: 13, letterSpacing: "0.04em" }}>
                          {AI_PROVIDER_LABELS[a.provider]}
                        </strong>
                        <span
                          style={{
                            fontSize: 11,
                            color: a.mentionedYou ? "var(--black)" : "var(--g400)",
                            letterSpacing: "0.08em",
                            fontWeight: a.mentionedYou ? 700 : 400,
                          }}
                        >
                          {a.mentionedYou ? `${profile.name.toUpperCase()} ANILDI` : a.error ? "CEVAP YOK" : "ANILMADI"}
                        </span>
                      </div>
                      {a.error ? (
                        <p style={{ color: "var(--g400)", fontSize: 13, fontStyle: "italic" }}>
                          Bu AI cevap dönemedi ({a.error.slice(0, 80)})
                        </p>
                      ) : a.text ? (
                        <MarkdownView text={a.text} />
                      ) : (
                        <p style={{ color: "var(--g400)", fontSize: 13 }}>Boş cevap.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Competitor Selection */}
      <section className={s.screen}>
        <div className={s.screenLabel}>Ekran 6 · Rakip Seç</div>
        <h2 className={s.h2}>3 rakibini seç.</h2>
        <p className={s.sub}>AI cevaplarında en çok geçen firmalar. Frekans sıralı.</p>

        <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 16px" }}>
          {result.candidateCompetitors.slice(0, 15).map((c) => {
            const isSel = selected.some((x) => x.name === c.name);
            return (
              <li
                key={c.name}
                onClick={() => toggle(c)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--g200)",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    border: "1px solid var(--g400)",
                    borderRadius: 3,
                    background: isSel ? "var(--black)" : "transparent",
                    color: "var(--white)",
                    fontSize: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSel ? "✓" : ""}
                </span>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontSize: 13, color: "var(--g500)", whiteSpace: "nowrap" }}>
                  {c.mentionCount} anıldı
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--g400)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.providers.slice(0, 3).map((p) => AI_PROVIDER_LABELS[p].slice(0, 3)).join(", ")}
                </span>
              </li>
            );
          })}
          {selected.filter((x) => x.isNew).map((c) => (
            <li
              key={c.name}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid var(--g200)",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 3,
                  background: "var(--black)",
                  color: "var(--white)",
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✓
              </span>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</span>
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 6px",
                  background: "var(--black)",
                  color: "var(--white)",
                  borderRadius: 2,
                  letterSpacing: "0.08em",
                }}
              >
                YENİ · SONRAKİ TARAMADA
              </span>
            </li>
          ))}
        </ul>

        {selected.length < 3 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Başka bir firma ekle (manuel)"
              onKeyDown={(e) => e.key === "Enter" && addManual()}
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "1px dashed var(--g300)",
                borderRadius: 6,
                fontFamily: "inherit",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={addManual}
              style={{
                padding: "10px 16px",
                background: "var(--g100)",
                color: "var(--black)",
                border: "none",
                borderRadius: 6,
                fontFamily: "inherit",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Ekle
            </button>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 16,
            borderTop: "1px solid var(--g200)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--g500)" }}>Seçilen: {selected.length}/3</span>
          <button
            onClick={() => canFinalize && onFinalize(selected)}
            disabled={!canFinalize}
            style={{
              padding: "14px 28px",
              background: canFinalize ? "var(--black)" : "var(--g200)",
              color: canFinalize ? "var(--white)" : "var(--g400)",
              border: "none",
              borderRadius: 6,
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 600,
              cursor: canFinalize ? "pointer" : "not-allowed",
            }}
          >
            Dashboard&apos;a Git →
          </button>
        </div>
      </section>
    </>
  );
}
