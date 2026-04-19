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
  StatusPill,
  ProGate,
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

const FREE_ITEM_LIMIT = 10;

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
      <Divider />
      <SectionDetailList {...props} isPro={isPro} />
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
/*  Kategori özetleri (accordion)                       */
/* -------------------------------------------------- */
function SectionCategories({ categoryScores, auditItems }: AuditDetayV3Props) {
  const ref = useFadeIn<HTMLDivElement>();
  const [openCat, setOpenCat] = useState<string | null>(null);

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Kategori skorları.</SectionHeading>
      <SectionLead>
        6 kategori, toplam {auditItems.length} madde. Her kategori için pass ·
        kısmi · eksik dağılımı.
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
              </button>
              {isOpen && (
                <div style={{ paddingBottom: 12 }}>
                  <ScoreBar label="Kategori skoru" score={score} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Detaylı 43 madde listesi                            */
/* -------------------------------------------------- */
function SectionDetailList({
  auditItems,
  isPro,
}: AuditDetayV3Props & { isPro: boolean }) {
  const ref = useFadeIn<HTMLDivElement>();

  // Global sayaç — ilk 10 açık, sonrası locked
  let counter = 0;

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Her madde tek tek.</SectionHeading>
      <SectionLead>
        İlk {FREE_ITEM_LIMIT} madde ücretsiz plan'da açık. Madde başlığına
        tıklayarak detay ve öneriyi görün.
      </SectionLead>

      {CATEGORY_ORDER.map((catKey) => {
        const items = auditItems.filter((it) => it.category === catKey);
        if (items.length === 0) return null;
        return (
          <div key={catKey} style={{ marginBottom: 40 }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 8,
                letterSpacing: "-0.01em",
              }}
            >
              {CATEGORY_LABELS[catKey] ?? catKey}
            </h3>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {items.map((item) => {
                const isLocked = !isPro && counter >= FREE_ITEM_LIMIT;
                counter += 1;
                return (
                  <AuditItemRow key={item.key} item={item} isLocked={isLocked} />
                );
              })}
            </div>
          </div>
        );
      })}

      <SourceNote>
        Kaynak: Site HTML · DataForSEO On-Page API · Perplexity Sonar · Claude Opus
      </SourceNote>
    </div>
  );
}

function AuditItemRow({
  item,
  isLocked,
}: {
  item: AuditItemResult;
  isLocked: boolean;
}) {
  const [open, setOpen] = useState(false);
  const body = (
    <div
      style={{
        padding: "16px 0",
        borderBottom: `1px solid ${KINDE_COLORS.divider}`,
      }}
    >
      <button
        type="button"
        onClick={() => !isLocked && setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          width: "100%",
          background: "transparent",
          border: 0,
          padding: 0,
          cursor: isLocked ? "default" : "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <div
          style={{
            minWidth: 70,
            flexShrink: 0,
            paddingTop: 2,
          }}
        >
          <StatusPill status={isLocked ? "locked" : item.status} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
          <CompetitorComparison item={item} />
        </div>
      </button>
      {open && !isLocked && (
        <div
          style={{
            marginTop: 12,
            padding: 16,
            background: KINDE_COLORS.bgSoft,
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.6,
            color: "#333",
          }}
        >
          {item.recommendation && (
            <>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: KINDE_COLORS.muted,
                  letterSpacing: "0.04em",
                  marginBottom: 4,
                }}
              >
                NE YAPILMALI
              </div>
              <div style={{ marginBottom: 12 }}>{item.recommendation}</div>
            </>
          )}
          <div
            style={{
              fontSize: 11,
              color: KINDE_COLORS.mutedLight,
            }}
          >
            Kaynak: DataForSEO On-Page API · audit-43 motoru
          </div>
        </div>
      )}
    </div>
  );
  if (isLocked) return <ProGate>{body}</ProGate>;
  return body;
}

/* -------------------------------------------------- */
/*  Rakip karşılaştırma — Siz + 3 Rakip grid           */
/* -------------------------------------------------- */
function CompetitorComparison({ item }: { item: AuditItemResult }) {
  const hasNewFormat =
    Array.isArray(item.competitorValues) && item.competitorValues.length > 0;
  const hasAnyValue =
    item.value !== undefined ||
    item.competitorValue !== undefined ||
    hasNewFormat;

  if (!hasAnyValue) return null;

  // Yeni format: siz + 3 rakip grid
  if (hasNewFormat) {
    const cells: Array<{
      label: string;
      value: string | number | undefined;
      status?: "pass" | "partial" | "fail";
      isSelf: boolean;
    }> = [
      {
        label: "Siz",
        value: item.value,
        status: item.status,
        isSelf: true,
      },
      ...(item.competitorValues ?? []).map((c) => ({
        label: c.name,
        value: c.value,
        status: c.status,
        isSelf: false,
      })),
    ];

    return (
      <div
        style={{
          marginTop: 8,
          display: "grid",
          gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))`,
          gap: 8,
          fontSize: 12,
        }}
      >
        {cells.map((c, i) => (
          <div
            key={i}
            style={{
              padding: "8px 10px",
              background: c.isSelf ? "#F7F7F7" : "#FFFFFF",
              border: `1px solid ${KINDE_COLORS.divider}`,
              borderRadius: 6,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: KINDE_COLORS.mutedLight,
                letterSpacing: "0.04em",
                marginBottom: 2,
                fontWeight: c.isSelf ? 700 : 500,
                textTransform: c.isSelf ? "uppercase" : "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={c.label}
            >
              {c.label}
            </div>
            <div style={{ fontWeight: 600, color: KINDE_COLORS.black }}>
              {c.value !== undefined && c.value !== null
                ? String(c.value)
                : "—"}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Eski format (backward compat): tek satır "Siz: X · Rakip: Y"
  return (
    <div
      style={{
        marginTop: 4,
        fontSize: 12,
        color: KINDE_COLORS.mutedLight,
      }}
    >
      {item.value !== undefined && <>Siz: {String(item.value)}</>}
      {item.competitorValue !== undefined && (
        <> · Rakip: {String(item.competitorValue)}</>
      )}
    </div>
  );
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
