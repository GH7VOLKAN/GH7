"use client";

import { useState } from "react";
import type { AuditItemResult } from "@/lib/ai/audit-43";
import {
  KindePage,
  KindeHero,
  Divider,
  SectionHeading,
  SectionLead,
  SourceNote,
  ProCTA,
  KindeFooter,
  useFadeIn,
  KINDE_COLORS,
  PRO_CTA_AUDIT,
} from "@/components/panel/kinde/primitives";

const CATEGORY_LABELS: Record<string, string> = {
  content: "İçerik otoritesi",
  schema: "Yapılandırılmış veri",
  entity: "Entity & kimlik",
  tech: "Teknik erişilebilirlik",
  external: "Dış referanslar",
  ai: "AI platform görünürlüğü",
};
const CATEGORY_ORDER = ["content", "schema", "entity", "tech", "external", "ai"];

export interface AuditDetayV3Props {
  plan: string;
  brandName: string;
  overallScore: number;
  competitorScore: number | null;
  competitorName: string | null;
  auditItems: AuditItemResult[];
  categoryScores: Record<string, number>;
  personalAnalysis: string | null;
  lastUpdate: string | null;
}

export function AuditDetayContentV3(props: AuditDetayV3Props) {
  const isPro = props.plan !== "free";
  const hasCompetitor = props.competitorScore !== null && !!props.competitorName;

  return (
    <KindePage>
      <KindeHero
        title="43 madde · detaylı audit."
        subtitle={`${props.brandName} markanız 6 kategoride ${props.auditItems.length} madde üzerinden test edildi.`}
      />

      <Divider />
      <SectionMetrics {...props} hasCompetitor={hasCompetitor} />
      <Divider />
      <SectionCategories {...props} />
      {props.personalAnalysis && (
        <>
          <Divider />
          <SectionPersonal {...props} />
        </>
      )}
      {!isPro && (
        <>
          <Divider />
          <ProCTA lead={PRO_CTA_AUDIT} />
        </>
      )}
      <Divider />
      <KindeFooter lastUpdate={props.lastUpdate} />
    </KindePage>
  );
}

