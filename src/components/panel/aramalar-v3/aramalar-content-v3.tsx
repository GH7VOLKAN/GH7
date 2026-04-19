"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { PromptItemData } from "@/lib/dal/prompts";
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
  BTN_PRIMARY,
  PRO_CTA_ARAMALAR,
  PRO_PRICE_LABEL,
} from "@/components/panel/kinde/primitives";
import { ScanNowButton } from "@/components/panel/scan-now-button";

const PLATFORM_ORDER = ["chatgpt", "claude", "gemini", "perplexity", "google_aio"];
const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "AI Overview",
};
const PLATFORM_MODELS: Record<string, string> = {
  chatgpt: "gpt-4o-search",
  claude: "claude-3.5-sonnet",
  gemini: "gemini-1.5-flash",
  perplexity: "sonar",
  google_aio: "SerpAPI",
};

const FREE_OPEN_LIMIT = 3;

type FilterType = "all" | "mentioned" | "not_mentioned";

export interface AramalarV3Props {
  plan: string;
  brandName: string;
  competitorNames: string[];
  promptItems: PromptItemData[];
  lastUpdate: string | null;
}

export function AramalarContentV3(props: AramalarV3Props) {
  const isPro = props.plan !== "free";

  const { mentionedYou, mentionedCompetitor } = useMemo(() => {
    let you = 0;
    let comp = 0;
    for (const p of props.promptItems) {
      const anyMention = Object.values(p.modelResults).some((m) => m);
      if (anyMention) you++;
      const hasCompText = p.platformResults.some((r) =>
        competitorInText(r.fullResponse ?? "", props.competitorNames),
      );
      if (hasCompText) comp++;
    }
    return { mentionedYou: you, mentionedCompetitor: comp };
  }, [props.promptItems, props.competitorNames]);

  // Hiç sonuç yoksa scan tetikleyici banner göster
  const hasAnyResult = props.promptItems.some(
    (p) => p.platformResults.length > 0,
  );

  return (
    <KindePage>
      <KindeHero
        title="Senin Yerine Kim?"
        subtitle="AI platformlarına gönderilen gerçek sorgular ve tam yanıtlar."
      />

      <Divider />

      {!hasAnyResult && props.promptItems.length > 0 && (
        <ScanNowButton variant="banner" label="Şimdi Tara" />
      )}

      <SectionMetrics
        totalQueries={props.promptItems.length}
        mentionedYou={mentionedYou}
        mentionedCompetitor={mentionedCompetitor}
      />
      <Divider />
      <SectionQueries {...props} isPro={isPro} />

      {hasAnyResult && (
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <ScanNowButton variant="primary" label="Yeniden Tara" />
        </div>
      )}

      {!isPro && (
        <>
          <Divider />
          <ProCTA lead={PRO_CTA_ARAMALAR} />
        </>
      )}
      <Divider />
      <KindeFooter lastUpdate={props.lastUpdate} />
    </KindePage>
  );
}

/* -------------------------------------------------- */
/*  Üst metrikler                                        */
/* -------------------------------------------------- */
function SectionMetrics({
  totalQueries,
  mentionedYou,
  mentionedCompetitor,
}: {
  totalQueries: number;
  mentionedYou: number;
  mentionedCompetitor: number;
}) {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="gh7-fade-in"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 16,
      }}
    >
      <MetricCard label="Toplam Sorgu" value={String(totalQueries)} />
      <MetricCard label="Bahsedildiniz" value={`${mentionedYou} sorgu`} />
      <MetricCard label="Rakip Bahsedildi" value={`${mentionedCompetitor} sorgu`} />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 20,
        border: `1px solid ${KINDE_COLORS.divider}`,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: KINDE_COLORS.mutedLight,
          letterSpacing: "0.04em",
        }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Sorgu listesi                                       */
