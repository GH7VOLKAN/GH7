"use client";

import { useState } from "react";
import type { PromptItemData } from "@/lib/dal/prompts";
import {
  KindePage,
  KindeHero,
  Divider,
  SectionHeading,
  SectionLead,
  SourceNote,
  ProGate,
  KindeFooter,
  useFadeIn,
  KINDE_COLORS,
} from "@/components/panel/kinde/primitives";

const PLATFORM_ORDER = ["chatgpt", "claude", "gemini", "perplexity", "google_aio"];
const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "Google AIO",
};
const PLATFORM_MODELS: Record<string, string> = {
  chatgpt: "gpt-4o-search",
  claude: "claude-3.5-sonnet",
  gemini: "gemini-1.5-flash",
  perplexity: "sonar",
  google_aio: "AI Overview (SerpAPI)",
};

const FREE_OPEN_LIMIT = 3;

type FilterType = "all" | "mentioned" | "not_mentioned" | "no_response";

export interface AramalarV3Props {
  plan: string;
  brandName: string;
  competitorNames: string[];
  promptItems: PromptItemData[];
  lastUpdate: string | null;
}

export function AramalarContentV3(props: AramalarV3Props) {
  const isPro = props.plan !== "free";

  const mentionedQueries = props.promptItems.filter((p) =>
    Object.values(p.modelResults).some((m) => m),
  ).length;

  const noResponseQueries = props.promptItems.filter(
    (p) =>
      p.platformResults.length === 0 ||
      p.platformResults.every(
        (pl) => !pl.fullResponse || pl.fullResponse.startsWith("[ERROR]"),
      ),
  ).length;

  return (
    <KindePage>
      <KindeHero
        title="Senin yerine kim öneriliyor."
        subtitle={`${props.promptItems.length} sorguda 5 AI platformuna sorduk. İşte herkesin ne dediği.`}
        tertiary={
          props.promptItems.length > 0
            ? `${mentionedQueries} sorguda bahsedildiniz · ${noResponseQueries} sorgu yanıtsız`
            : undefined
        }
      />
      <Divider />
      <SectionQueries {...props} isPro={isPro} />
      <Divider />
      <KindeFooter lastUpdate={props.lastUpdate} />
    </KindePage>
  );
}

function SectionQueries({
  promptItems,
  brandName,
  competitorNames,
  isPro,
}: AramalarV3Props & { isPro: boolean }) {
  const ref = useFadeIn<HTMLDivElement>();
  const [filter, setFilter] = useState<FilterType>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = promptItems.filter((p) => {
    const any = Object.values(p.modelResults).some((m) => m);
    const noResp =
      p.platformResults.length === 0 ||
      p.platformResults.every(
        (pl) => !pl.fullResponse || pl.fullResponse.startsWith("[ERROR]"),
      );
    if (filter === "mentioned") return any;
    if (filter === "not_mentioned") return !any && !noResp;
    if (filter === "no_response") return noResp;
    return true;
  });

  if (promptItems.length === 0) {
    return (
      <div ref={ref} className="gh7-fade-in">
        <SectionHeading>Henüz sorgu yok.</SectionHeading>
        <SectionLead>
          Analizin tamamlanmasını bekliyoruz. İlk tarama birkaç dakika sürer.
        </SectionLead>
      </div>
    );
  }

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Sorgular ve 5 platform yanıtı.</SectionHeading>
      <SectionLead>
        Her sorgunun tam yanıtını görebilirsiniz. Markanız ve rakipleriniz{" "}
        <strong>kalın</strong> gösterilir.
      </SectionLead>

      {/* Filter pills */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        {(
          [
            ["all", `Tümü (${promptItems.length})`],
            [
              "mentioned",
              `Bahsedilen (${promptItems.filter((p) => Object.values(p.modelResults).some((m) => m)).length})`,
            ],
            [
              "not_mentioned",
              `Bahsedilmeyen (${
                promptItems.filter((p) => {
                  const any = Object.values(p.modelResults).some((m) => m);
                  const noResp =
                    p.platformResults.length === 0 ||
                    p.platformResults.every(
                      (pl) =>
                        !pl.fullResponse ||
                        pl.fullResponse.startsWith("[ERROR]"),
                    );
                  return !any && !noResp;
                }).length
              })`,
            ],
            [
              "no_response",
              `Yanıtsız (${
                promptItems.filter(
                  (p) =>
                    p.platformResults.length === 0 ||
                    p.platformResults.every(
                      (pl) =>
                        !pl.fullResponse ||
                        pl.fullResponse.startsWith("[ERROR]"),
                    ),
                ).length
              })`,
            ],
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
              border: "1px solid #E8E8E8",
              background: filter === key ? "#000" : "#FFF",
              color: filter === key ? "#FFF" : "#000",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ fontSize: 14, color: KINDE_COLORS.mutedLight, fontStyle: "italic" }}>
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
              onToggle={() =>
                !isLocked && setOpenId(isOpen ? null : item.id)
              }
              isLocked={isLocked}
              brandName={brandName}
              competitorNames={competitorNames}
            />
          );
        })}
      </div>

      <SourceNote>
        OpenAI gpt-4o-search · Anthropic claude-3.5-sonnet · Google
        gemini-1.5-flash · Perplexity sonar · Google AIO (SerpAPI)
      </SourceNote>
    </div>
  );
}

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
  const mentionedCount = Object.values(item.modelResults).filter(Boolean).length;
  const noResp =
    item.platformResults.length === 0 ||
    item.platformResults.every(
      (pl) => !pl.fullResponse || pl.fullResponse.startsWith("[ERROR]"),
    );
  const statusLabel = noResp
    ? "Yanıtsız"
    : mentionedCount > 0
      ? `${mentionedCount}/5 platform`
      : "Bahsedilmedi";
  const statusColor = noResp ? "#999" : mentionedCount > 0 ? "#2E7D32" : "#C62828";

  const card = (
    <div
      style={{
        border: `1px solid ${KINDE_COLORS.divider}`,
        borderRadius: 12,
        overflow: "hidden",
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              {item.text}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: KINDE_COLORS.mutedLight,
              }}
            >
              {item.category ?? "Genel"} · {item.searchIntent ?? "arama"}
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: statusColor,
              whiteSpace: "nowrap",
            }}
          >
            {statusLabel}
          </span>
        </div>
      </button>
      {isOpen && (
        <div
          style={{
            padding: "0 20px 20px",
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
    </div>
  );
  if (isLocked) return <ProGate>{card}</ProGate>;
  return card;
}

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
  const noResp =
    !result || !result.fullResponse || result.fullResponse.startsWith("[ERROR]");
  const text = noResp
    ? "Bu platform bu sorguya yanıt vermedi."
    : result?.fullResponse || "";

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
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
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
        {result?.mentioned && (
          <span style={{ fontSize: 11, color: "#2E7D32", fontWeight: 600 }}>
            ✓ Bahsedildi{result.position ? ` · ${result.position}` : ""}
          </span>
        )}
        {noResp && (
          <span style={{ fontSize: 11, color: "#999", fontStyle: "italic" }}>
            Yanıt yok
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: noResp ? KINDE_COLORS.mutedLight : "#333",
          whiteSpace: "pre-wrap",
        }}
      >
        {highlightNames(text, [brandName, ...competitorNames]).map((part, i) =>
          part.bold ? (
            <strong key={i}>{part.text}</strong>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </div>
    </div>
  );
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