/* -------------------------------------------------- */
/*  Üst metrik kartları + siyah skor barı               */
/* -------------------------------------------------- */
function SectionMetrics({
  overallScore,
  competitorScore,
  competitorName,
  auditItems,
  hasCompetitor,
}: AuditDetayV3Props & { hasCompetitor: boolean }) {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className="gh7-fade-in">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: hasCompetitor ? "1fr 1fr 1fr" : "1fr 1fr",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <MetricCard label="Genel Skor" value={`${overallScore}/100`} />
        {hasCompetitor && (
          <MetricCard
            label="Rakip Skoru"
            value={`${competitorScore}/100`}
            caption={competitorName ?? undefined}
          />
        )}
        <MetricCard label="Madde Sayısı" value={String(auditItems.length)} />
      </div>

      <ScoreBar label={`Siz · ${overallScore}/100`} score={overallScore} />
      {hasCompetitor && (
        <div style={{ marginTop: 12 }}>
          <ScoreBar
            label={`${competitorName} · ${competitorScore}/100`}
            score={competitorScore ?? 0}
          />
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div
      style={{
        padding: 24,
        border: `1px solid ${KINDE_COLORS.divider}`,
        borderRadius: 12,
      }}
    >
      <div style={{ fontSize: 11, color: KINDE_COLORS.mutedLight, letterSpacing: "0.04em" }}>
        {label.toUpperCase()}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      {caption && (
        <div style={{ marginTop: 4, fontSize: 12, color: KINDE_COLORS.mutedLight }}>
          {caption}
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: KINDE_COLORS.muted,
          marginBottom: 6,
        }}
      >
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div
        style={{
          width: "100%",
          height: 4,
          background: KINDE_COLORS.divider,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: KINDE_COLORS.black,
          }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Kategori accordion — tıklanınca tüm maddeleri       */
/*  tablo formatında (Siz + Rakip1-3) gösterir          */
/* -------------------------------------------------- */
function SectionCategories({ categoryScores, auditItems }: AuditDetayV3Props) {
  const ref = useFadeIn<HTMLDivElement>();
  const [openCat, setOpenCat] = useState<string | null>(
    CATEGORY_ORDER[0] ?? null, // Varsayılan ilk kategori açık
  );

  // Rakip adlarını ilk maddeden derle (hepsi aynı 3 rakip)
  const competitorNames: string[] = [];
  for (const item of auditItems) {
    if (item.competitorValues && item.competitorValues.length > 0) {
      for (const cv of item.competitorValues) {
        if (cv.name && !competitorNames.includes(cv.name)) {
          competitorNames.push(cv.name);
        }
      }
      if (competitorNames.length > 0) break;
    }
  }

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Kategori skorları.</SectionHeading>
      <SectionLead>
        6 kategori, toplam {auditItems.length} madde. Her kategoriye tıklayarak
        madde madde sizin ve {competitorNames.length > 0 ? competitorNames.length : 3}{" "}
        rakibinizin detaylı karşılaştırmasını görün.
      </SectionLead>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {CATEGORY_ORDER.map((key) => {
          const items = auditItems.filter((it) => it.category === key);
          if (items.length === 0) return null;
          const pass = items.filter((it) => it.status === "pass").length;
          const partial = items.filter((it) => it.status === "partial").length;
          const fail = items.filter((it) => it.status === "fail").length;
          const score = Math.round(categoryScores[key] ?? 0);
          const isOpen = openCat === key;
          return (
            <div
              key={key}
              style={{ borderBottom: `1px solid ${KINDE_COLORS.divider}` }}
            >
              <button
                type="button"
                onClick={() => setOpenCat(isOpen ? null : key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "20px 0",
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {CATEGORY_LABELS[key] ?? key}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: KINDE_COLORS.mutedLight,
                    }}
                  >
                    {pass} geçti · {partial} kısmen · {fail} eksik
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: KINDE_COLORS.black,
                    marginLeft: 16,
                  }}
                >
                  {score}/100
                </div>
                <span
                  style={{
                    marginLeft: 12,
                    fontSize: 13,
                    color: KINDE_COLORS.muted,
                  }}
                >
                  {isOpen ? "▲" : "▼"}
                </span>
              </button>
              {isOpen && (
                <div style={{ paddingBottom: 24 }}>
                  <ScoreBar label="Kategori skoru" score={score} />
                  <CategoryComparisonTable
                    items={items}
                    competitorNames={competitorNames}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SourceNote>
        Kaynak: Site HTML · DataForSEO On-Page API · Perplexity Sonar · Claude
        Opus. Rakipler seçilen 3 ana rakiple paralel olarak tarandı.
      </SourceNote>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Kategori karşılaştırma tablosu                      */
/*  Satır = madde, Kolon = Siz + 3 rakip                */
/* -------------------------------------------------- */
function CategoryComparisonTable({
  items,
  competitorNames,
}: {
  items: AuditItemResult[];
  competitorNames: string[];
}) {
  // Rakip kolon sayısı — max 3 ama gerçekte kaç rakip varsa
  const compCount = competitorNames.length;
  const hasCompetitors = compCount > 0;

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Header satırı */}
        {hasCompetitors && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `2fr repeat(${1 + compCount}, 1fr)`,
              gap: 12,
              padding: "10px 0",
              borderBottom: `1px solid ${KINDE_COLORS.divider}`,
              fontSize: 10,
              fontWeight: 700,
              color: KINDE_COLORS.mutedLight,
              letterSpacing: "0.04em",
            }}
          >
            <div>GEREKLILIK</div>
            <div style={{ fontWeight: 800, color: KINDE_COLORS.black }}>
              SİZ
            </div>
            {competitorNames.map((name) => (
              <div
                key={name}
                title={name}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name.toUpperCase()}
              </div>
            ))}
          </div>
        )}

        {/* Her madde bir satır */}
        {items.map((item) => (
          <ComparisonRow
            key={item.key}
            item={item}
            competitorNames={competitorNames}
          />
        ))}
      </div>
    </div>
  );
}

function ComparisonRow({
  item,
  competitorNames,
}: {
  item: AuditItemResult;
  competitorNames: string[];
}) {
  const [showRec, setShowRec] = useState(false);
  const compCount = competitorNames.length;
  const hasCompetitors = compCount > 0;

  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: `1px solid ${KINDE_COLORS.divider}`,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: hasCompetitors
            ? `2fr repeat(${1 + compCount}, 1fr)`
            : "2fr 1fr",
          gap: 12,
          alignItems: "start",
        }}
      >
        {/* Madde adı + status */}
        <button
          type="button"
          onClick={() => item.recommendation && setShowRec((v) => !v)}
          style={{
            background: "transparent",
            border: 0,
            padding: 0,
            textAlign: "left",
            cursor: item.recommendation ? "pointer" : "default",
            fontFamily: "inherit",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>
            {item.label}
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 11,
              color: KINDE_COLORS.mutedLight,
            }}
          >
            {statusLabel(item.status)}
            {item.recommendation && (
              <span style={{ marginLeft: 6, color: KINDE_COLORS.muted }}>
                {showRec ? "▲" : "▼"}
              </span>
            )}
          </div>
        </button>

        {/* Siz kolonu */}
        <ValueCell value={item.value} status={item.status} emphasize />

        {/* Rakip kolonları */}
        {competitorNames.map((name) => {
          const compItem = item.competitorValues?.find((c) => c.name === name);
          return (
            <ValueCell
              key={name}
              value={compItem?.value}
              status={compItem?.status}
            />
          );
        })}
      </div>

      {/* Tıklanınca öneri + kaynak */}
      {showRec && item.recommendation && (
        <div
          style={{
            marginTop: 12,
            padding: 14,
            background: KINDE_COLORS.bgSoft,
            borderRadius: 8,
            fontSize: 12,
            lineHeight: 1.6,
            color: "#333",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: KINDE_COLORS.muted,
              letterSpacing: "0.04em",
              marginBottom: 4,
            }}
          >
            NE YAPILMALI
          </div>
          <div>{item.recommendation}</div>
        </div>
      )}
    </div>
  );
}