/* -------------------------------------------------- */
function SectionQueries({
  promptItems,
  brandName,
  competitorNames,
  isPro,
}: AramalarV3Props & { isPro: boolean }) {
  const ref = useFadeIn<HTMLDivElement>();
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return promptItems.filter((p) => {
      const any = Object.values(p.modelResults).some((m) => m);
      if (filter === "mentioned" && !any) return false;
      if (filter === "not_mentioned" && any) return false;
      if (search && !p.text.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [promptItems, filter, search]);

  if (promptItems.length === 0) {
    return (
      <div ref={ref} className="gh7-fade-in">
        <SectionHeading>Henüz sorgu yok.</SectionHeading>
        <SectionLead>
          Analiziniz yeni tamamlandıysa taranan sorgular buraya birkaç dakika
          içinde düşer. Sayfayı yenileyin.
        </SectionLead>
      </div>
    );
  }

  const anyMentionedCount = promptItems.filter((p) =>
    Object.values(p.modelResults).some((m) => m),
  ).length;
  const notMentionedCount = promptItems.length - anyMentionedCount;

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Sorgular ve tam yanıtlar.</SectionHeading>
      <SectionLead>
        Her sorguya 5 AI platformu cevap verdi. Sizin ve rakibinizin adı
        yanıtlarda <strong>kalın</strong> gösterilir.
      </SectionLead>

      {/* Filtre ve arama */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {(
          [
            ["all", `Tümü (${promptItems.length})`],
            ["mentioned", `Bahsedilen (${anyMentionedCount})`],
            ["not_mentioned", `Bahsedilmeyen (${notMentionedCount})`],
          ] as Array<[FilterType, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 999,
              border: `1px solid ${KINDE_COLORS.divider}`,
              background: filter === key ? KINDE_COLORS.black : KINDE_COLORS.white,
              color: filter === key ? KINDE_COLORS.white : KINDE_COLORS.black,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        type="search"
        placeholder="Sorgu ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 16px",
          fontSize: 14,
          border: `1px solid ${KINDE_COLORS.divider}`,
          borderRadius: 8,
          marginBottom: 24,
          fontFamily: "inherit",
          outline: "none",
          color: KINDE_COLORS.black,
        }}
      />

      {filtered.length === 0 && (
        <p
          style={{
            fontSize: 14,
            color: KINDE_COLORS.mutedLight,
            fontStyle: "italic",
          }}
        >
          Bu filtreye uyan sorgu yok.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((item, idx) => {
          const isLocked = !isPro && idx >= FREE_OPEN_LIMIT;
          const isOpen = openId === item.id && !isLocked;
          return (
            <QueryCard
              key={item.id}
              item={item}
              isOpen={isOpen}
              onToggle={() => !isLocked && setOpenId(isOpen ? null : item.id)}
              isLocked={isLocked}
              brandName={brandName}
              competitorNames={competitorNames}
            />
          );
        })}
      </div>

      <SourceNote>
        OpenAI gpt-4o-search · Anthropic claude-3.5-sonnet · Google
        gemini-1.5-flash · Perplexity sonar · Google AI Overview (SerpAPI)
      </SourceNote>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Query Card                                          */
/* -------------------------------------------------- */
function QueryCard({
  item,
  isOpen,
  onToggle,
  isLocked,
  brandName,
  competitorNames,
}: {
  item: PromptItemData;
  isOpen: boolean;
  onToggle: () => void;
  isLocked: boolean;
  brandName: string;
  competitorNames: string[];
}) {
  return (
    <div
      style={{
        border: `1px solid ${KINDE_COLORS.divider}`,
        borderRadius: 12,
        overflow: "hidden",
        background: KINDE_COLORS.white,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          padding: 20,
          background: "transparent",
          border: 0,
          textAlign: "left",
          cursor: isLocked ? "default" : "pointer",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        >
          {item.text}
        </div>

        {/* Platform durumları — metin, renksiz */}
        <div
          style={{
            fontSize: 12,
            color: KINDE_COLORS.muted,
            lineHeight: 1.7,
          }}
        >
          {PLATFORM_ORDER.map((plat, i) => {
            const result = item.platformResults.find((r) => r.platform === plat);
            const label = platformStatusLabel(result);
            return (
              <span key={plat}>
                <strong style={{ color: KINDE_COLORS.black }}>
                  {PLATFORM_LABELS[plat] ?? plat}
                </strong>
                : {label}
                {i < PLATFORM_ORDER.length - 1 && " · "}
              </span>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            color: KINDE_COLORS.mutedLight,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>{formatRelative(item.createdAt)}</span>
          {!isLocked && (
            <span style={{ color: KINDE_COLORS.muted }}>
              {isOpen ? "▲" : "▼"}
            </span>
          )}
          {isLocked && (
            <span style={{ color: KINDE_COLORS.muted }}>kilitli</span>
          )}
        </div>
      </button>

      {isOpen && !isLocked && (
        <div
          style={{
            padding: "8px 20px 20px",
            borderTop: `1px solid ${KINDE_COLORS.divider}`,
          }}
        >
          {PLATFORM_ORDER.map((plat) => {
            const result = item.platformResults.find((r) => r.platform === plat);
            return (
              <PlatformBlock
                key={plat}
                platform={plat}
                result={result}
                brandName={brandName}
                competitorNames={competitorNames}
              />
            );
          })}
        </div>
      )}

      {isLocked && (
        <div
          style={{
            padding: "16px 20px",
            borderTop: `1px solid ${KINDE_COLORS.divider}`,
            background: KINDE_COLORS.bgSoft,
            fontSize: 13,
            color: KINDE_COLORS.muted,
            textAlign: "center",
          }}
        >
          Tüm sorgu detaylarını{" "}
          <Link
            href="/panel/abonelik"
            style={{ color: KINDE_COLORS.black, fontWeight: 600 }}
          >
            Pro ile görün · ₺699/ay
          </Link>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/*  Platform yanıt bloğu                                */
/* -------------------------------------------------- */
function PlatformBlock({
  platform,
  result,
  brandName,
  competitorNames,
}: {
  platform: string;
  result?: {
    platform: string;
    mentioned: boolean;
    position: string | null;
    fullResponse: string | null;
    excerpt: string | null;
  };
  brandName: string;
  competitorNames: string[];
}) {
  const hasResponse =
    !!result?.fullResponse && !result.fullResponse.startsWith("[ERROR]");
  const statusText = platformStatusLabel(result);

  return (
    <div
      style={{
        padding: "16px 0",
        borderBottom: `1px solid ${KINDE_COLORS.divider}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 8,
          gap: 12,
        }}
      >
        <div>
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            {PLATFORM_LABELS[platform] ?? platform}
          </span>
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: KINDE_COLORS.mutedLight,
            }}
          >
            {PLATFORM_MODELS[platform] ?? platform}
          </span>
        </div>
        <span style={{ fontSize: 11, color: KINDE_COLORS.muted }}>
          {statusText}
        </span>
      </div>
      {hasResponse ? (
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: "#333",
            whiteSpace: "pre-wrap",
            background: "#FAFAFA",
            padding: 14,
            borderRadius: 8,
          }}
        >
          {highlightNames(result.fullResponse!, [brandName, ...competitorNames]).map(
            (part, i) =>
              part.bold ? (
                <strong key={i}>{part.text}</strong>
              ) : (
                <span key={i}>{part.text}</span>
              ),
          )}
        </div>
      ) : (
        <div
          style={{
            fontSize: 13,
            color: KINDE_COLORS.mutedLight,
            fontStyle: "italic",
            padding: 14,
            background: "#FAFAFA",
            borderRadius: 8,
            lineHeight: 1.6,
          }}
        >
          Bu sorgunun detaylı yanıtı henüz mevcut değil. Sonraki taramada
          güncellenecek.
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/*  Yardımcılar                                          */
/* -------------------------------------------------- */
function platformStatusLabel(result?: {
  mentioned: boolean;
  position: string | null;
  fullResponse: string | null;
}): string {
  if (!result) return "—";
  const hasResp =
    !!result.fullResponse && !result.fullResponse.startsWith("[ERROR]");
  if (!hasResp) return "yanıt yok";
  if (result.mentioned) {
    return result.position
      ? `${result.position} sırada önerildi`
      : "bahsedildi";
  }
  return "bahsedilmiyor";
}

function competitorInText(text: string, names: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return names.some((n) => n && lower.includes(n.toLowerCase()));
}

function highlightNames(
  text: string,
  names: string[],
): Array<{ text: string; bold: boolean }> {
  if (!text) return [];
  const unique = [...new Set(names.filter((n) => n && n.length > 1))].sort(
    (a, b) => b.length - a.length,
  );
  if (unique.length === 0) return [{ text, bold: false }];
  const pattern = new RegExp(
    `(${unique.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  const parts = text.split(pattern);
  return parts.map((part) => ({
    text: part,
    bold: unique.some((n) => n.toLowerCase() === part.toLowerCase()),
  }));
}

function formatRelative(iso: string): string {
  if (!iso) return "—";
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMs = now - then;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) return "az önce";
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} gün önce`;
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}
