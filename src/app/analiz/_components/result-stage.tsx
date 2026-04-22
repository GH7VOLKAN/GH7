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
import { AILogo } from "./ai-logo";

type Props = {
  result: AnalyzeResult;
  onFinalize: (selected: SelectedCompetitor[]) => void;
};

type Tab = "score" | "queries" | "answers";

export function ResultStage({ result, onFinalize }: Props) {
  const [tab, setTab] = useState<Tab>("score");
  const [selected, setSelected] = useState<SelectedCompetitor[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [openQuery, setOpenQuery] = useState<string | null>(
    result.queries[0]?.id ?? null,
  );

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
  const mentionCountByQuery = new Map(
    result.queries.map((q) => [
      q.id,
      q.answers.filter((a) => a.mentionedYou).length,
    ]),
  );

  return (
    <div className={s.resultWrapper}>
      {/* Firm profile hero */}
      <section className={s.firmHero}>
        <div className={s.screenLabel}>SENİN PROFİLİN</div>
        <h1 className={s.firmName}>{profile.name}</h1>
        <p className={s.firmMeta}>
          {profile.sector}
          {(profile.location.district || profile.location.city) &&
            ` · ${[profile.location.district, profile.location.city].filter(Boolean).join(", ")}`}
        </p>

        {profile.distinctives.length > 0 && (
          <ul className={s.distinctivesList}>
            {profile.distinctives.map((d) => (
              <li key={d} className={s.distinctiveChip}>
                {d}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Score + Tab navigation */}
      <section className={s.scoreHero}>
        <div className={s.scoreBig}>
          <span className={s.scoreNum}>{result.userMentions.totalMentions}</span>
          <span className={s.scoreDiv}>/</span>
          <span className={s.scoreTotal}>{result.queries.length * 5}</span>
        </div>
        <p className={s.scoreSub}>
          5 AI × {result.queries.length} sorguda {result.userMentions.totalMentions} kez anıldın.
          {result.healingAttempted && " İlk denemede bulunamadı, farklı açıdan yeniden sorduk."}
        </p>

        {/* Tabs */}
        <div className={s.tabs} role="tablist">
          <button
            role="tab"
            aria-selected={tab === "score"}
            onClick={() => setTab("score")}
            className={`${s.tab} ${tab === "score" ? s.tabActive : ""}`}
          >
            Skor
          </button>
          <button
            role="tab"
            aria-selected={tab === "queries"}
            onClick={() => setTab("queries")}
            className={`${s.tab} ${tab === "queries" ? s.tabActive : ""}`}
          >
            Sorgular
          </button>
          <button
            role="tab"
            aria-selected={tab === "answers"}
            onClick={() => setTab("answers")}
            className={`${s.tab} ${tab === "answers" ? s.tabActive : ""}`}
          >
            Cevaplar
          </button>
        </div>
      </section>

      {/* Tab content */}
      <section className={s.tabContent}>
        {tab === "score" && (
          <ScoreTab result={result} mentionCountByQuery={mentionCountByQuery} />
        )}
        {tab === "queries" && <QueriesTab result={result} />}
        {tab === "answers" && (
          <AnswersTab
            result={result}
            openQuery={openQuery}
            setOpenQuery={setOpenQuery}
            firmName={profile.name}
          />
        )}
      </section>

      {/* Competitor selection */}
      <section className={s.competitorSection}>
        <div className={s.screenLabel}>RAKİP SEÇ</div>
        <h2 className={s.h2}>3 rakibini seç.</h2>
        <p className={s.sub}>AI cevaplarında en çok geçen firmalar. Frekans sıralı.</p>

        <ul className={s.candidateList}>
          {result.candidateCompetitors.slice(0, 15).map((c) => {
            const isSel = selected.some((x) => x.name === c.name);
            return (
              <li
                key={c.name}
                onClick={() => toggle(c)}
                className={`${s.candidateItem} ${isSel ? s.candidateSelected : ""}`}
              >
                <span className={`${s.checkbox} ${isSel ? s.checkboxChecked : ""}`}>
                  {isSel ? "✓" : ""}
                </span>
                <span className={s.candidateName}>{c.name}</span>
                <span className={s.candidateFreq}>{c.mentionCount} anıldı</span>
                <div className={s.candidateProviders}>
                  {c.providers.slice(0, 5).map((p) => (
                    <AILogo key={p} provider={p} size={14} />
                  ))}
                </div>
              </li>
            );
          })}
          {selected
            .filter((x) => x.isNew)
            .map((c) => (
              <li key={c.name} className={`${s.candidateItem} ${s.candidateSelected}`}>
                <span className={`${s.checkbox} ${s.checkboxChecked}`}>✓</span>
                <span className={s.candidateName}>{c.name}</span>
                <span className={s.candidateNewBadge}>YENİ · sonraki taramada</span>
              </li>
            ))}
        </ul>

        {selected.length < 3 && (
          <div className={s.manualRow}>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Başka bir firma ekle"
              onKeyDown={(e) => e.key === "Enter" && addManual()}
              className={s.manualInput}
            />
            <button onClick={addManual} className={s.manualBtn}>
              Ekle
            </button>
          </div>
        )}

        <div className={s.competitorFooter}>
          <span className={s.footerCount}>Seçilen: {selected.length}/3</span>
        </div>
      </section>

      {/* Pro CTA — 43 madde */}
      <ProGate
        canFinalize={canFinalize}
        onFinalize={() => onFinalize(selected)}
        firmName={profile.name}
        mentionScore={result.userMentions.totalMentions}
        totalPossible={result.queries.length * 5}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Score Tab — matrix + legend
// ═══════════════════════════════════════════════════════════

function ScoreTab({
  result,
  mentionCountByQuery,
}: {
  result: AnalyzeResult;
  mentionCountByQuery: Map<string, number>;
}) {
  return (
    <div>
      <div className={s.matrixWrap}>
        <table className={s.matrix}>
          <thead>
            <tr>
              <th className={s.matrixHeaderSorgu}>SORGU</th>
              {Object.keys(AI_PROVIDER_LABELS).map((p) => (
                <th key={p} className={s.matrixHeaderAI}>
                  <AILogo provider={p as keyof typeof AI_PROVIDER_LABELS} size={18} />
                  <span className={s.matrixHeaderLabel}>
                    {AI_PROVIDER_LABELS[p as keyof typeof AI_PROVIDER_LABELS]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.queries.map((q) => {
              const count = mentionCountByQuery.get(q.id) ?? 0;
              return (
                <tr key={q.id} className={s.matrixRow}>
                  <td className={s.matrixSorgu}>
                    <span className={s.matrixSorguText}>{q.text}</span>
                    {q.generation === 2 && (
                      <span className={s.gen2Badge}>2.GEÇİŞ</span>
                    )}
                    <span className={s.matrixRowScore}>{count}/5</span>
                  </td>
                  {Object.keys(AI_PROVIDER_LABELS).map((p) => {
                    const ans = q.answers.find((a) => a.provider === p);
                    return (
                      <td
                        key={p}
                        className={`${s.matrixCell} ${
                          ans?.mentionedYou
                            ? s.cellMentioned
                            : ans?.text
                              ? s.cellNotMentioned
                              : s.cellEmpty
                        }`}
                      >
                        {ans?.mentionedYou ? "●" : ans?.text ? "○" : "—"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={s.legend}>
        <span>
          <span className={s.legendDotFilled}>●</span> AI seni andı
        </span>
        <span>
          <span className={s.legendDotEmpty}>○</span> Andı ama sen yoktun
        </span>
        <span>
          <span className={s.legendDotMissing}>—</span> Cevap yok
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Queries Tab — sadece sorguları göster
// ═══════════════════════════════════════════════════════════

function QueriesTab({ result }: { result: AnalyzeResult }) {
  return (
    <ol className={s.queryList}>
      {result.queries.map((q, i) => {
        const mentionCount = q.answers.filter((a) => a.mentionedYou).length;
        return (
          <li key={q.id} className={s.queryItem}>
            <div className={s.queryNumber}>Q{i + 1}</div>
            <div className={s.queryBody}>
              <p className={s.queryText}>{q.text}</p>
              <div className={s.queryMeta}>
                <span className={s.queryMetaScore}>{mentionCount}/5 AI anıldın</span>
                {q.generation === 2 && (
                  <span className={s.gen2Badge}>2.GEÇİŞ</span>
                )}
                <div className={s.queryMetaProviders}>
                  {q.answers
                    .filter((a) => a.mentionedYou)
                    .map((a) => (
                      <AILogo key={a.provider} provider={a.provider} size={14} />
                    ))}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ═══════════════════════════════════════════════════════════
// Answers Tab — accordion, full markdown
// ═══════════════════════════════════════════════════════════

function AnswersTab({
  result,
  openQuery,
  setOpenQuery,
  firmName,
}: {
  result: AnalyzeResult;
  openQuery: string | null;
  setOpenQuery: (id: string | null) => void;
  firmName: string;
}) {
  return (
    <ul className={s.answerAccordion}>
      {result.queries.map((q) => {
        const open = openQuery === q.id;
        const mentionCount = q.answers.filter((a) => a.mentionedYou).length;
        return (
          <li key={q.id} className={s.answerItem}>
            <button
              onClick={() => setOpenQuery(open ? null : q.id)}
              className={s.answerToggle}
              aria-expanded={open}
            >
              <span className={s.answerQuery}>&ldquo;{q.text}&rdquo;</span>
              <span className={s.answerMeta}>
                <span className={s.answerMetaCount}>{mentionCount}/5</span>
                <span className={s.answerMetaChevron}>{open ? "−" : "+"}</span>
              </span>
            </button>
            {open && (
              <div className={s.answerBody}>
                {q.answers.map((a) => (
                  <div key={a.provider} className={s.answerPanel}>
                    <div className={s.answerHeader}>
                      <div className={s.answerProvider}>
                        <AILogo provider={a.provider} size={16} />
                        <strong>{AI_PROVIDER_LABELS[a.provider]}</strong>
                      </div>
                      <span
                        className={`${s.answerBadge} ${
                          a.mentionedYou
                            ? s.answerBadgeMentioned
                            : a.error
                              ? s.answerBadgeError
                              : s.answerBadgeMissed
                        }`}
                      >
                        {a.mentionedYou
                          ? `${firmName.toUpperCase()} ANILDI`
                          : a.error
                            ? "CEVAP YOK"
                            : "ANILMADI"}
                      </span>
                    </div>
                    {a.error ? (
                      <p className={s.answerError}>
                        Bu AI cevap dönemedi ({a.error.slice(0, 100)})
                      </p>
                    ) : a.text ? (
                      <MarkdownView text={a.text} />
                    ) : (
                      <p className={s.answerError}>Boş cevap.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ═══════════════════════════════════════════════════════════
// Pro Gate — 43 madde tanıtımı, blurred liste, güçlü CTA
// ═══════════════════════════════════════════════════════════

const AUDIT_43_PREVIEW = [
  "Schema.org structured data düzeni",
  "FAQ page implementasyonu",
  "About sayfası otorite sinyalleri",
  "Hakkımızda genişletilmiş anlatım",
  "Teknik altyapı açılımı",
  "Ürün/hizmet sayfalarında soru-cevap",
  "Müşteri referansı ve case study sayfaları",
  "Medya/basın mentions koleksiyonu",
  "E-E-A-T sinyal güçlendirme",
  "Backlink profili AI crawler optimizasyonu",
  "Site hiyerarşisi AI için okunabilirlik",
  "Meta description AI-first yazım",
  "Alt text AI indexing optimizasyonu",
  "URL slug yapısı düzenleme",
  "Internal link AI crawler flow",
  "Author bio sayfaları",
  "Contact page trust signal",
  "Pricing page transparency",
  "Process/methodology anlatım",
  "Industry certifications display",
  "Case study structured markup",
  "Review & testimonial schema",
  "Video content structured data",
  "Image captions AI context",
  "Table data structured format",
  "List markup doğru kullanım",
  "Heading hierarchy AI okunabilir",
  "Content freshness signals",
  "Topical authority cluster",
  "Expert author attribution",
  "Published/updated date visibility",
  "Industry glossary sayfası",
  "Comparison pages",
  "Alternative/versus sayfaları",
  "How-to içerik yapısı",
  "Definition box optimizasyonu",
  "Key facts featured prominently",
  "Data citations (research, stats)",
  "External authority references",
  "Social proof visibility",
  "Press mention aggregation",
  "Award/recognition display",
  "Team expertise signals",
];

function ProGate({
  canFinalize,
  onFinalize,
  firmName,
  mentionScore,
  totalPossible,
}: {
  canFinalize: boolean;
  onFinalize: () => void;
  firmName: string;
  mentionScore: number;
  totalPossible: number;
}) {
  const missedCount = totalPossible - mentionScore;
  return (
    <section className={s.proGate}>
      <div className={s.proLabel}>ŞİMDİ NE OLACAK</div>
      <h2 className={s.proHeadline}>GEO is the new SEO.</h2>
      <p className={s.proSub}>
        {missedCount} AI cevabında görünmedin. Bu tesadüf değil — yapısal.
        <br />
        43 maddelik gelişim planın hazır. Sadece Pro&apos;da açılır.
      </p>

      {/* Stat strip — landing'deki istatistikler */}
      <div className={s.proStats}>
        <div className={s.proStat}>
          <div className={s.proStatNum}>%25</div>
          <div className={s.proStatLabel}>
            Geleneksel arama trafiği 2026&apos;ya kadar düşecek
          </div>
          <div className={s.proStatSource}>Gartner, 2025</div>
        </div>
        <div className={s.proStat}>
          <div className={s.proStatNum}>%40</div>
          <div className={s.proStatLabel}>
            GEO optimize içerik AI&apos;da daha görünür
          </div>
          <div className={s.proStatSource}>Princeton / ACM KDD, 2024</div>
        </div>
        <div className={s.proStat}>
          <div className={s.proStatNum}>%60</div>
          <div className={s.proStatLabel}>
            Google aramalarının %60&apos;ı tıklama olmadan bitiyor
          </div>
          <div className={s.proStatSource}>Bain &amp; Company, 2025</div>
        </div>
      </div>

      {/* 43 madde listesi — blurred */}
      <div className={s.auditPreviewWrap}>
        <div className={s.auditPreviewHeader}>
          <span className={s.screenLabel}>
            43 MADDE · {firmName.toUpperCase()} İÇİN ÖZEL HAZIRLANDI
          </span>
        </div>
        <ol className={s.auditPreviewList}>
          {AUDIT_43_PREVIEW.slice(0, 43).map((item, i) => (
            <li key={i} className={s.auditPreviewItem}>
              <span className={s.auditPreviewNum}>{String(i + 1).padStart(2, "0")}</span>
              <span className={s.auditPreviewText}>{item}</span>
              <span className={s.auditPreviewLock}>Pro</span>
            </li>
          ))}
        </ol>
        <div className={s.auditBlurOverlay}>
          <div className={s.auditBlurContent}>
            <div className={s.auditBlurTitle}>43 madde · kilitli</div>
            <p className={s.auditBlurSub}>
              Her madde {firmName} için uygulanabilir halde. Tamamı Pro&apos;da açılır.
            </p>
          </div>
        </div>
      </div>

      {/* Main CTA */}
      <div className={s.proCTA}>
        <div className={s.proCTAPrice}>
          <span className={s.proCTAAmount}>₺699</span>
          <span className={s.proCTAPeriod}>/ay</span>
        </div>
        <p className={s.proCTASub}>
          Yıllık ₺8,388 · İlk ay koşulsuz iade
        </p>
        <ul className={s.proCTAFeatures}>
          <li>43 madde için rakibine özel çözüm talimatları</li>
          <li>Haftalık otomatik tarama, trend grafiği</li>
          <li>Rakibin seni geçtiğinde e-posta + push uyarı</li>
          <li>Haftalık 1 somut görev (&ldquo;bu hafta şunu düzelt&rdquo;)</li>
          <li>GH7 servis pazarı — &ldquo;bunu benim yerime yapsın&rdquo; erişimi</li>
        </ul>
        <button
          onClick={onFinalize}
          disabled={!canFinalize}
          className={`${s.proCTABtn} ${!canFinalize ? s.proCTABtnDisabled : ""}`}
        >
          {canFinalize ? "Pro'ya Geç ve Takibi Başlat →" : "Önce 1-3 rakip seç"}
        </button>
      </div>
    </section>
  );
}