function ValueCell({
  value,
  status,
  emphasize = false,
}: {
  value: string | number | undefined;
  status?: "pass" | "partial" | "fail";
  emphasize?: boolean;
}) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: emphasize ? 700 : 500,
        color: emphasize ? "#000" : "#333",
      }}
    >
      <div
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={value !== undefined ? String(value) : undefined}
      >
        {value !== undefined && value !== null ? String(value) : "—"}
      </div>
      {status && (
        <div
          style={{
            marginTop: 2,
            fontSize: 10,
            fontWeight: 600,
            color: KINDE_COLORS.mutedLight,
          }}
        >
          {statusLabel(status)}
        </div>
      )}
    </div>
  );
}

function statusLabel(status: "pass" | "partial" | "fail"): string {
  if (status === "pass") return "geçti";
  if (status === "partial") return "kısmen";
  return "eksik";
}


/* -------------------------------------------------- */
/*  Kişisel analiz (Opus)                               */
/* -------------------------------------------------- */
function SectionPersonal({ personalAnalysis, brandName }: AuditDetayV3Props) {
  const ref = useFadeIn<HTMLDivElement>();
  if (!personalAnalysis) return null;
  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Sizin için ne diyoruz.</SectionHeading>
      <SectionLead>
        Claude Opus, {brandName} markası için kişisel bir analiz yazdı.
      </SectionLead>
      <div
        style={{
          fontSize: 17,
          lineHeight: 1.8,
          color: "#222",
          padding: 24,
          background: KINDE_COLORS.bgSoft,
          borderRadius: 12,
          whiteSpace: "pre-wrap",
        }}
      >
        {personalAnalysis}
      </div>
    </div>
  );
}
