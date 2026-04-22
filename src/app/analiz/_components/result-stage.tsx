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
  const totalPossible = result.queries.length * 5;
  const mentionCountByQuery = new Map(
    result.queries.map((q) => [
      q.id,
      q.answers.filter((a) => a.mentionedYou).length,
    ]),
  );

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
    <div className={s.resultWrapper}>
      {/* ─── GH7 INSIGHT banner ─── */}
      <div className={s.insightBanner}>
        <div className={s.insightBannerBrand}>
          <span className={s.insightBannerLogo}>GH7</span>
          <span className={s.insightBannerProduct}>INSIGHT</span>
        </div>
        <div className={s.insightBannerSub}>Canlı AI görünürlük analizi</div>
      </div>

      {/* ─── Firm profile hero ─── */}
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

      {/* ─── Score hero + tabs ─── */}
      <section className={s.scoreHero}>
        <div className={s.scoreBig}>
          <span className={s.scoreNum}>{result.userMentions.totalMentions}</span>
          <span className={s.scoreDiv}>/</span>
          <span className={s.scoreTotal}>{totalPossible}</span>
        </div>
        <p className={s.scoreSub}>
          5 AI × {result.queries.length} sorguda {result.userMentions.totalMentions} kez anıldın.
          {result.healingAttempted && " İlk denemede bulunamadı, farklı açıdan yeniden sorduk."}
        </p>

        <div className={s.tabs} role="tablist">
          {(["score", "queries", "answers"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`${s.tab} ${tab === t ? s.tabActive : ""}`}
            >
              {t === "score" ? "Skor" : t === "queries" ? "Sorgular" : "Cevaplar"}
            </button>
          ))}
        </div>
      </section>

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

      {/* ─── Opus Özet Analizi ─── */}
      {result.commentary && result.commentary.length > 100 && (
        <section className={s.commentarySection}>
          <div className={s.commentaryBrand}>
            <span className={s.commentaryBrandLogo}>GH7</span>
            <span className={s.commentaryBrandProduct}>ADVISOR</span>
          </div>
          <h2 className={s.commentaryHeadline}>Durum raporu.</h2>
          <div className={s.commentaryBody}>
            <MarkdownView text={result.commentary} />
          </div>
        </section>
      )}

      {/* ─── Rakip seç ─── */}
      <section className={s.competitorSection}>
        <div className={s.screenLabel}>RAKİP SEÇ</div>
        <h2 className={s.h2}>3 rakibini seç.</h2>
        <p className={s.sub}>
          AI cevaplarında en çok geçen firmalar. Frekans sırasına göre listelendi.
          Sen seçtiklerin üzerinden haftalık takip yapılacak.
        </p>

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
            .filter((sc) => sc.isNew)
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

      {/* ─── Pro Gate: fear-stats + 43 madde full + CTA ─── */}
      <ProGate
        firmName={profile.name}
        mentionScore={result.userMentions.totalMentions}
        totalPossible={totalPossible}
        canFinalize={canFinalize}
        onFinalize={() => onFinalize(selected)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Score Tab
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
                    {q.generation === 2 && <span className={s.gen2Badge}>2.GEÇİŞ</span>}
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
        <span><span className={s.legendDotFilled}>●</span> AI seni andı</span>
        <span><span className={s.legendDotEmpty}>○</span> Andı ama sen yoktun</span>
        <span><span className={s.legendDotMissing}>—</span> Cevap yok</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Queries Tab
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
                {q.generation === 2 && <span className={s.gen2Badge}>2.GEÇİŞ</span>}
                <div className={s.queryMetaProviders}>
                  {q.answers.filter((a) => a.mentionedYou).map((a) => (
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
// Answers Tab
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
// Pro Gate — full 43 madde görünür + dinamik CTA + korku mesajı
// ═══════════════════════════════════════════════════════════

const AUDIT_43 = [
  { title: "Schema.org structured data düzeni", hint: "AI crawler için yapılandırılmış veri" },
  { title: "FAQ sayfası implementasyonu", hint: "Sorular AI tarafından okunur hale getirilir" },
  { title: "About / Hakkımızda genişletilmiş anlatım", hint: "Otorite sinyali, kuruluş hikayesi" },
  { title: "E-E-A-T otorite sinyalleri (Expert, Experience, Authoritativeness, Trust)", hint: "Google'ın AI'ya verdiği güvenilirlik sinyali" },
  { title: "Ürün/hizmet sayfalarında yapılandırılmış Q&A", hint: "Her ürün için 'soru-cevap' bloğu" },
  { title: "Müşteri referansları ve case study sayfaları", hint: "AI 'kim için iş yaptınız' sorusuna cevap verebilir" },
  { title: "Medya/basın mentions koleksiyonu", hint: "3. taraf onayı, link profili" },
  { title: "Backlink profili AI crawler optimizasyonu", hint: "Hangi siteler sana link veriyor, AI'lar takip ediyor" },
  { title: "Site hiyerarşisi AI için okunabilirlik", hint: "URL yapısı, sitemap, internal linking" },
  { title: "Meta description AI-first yazım", hint: "İlk 150 karakter AI snippet olarak gider" },
  { title: "Alt text AI indexing optimizasyonu", hint: "Görselleri AI'a açıklayan metin" },
  { title: "URL slug yapısı düzenleme", hint: "Anlamlı, kısa, anahtar kelime içeren URL'ler" },
  { title: "Internal link AI crawler flow", hint: "Her sayfa 2-3 önemli sayfaya link verir" },
  { title: "Author / uzman bio sayfaları", hint: "İçerik kim yazdı — AI bunu kişi otoritesiyle eşler" },
  { title: "Contact page trust signal", hint: "Telefon, adres, vergi no — legitimacy için" },
  { title: "Pricing page transparency", hint: "Fiyat görünür olursa AI 'bu firma' der" },
  { title: "Process / methodology anlatım", hint: "İşi nasıl yapıyorsun — adım adım" },
  { title: "Sektör sertifikaları display", hint: "TSE, ISO, CE vs. — AI bunları 'güvenilir' olarak işaretler" },
  { title: "Case study structured markup", hint: "Her proje için schema.org Project markup" },
  { title: "Review & testimonial schema", hint: "AI yorumları 'ortalama puan' olarak okur" },
  { title: "Video content structured data", hint: "YouTube, Vimeo videoları schema ile eşle" },
  { title: "Image captions AI context", hint: "Her önemli görselin altına açıklama" },
  { title: "Table data structured format", hint: "Tablo verileri — fiyat listesi, ürün özellikleri" },
  { title: "List markup doğru kullanım", hint: "<ul>, <ol> AI tarafından 'liste' olarak okunur" },
  { title: "Heading hierarchy AI okunabilir", hint: "H1 → H2 → H3 mantıksal sıra" },
  { title: "Content freshness signals", hint: "Son güncelleme tarihi, 'bu yıl' ifadeleri" },
  { title: "Topical authority cluster", hint: "Bir konuda 10+ makale yazarak 'uzman' sinyali" },
  { title: "Expert author attribution", hint: "Her makale kimin yazdı — doğrulanabilir" },
  { title: "Published / updated date visibility", hint: "AI 'güncel mi' sorusuna bakar" },
  { title: "Sektör terimleri sözlüğü sayfası", hint: "AI terminoloji için kaynak olarak kullanır" },
  { title: "Karşılaştırma sayfaları (versus)", hint: "'X vs Y' sayfaları AI sorgularında çıkar" },
  { title: "Alternative / alternatif sayfalar", hint: "'X alternatifi' arayan müşteriyi yakala" },
  { title: "How-to içerik yapısı", hint: "'Nasıl yapılır' soruları AI'ya yapısal olarak sunulur" },
  { title: "Definition box optimizasyonu", hint: "'X nedir' sorusuna tek paragraf net cevap" },
  { title: "Key facts featured prominently", hint: "Rakam, istatistik, yıl — AI çıkarır" },
  { title: "Data citations (research, stats)", hint: "Araştırma, çalışma alıntıları — 3. taraf onay" },
  { title: "External authority references", hint: "Gazete, dergi, kurum linkleri" },
  { title: "Social proof visibility", hint: "Sosyal medya takipçi, müşteri sayısı — görünür" },
  { title: "Press mention aggregation", hint: "Basında yer aldın mı, liste et" },
  { title: "Award / recognition display", hint: "Ödüller, sertifikalar — görsel ve metin olarak" },
  { title: "Team expertise signals", hint: "Ekip üyeleri, uzmanlıkları" },
  { title: "Industry association memberships", hint: "Hangi derneklere üyesin — güvenilirlik" },
  { title: "Local SEO + GEO lokasyon eşleşmesi", hint: "Coğrafi sinyallerin AI'a doğru gitmesi" },
];

function ProGate({
  firmName,
  mentionScore,
  totalPossible,
  canFinalize,
  onFinalize,
}: {
  firmName: string;
  mentionScore: number;
  totalPossible: number;
  canFinalize: boolean;
  onFinalize: () => void;
}) {
  const scoreRatio = totalPossible > 0 ? mentionScore / totalPossible : 0;
  const missedCount = totalPossible - mentionScore;

  let toneCategory: "strong" | "medium" | "weak";
  if (scoreRatio >= 0.6) toneCategory = "strong";
  else if (scoreRatio >= 0.25) toneCategory = "medium";
  else toneCategory = "weak";

  const ctaHeadline =
    toneCategory === "strong"
      ? "Zirvedesin. Rakibin hamlesini ilk fark eden sen ol."
      : toneCategory === "medium"
        ? "Ortadasın. 43 madde seni zirveye çıkartır."
        : "Görünmezsin. 43 madde bu durumu değiştirir.";

  const ctaSub =
    toneCategory === "strong"
      ? `${firmName} şu anki konumu güçlü. Ama AI'da görünürlük bir kez kazanılan değil, her hafta savunulan bir şey. Pro ile rakibinin hamlesini ilk fark eden sen olursun.`
      : toneCategory === "medium"
        ? `${firmName} ${mentionScore}/${totalPossible} anıldı. Potansiyel var ama tamamlanmamış. 43 madde sistemli bir şekilde uygulandığında 3-6 hafta içinde skorunun çıkma hedefi gerçekçi.`
        : `${missedCount} AI cevabında görünmedin. Bu tesadüf değil — yapısal. Rakiplerin var, seni yerine onlar öneriliyor. 43 madde bu durumu yapısal olarak çözer.`;

  return (
    <section className={s.proGate}>
      {/* ─── Korku / GEO bölümü ─── */}
      <div className={s.proFearSection}>
        <div className={s.screenLabel}>NEDEN ŞİMDİ</div>
        <h2 className={s.proFearHeadline}>GEO is the new SEO.</h2>
        <p className={s.proFearSub}>
          Artık sadece Google&apos;da çıkmak yeterli değil. Her gün daha fazla kullanıcı
          arama motorunu bırakıp AI asistanına soruyor. ChatGPT&apos;ye, Claude&apos;a, Gemini&apos;ye.
          <br /><br />
          Google&apos;da ilk sırada olsan bile, AI&apos;lar sana hiç değinmeden müşterinin sorusuna
          başka bir firmayı öneriyorsa — müşteri seni hiç görmez.
        </p>

        <div className={s.proStats}>
          <div className={s.proStat}>
            <div className={s.proStatNum}>%25</div>
            <div className={s.proStatLabel}>
              Müşterilerin dörtte biri artık Google&apos;a değil, yapay zekaya soru soruyor. Bu oran her ay artıyor.
            </div>
            <div className={s.proStatSource}>Gartner, 2025</div>
          </div>
          <div className={s.proStat}>
            <div className={s.proStatNum}>%40</div>
            <div className={s.proStatLabel}>
              AI sistemine uygun hazırlanmış içerik, olmayana göre iki kat daha fazla öneriliyor. Senin yok.
            </div>
            <div className={s.proStatSource}>Princeton / ACM KDD, 2024</div>
          </div>
          <div className={s.proStat}>
            <div className={s.proStatNum}>%60</div>
            <div className={s.proStatLabel}>
              Google&apos;da ilk sıraya çıksan bile müşteri sayfana tıklamıyor — AI zaten cevap vermiş oluyor.
            </div>
            <div className={s.proStatSource}>Bain &amp; Company, 2025</div>
          </div>
        </div>
      </div>

      {/* ─── 43 madde FULL GÖRÜNÜR ─── */}
      <div className={s.auditWrap}>
        <div className={s.auditHeaderSection}>
          <div className={s.auditBrand}>
            <span className={s.auditBrandLogo}>GH7</span>
            <span className={s.auditBrandProduct}>AUDIT</span>
          </div>
          <h2 className={s.auditSectionHeadline}>
            43 madde. Her biri {firmName} için hazır.
          </h2>
          <p className={s.auditSectionSub}>
            Başlıkların hepsi burada — neyin yapılacağını şimdi görüyorsun.
            Her maddenin {firmName} için özel uygulama talimatı ve &ldquo;hangi rakip
            bunu yapıyor&rdquo; karşılaştırması Pro&apos;da açılır.
          </p>
        </div>

        <ol className={s.auditList}>
          {AUDIT_43.map((item, i) => (
            <li key={i} className={s.auditItem}>
              <span className={s.auditNum}>{String(i + 1).padStart(2, "0")}</span>
              <div className={s.auditBody}>
                <div className={s.auditTitle}>{item.title}</div>
                <div className={s.auditHint}>{item.hint}</div>
              </div>
              <span className={s.auditLock}>
                <span className={s.auditLockIcon}>◐</span>
                <span className={s.auditLockLabel}>GH7 Audit · Pro</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* ─── Main CTA ─── */}
      <div className={s.proCTA}>
        {/* Dinamik hero */}
        <div className={s.proCTAHero}>
          <div className={s.proCTALabel}>ŞİMDİ NE OLACAK</div>
          <h2 className={s.proCTAHeadline}>{ctaHeadline}</h2>
          <p className={s.proCTASubMsg}>{ctaSub}</p>
        </div>

        {/* Fiyat */}
        <div className={s.proCTAPriceBlock}>
          <div className={s.proCTAProductLabel}>GH7 PRO</div>
          <div className={s.proCTAPrice}>
            <span className={s.proCTAAmount}>₺699</span>
            <span className={s.proCTAPeriod}>/ay</span>
          </div>
          <div className={s.proCTAPriceSub}>₺8,388 yıllık tek ödeme</div>

          <div className={s.proCTAQuickFacts}>
            <div className={s.proCTAFact}>1 site · Sınırsız analiz</div>
            <div className={s.proCTAFact}>5 AI platform · 3 rakip karşılaştırması</div>
            <div className={s.proCTAFact}>30 gün koşulsuz iade</div>
          </div>
        </div>

        {/* 6 marka */}
        <div className={s.proCTAProducts}>
          <div className={s.proCTAProductsHeader}>
            <div className={s.proCTAProductsLabel}>PRO KAPSAMI</div>
            <p className={s.proCTAProductsHero}>
              Altı araç, tek kontrol paneli.<br />
              AI çağında görünür kalmanın sistemi.
            </p>
          </div>

          <div className={s.proCTAProductList}>
            <div className={s.proCTAProduct}>
              <div className={s.proCTAProductName}>GH7 INSIGHT</div>
              <div className={s.proCTAProductSub}>Canlı AI görünürlük analizi</div>
              <p className={s.proCTAProductDesc}>
                5 platformdaki skorun, rakiplerin ve anılma detayların. İstediğin zaman yeniden çalıştır.
              </p>
            </div>

            <div className={s.proCTAProduct}>
              <div className={s.proCTAProductName}>GH7 AUDIT</div>
              <div className={s.proCTAProductSub}>43 maddelik optimizasyon planı</div>
              <p className={s.proCTAProductDesc}>
                Her madde {firmName}&apos;in sitesine, içeriğine ve yapısına özel hazırlanmış uygulanabilir talimatlar.
              </p>
            </div>

            <div className={s.proCTAProduct}>
              <div className={s.proCTAProductName}>GH7 TRACKER</div>
              <div className={s.proCTAProductSub}>Sürekli görünürlük takibi</div>
              <p className={s.proCTAProductDesc}>
                Site yayındayken Tracker arka planda dinliyor. Anlamlı değişimde anında haber, her Pazartesi haftalık özet raporu e-postanda.
              </p>
            </div>

            <div className={s.proCTAProduct}>
              <div className={s.proCTAProductName}>GH7 RADAR</div>
              <div className={s.proCTAProductSub}>Rakip izleme ve bildirim sistemi</div>
              <p className={s.proCTAProductDesc}>
                Seçtiğin 3 rakibin skoru sürekli izlenir. Seni yakaladıklarında veya geçtiklerinde anında e-posta ve uygulama bildirimi.
              </p>
            </div>

            <div className={s.proCTAProduct}>
              <div className={s.proCTAProductName}>GH7 ADVISOR</div>
              <div className={s.proCTAProductSub}>Haftalık trendler ve geliştirme uyarıları</div>
              <p className={s.proCTAProductDesc}>
                AI arama davranışı her hafta değişiyor. Advisor sana sektöründeki fırsatları ve öncelikli adımları iletir.
              </p>
            </div>

            <div className={s.proCTAProduct}>
              <div className={s.proCTAProductName}>GH7 STUDIO</div>
              <div className={s.proCTAProductSub}>Ayarlar ve kontrol paneli</div>
              <p className={s.proCTAProductDesc}>
                Ürün, hizmet, rakip, il listesini düzenle. Sorgularını yeniden üret, stratejini güncelle.
              </p>
            </div>
          </div>
        </div>

        {/* CTA buton */}
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
