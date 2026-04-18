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
  KindeFooter,
  useFadeIn,
  KINDE_COLORS,
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

const FREE_ITEM_LIMIT = 10; // İlk 10 madde açık, sonrası blur

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

  return (
    <KindePage>
      <KindeHero
        score={props.overallScore}
        title="43 madde · detaylı audit."
        subtitle={`${props.brandName} markanız 6 kategoride ${props.auditItems.length} madde üzerinden test edildi.${props.competitorName ? ` Rakibiniz ${props.competitorName} ile karşılaştırıldı.` : ""}`}
        tertiary={
          props.competitorScore !== null && props.competitorName
            ? `Rakip skoru: ${props.competitorScore}/100 · ${props.competitorName}`
            : undefined
        }
      />

      <Divider />
      <SectionOverview {...props} />
      <Divider />
      <SectionCategories {...props} isPro={isPro} />
      <Divider />
      <SectionPersonal {...props} />
      <Divider />
      <KindeFooter lastUpdate={props.lastUpdate} />
    </KindePage>
  );
}

/* -------------------------------------------------- */
/*  Kategori skorları                                  */
/* -------------------------------------------------- */
function SectionOverview({ categoryScores, auditItems }: AuditDetayV3Props) {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Kategori skorları.</SectionHeading>
      <SectionLead>
        6 kategori, toplam 43 madde. Her kategori için pass/partial/fail dağılımı.
      </SectionLead>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CATEGORY_ORDER.map((key) => {
          const items = auditItems.filter((it) => it.category === key);
          const pass = items.filter((it) => it.status === "pass").length;
          const partial = items.filter((it) => it.status === "partial").length;
          const fail = items.filter((it) => it.status === "fail").length;
          const score = Math.round(categoryScores[key] ?? 0);
          if (items.length === 0) return null;
          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 0",
                borderBottom: `1px solid ${KINDE_COLORS.divider}`,
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
                  {pass} tamam · {partial} kısmi · {fail} eksik
                </div>
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: score >= 70 ? "#2E7D32" : score >= 40 ? "#B57F00" : "#C62828",
                }}
              >
                {score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Detaylı 43 madde                                   */
/* -------------------------------------------------- */
function SectionCategories({
  auditItems,
  isPro,
}: AuditDetayV3Props & { isPro: boolean }) {
  const ref = useFadeIn<HTMLDivElement>();

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Her madde tek tek.</SectionHeading>
      <SectionLead>
        İlk {FREE_ITEM_LIMIT} madde ücretsiz plan'da açık. Gerisi Pro ile.
      </SectionLead>

      {CATEGORY_ORDER.map((catKey) => {
        const items = auditItems.filter((it) => it.category === catKey);
        if (items.length === 0) return null;
        return (
          <CategoryBlock
            key={catKey}
            title={CATEGORY_LABELS[catKey] ?? catKey}
            items={items}
            isPro={isPro}
            globalOffset={auditItems.findIndex(
              (x) => x.category === catKey && x.key === items[0].key,
            )}
          />
        );
      })}

      <SourceNote>
        Kaynak: Site HTML analizi · DataForSEO · Perplexity Sonar · Claude Opus
      </SourceNote>
    </div>
  );
}

function CategoryBlock({
  title,
  items,
  isPro,
  globalOffset,
}: {
  title: string;
  items: AuditItemResult[];
  isPro: boolean;
  globalOffset: number;
}) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h3
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 16,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {items.map((item, i) => {
          const globalIdx = globalOffset + i;
          const isLocked = !isPro && globalIdx >= FREE_ITEM_LIMIT;
          return <AuditItemRow key={item.key} item={item} isLocked={isLocked} />;
        })}
      </div>
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
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "transparent",
          border: 0,
          padding: 0,
          cursor: isLocked ? "default" : "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <div style={{ flex: 1, paddingRight: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
          {item.value !== undefined && (
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: KINDE_COLORS.mutedLight,
              }}
            >
              Sizde: {String(item.value)}
              {item.competitorValue !== undefined &&
                ` · Rakip: ${String(item.competitorValue)}`}
            </div>
          )}
        </div>
        <StatusPill status={isLocked ? "locked" : item.status} />
      </button>
      {open && !isLocked && item.recommendation && (
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
          <strong style={{ fontSize: 12, color: "#666" }}>ÖNERİ</strong>
          <div style={{ marginTop: 4 }}>{item.recommendation}</div>
        </div>
      )}
    </div>
  );
  if (isLocked) return <ProGate>{body}</ProGate>;
  return body;
}

/* -------------------------------------------------- */
/*  Kişisel analiz (Opus metni)                        */
/* -------------------------------------------------- */
function SectionPersonal({ personalAnalysis, brandName }: AuditDetayV3Props) {
  const ref = useFadeIn<HTMLDivElement>();
  if (!personalAnalysis) return null;
  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Sizin için ne diyoruz.</SectionHeading>
      <SectionLead>
        Claude Opus modeli, {brandName} markası için kişisel bir analiz yazdı.
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
