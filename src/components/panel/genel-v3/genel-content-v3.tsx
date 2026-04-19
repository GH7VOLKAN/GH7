"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { GenelPageData } from "@/lib/dal/genel-page";
import { ScanNowButton } from "@/components/panel/scan-now-button";

const CATEGORY_LABELS: Record<string, string> = {
  content: "İçerik otoritesi",
  schema: "Yapılandırılmış veri",
  entity: "Entity & kimlik",
  tech: "Teknik erişilebilirlik",
  external: "Dış referanslar",
  ai: "AI platform görünürlüğü",
};
const CATEGORY_ORDER = ["content", "schema", "entity", "tech", "external", "ai"];

const PLATFORM_ORDER = ["chatgpt", "claude", "gemini", "perplexity", "google_aio"];
const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "Google AIO",
};

/* -------------------------------------------------- */
/*  Utility — intersection observer fade-in           */
/* -------------------------------------------------- */
function useFadeIn<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("gh7-fade-in-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* -------------------------------------------------- */
/*  Highlight — kullanıcı markası + rakip isimleri bold */
/* -------------------------------------------------- */
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

/* -------------------------------------------------- */
/*  Main Component                                     */
/* -------------------------------------------------- */
export function GenelContentV3({ data }: { data: GenelPageData }) {
  // Genel Bakış FREE plan'da tam açık — kısıtlama diğer sayfalarda.
  // isPro = true → tüm içerik gate'leri bypass edilir.
  // isRealPro gerçek plan durumunu tutar; Section6Pro (upsell) sadece
  // gerçek FREE kullanıcıya gösterilir.
  const isPro = true;
  const isRealPro = data.plan !== "free";

  return (
    <>
      <style jsx global>{`
        @keyframes gh7FadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .gh7-fade-in {
          opacity: 0;
        }
        .gh7-fade-in-visible {
          animation: gh7FadeIn 0.7s ease forwards;
        }
      `}</style>

      <div style={{ background: "#FFFFFF", color: "#000000" }}>
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "80px 24px",
            fontFamily:
              '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          <Hero data={data} />
          <Divider />
          <Section1Queries data={data} isPro={isPro} />
          <Divider />
          <Section2Rekabet data={data} />
          <Divider />
          <Section3Karsilastirma data={data} isPro={isPro} />
          <Divider />
          <Section4Aksiyon data={data} isPro={isPro} />
          <Divider />
          <Section5GH7 />
          {!isRealPro && (
            <>
              <Divider />
              <Section6Pro />
            </>
          )}
          <Divider />
          <Footer lastUpdate={data.lastUpdate} />
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------- */
/*  Hero                                               */
/* -------------------------------------------------- */
function Hero({ data }: { data: GenelPageData }) {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className="gh7-fade-in" style={{ paddingBottom: 40 }}>
      <div
        style={{
          fontSize: "clamp(72px, 15vw, 120px)",
          fontWeight: 800,
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
        }}
      >
        {data.score}
        <span style={{ fontSize: "0.35em", color: "#888", fontWeight: 500 }}>
          /100
        </span>
      </div>
      <h1
        style={{
          marginTop: 40,
          fontSize: "clamp(36px, 6vw, 48px)",
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
        }}
      >
        {data.overallMessage}
      </h1>
      <p
        style={{
          marginTop: 24,
          fontSize: 16,
          color: "#888",
          lineHeight: 1.6,
        }}
      >
        {data.totalPlatforms} AI platformunda · {data.totalQueries} sorguda ·{" "}
        {data.totalCities} ilde test edildi
      </p>
      <p
        style={{
          marginTop: 12,
          fontSize: 14,
          color: "#AAA",
          lineHeight: 1.6,
        }}
      >
        {data.mentionedCount} sorguda bahsedildiniz · {data.competitorAheadCount}{" "}
        sorguda rakip önde · {data.nobodyCount} sorguda kimse yok
      </p>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Section 1 — Sorgular (Durum Analizi)               */
/* -------------------------------------------------- */
type FilterType = "all" | "mentioned" | "not_mentioned" | "no_response";

function Section1Queries({
  data,
  isPro,
}: {
  data: GenelPageData;
  isPro: boolean;
}) {
  const ref = useFadeIn<HTMLDivElement>();
  const [filter, setFilter] = useState<FilterType>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = data.queries.filter((q) => {
    if (filter === "mentioned") return q.hasAnyMention;
    if (filter === "not_mentioned")
      return !q.hasAnyMention && !q.hasNoResponse;
    if (filter === "no_response") return q.hasNoResponse;
    return true;
  });

  const FREE_OPEN_LIMIT = 3;

  // Hiç scan çalışmamış mı? (tüm query'ler hasNoResponse)
  const noScanYet =
    data.queries.length > 0 &&
    data.queries.every((q) => q.hasNoResponse);

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Markanızın yapay zeka görünürlüğü.</SectionHeading>
      <SectionLead>
        5 AI platformuna gerçek sorgular gönderildi. Her platformun tam yanıtı
        aşağıda. Markanızdan bahsedilip bahsedilmediğini kendiniz görün.
      </SectionLead>

      {noScanYet && <ScanNowButton variant="banner" label="Şimdi Tara" />}

      {/* Filter pills */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          margin: "32px 0 24px",
        }}
      >
        {(
          [
            ["all", `Tümü (${data.queries.length})`],
            [
              "mentioned",
              `Bahsedilen (${data.queries.filter((q) => q.hasAnyMention).length})`,
            ],
            [
              "not_mentioned",
              `Bahsedilmeyen (${data.queries.filter((q) => !q.hasAnyMention && !q.hasNoResponse).length})`,
            ],
            [
              "no_response",
              `Yanıtsız (${data.queries.filter((q) => q.hasNoResponse).length})`,
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
        <p style={{ fontSize: 14, color: "#AAA", fontStyle: "italic" }}>
          Bu filtreye uyan sorgu yok.
        </p>
      )}

      {/* Query cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((q, idx) => {
          const isLocked = !isPro && idx >= FREE_OPEN_LIMIT;
          const isOpen = openId === q.id && !isLocked;
          return (
            <QueryCard
              key={q.id}
              query={q}
              isOpen={isOpen}
              onToggle={() => !isLocked && setOpenId(isOpen ? null : q.id)}
              isLocked={isLocked}
              userBrand={data.brandName}
            />
          );
        })}
      </div>

      <SourceNote>
        OpenAI gpt-4o-search · Anthropic claude-3.5-sonnet · Google
        gemini-1.5-flash · Perplexity sonar · Google AIO via SerpAPI ·{" "}
        {formatDate(data.lastUpdate)}
      </SourceNote>
    </div>
  );
}

function QueryCard({
  query,
  isOpen,
  onToggle,
  isLocked,
  userBrand,
}: {
  query: GenelPageData["queries"][number];
  isOpen: boolean;
  onToggle: () => void;
  isLocked: boolean;
  userBrand: string;
}) {
  const allCompetitors = query.platforms.flatMap((p) => p.competitors);

  return (
    <div
      style={{
        border: "1px solid #E8E8E8",
        borderRadius: 12,
        background: "#FFF",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "20px 24px",
          background: "transparent",
          border: "none",
          cursor: isLocked ? "default" : "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.4,
                color: "#000",
              }}
            >
              &ldquo;{query.text}&rdquo;
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "#888",
              }}
            >
              {query.totalPlatforms} platform · bahsedilme:{" "}
              {query.mentionedCount}/{query.totalPlatforms}
            </div>
          </div>
          {!isLocked && (
            <span
              style={{
                fontSize: 20,
                color: "#888",
                transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.2s",
              }}
            >
              ▾
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div
          style={{
            borderTop: "1px solid #E8E8E8",
            padding: "8px 0",
          }}
        >
          {PLATFORM_ORDER.map((platKey) => {
            const plat = query.platforms.find((p) => p.platform === platKey);
            return (
              <PlatformBlock
                key={platKey}
                platformKey={platKey}
                platform={plat}
                userBrand={userBrand}
                otherCompetitors={allCompetitors}
              />
            );
          })}
        </div>
      )}

      {isLocked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <p style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>
            Pro ile devamını görün · ₺699/ay
          </p>
        </div>
      )}
    </div>
  );
}

function PlatformBlock({
  platformKey,
  platform,
  userBrand,
  otherCompetitors,
}: {
  platformKey: string;
  platform: GenelPageData["queries"][number]["platforms"][number] | undefined;
  userBrand: string;
  otherCompetitors: string[];
}) {
  if (!platform) {
    return (
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #F3F3F3",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#000" }}>
          {PLATFORM_LABELS[platformKey]}
        </div>
        <p
          style={{
            marginTop: 8,
            fontSize: 13,
            color: "#AAA",
            fontStyle: "italic",
          }}
        >
          {platformKey === "google_aio"
            ? "Bu sorgu için AI Overview tetiklenmedi"
            : "Bu platform için yanıt yok"}
        </p>
      </div>
    );
  }

  const isError = platform.fullResponse.startsWith("[ERROR]");
  const highlighted = highlightNames(platform.fullResponse, [
    userBrand,
    ...platform.competitors,
    ...otherCompetitors,
  ]);

  const statusText = platform.mentioned
    ? platform.position
      ? `${platform.position} sırada önerildi`
      : "bahsedildi"
    : "bahsedilmiyor";

  return (
    <div
      style={{
        padding: "20px 24px",
        borderBottom: "1px solid #F3F3F3",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#000" }}>
          {PLATFORM_LABELS[platformKey]}{" "}
          <span style={{ fontWeight: 400, color: "#888" }}>
            {platform.model} · {formatDate(platform.createdAt)}
          </span>
        </div>
        <div style={{ fontSize: 13, color: "#000", fontWeight: 500 }}>
          {statusText}
        </div>
      </div>

      {isError ? (
        <p
          style={{
            padding: "12px 16px",
            background: "#FAFAFA",
            borderRadius: 8,
            fontSize: 13,
            color: "#888",
            fontStyle: "italic",
          }}
        >
          {platform.fullResponse}
        </p>
      ) : (
        <div
          style={{
            padding: "16px 20px",
            background: "#FAFAFA",
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.7,
            color: "#333",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {highlighted.map((part, i) =>
            part.bold ? (
              <strong key={i} style={{ color: "#000", fontWeight: 700 }}>
                {part.text}
              </strong>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </div>
      )}

      <p
        style={{
          marginTop: 12,
          fontSize: 13,
          color: "#666",
          lineHeight: 1.6,
        }}
      >
        {userBrand}{" "}
        {platform.mentioned ? "bahsedildi" : <strong>bahsedilmiyor</strong>}
        {platform.competitors.length > 0 &&
          ` · ${platform.competitors[0]}${platform.competitors[0] && platform.position ? ` ${platform.position}. sırada` : ""} önerildi`}
      </p>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Section 2 — Rekabet Analizi                        */
/* -------------------------------------------------- */
function Section2Rekabet({ data }: { data: GenelPageData }) {
  const ref = useFadeIn<HTMLDivElement>();

  if (!data.personalAnalysis) {
    return (
      <div ref={ref} className="gh7-fade-in">
        <SectionHeading>Sizi geçen firmalar ve nedenleri.</SectionHeading>
        <p style={{ fontSize: 14, color: "#AAA", marginTop: 24 }}>
          Henüz detaylı rekabet analizi oluşturulmadı. İlk tarama sonrası
          Claude Opus analizi burada görünecek.
        </p>
      </div>
    );
  }

  const allCompetitors: string[] = [];
  if (data.competitorName) allCompetitors.push(data.competitorName);

  const highlighted = highlightNames(data.personalAnalysis, [
    data.brandName,
    ...allCompetitors,
  ]);

  const paragraphs = data.personalAnalysis.split(/\n\n+/).filter(Boolean);

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Sizi geçen firmalar ve nedenleri.</SectionHeading>
      <div style={{ marginTop: 32 }}>
        {paragraphs.length > 1
          ? paragraphs.map((para, i) => (
              <p
                key={i}
                style={{
                  fontSize: 18,
                  lineHeight: 1.9,
                  color: "#333",
                  marginBottom: 20,
                }}
              >
                {renderHighlighted(para, [data.brandName, ...allCompetitors])}
              </p>
            ))
          : (
              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.9,
                  color: "#333",
                  whiteSpace: "pre-wrap",
                }}
              >
                {highlighted.map((part, i) =>
                  part.bold ? (
                    <strong key={i} style={{ color: "#000", fontWeight: 700 }}>
                      {part.text}
                    </strong>
                  ) : (
                    <span key={i}>{part.text}</span>
                  ),
                )}
              </p>
            )}
      </div>
      <SourceNote>
        Claude Opus · Veri: DataForSEO + Perplexity Sonar ·{" "}
        {formatDate(data.lastUpdate)}
      </SourceNote>
    </div>
  );
}

function renderHighlighted(text: string, names: string[]) {
  const parts = highlightNames(text, names);
  return parts.map((part, i) =>
    part.bold ? (
      <strong key={i} style={{ color: "#000", fontWeight: 700 }}>
        {part.text}
      </strong>
    ) : (
      <span key={i}>{part.text}</span>
    ),
  );
}

/* -------------------------------------------------- */
/*  Section 3 — Karşılaştırma (43 item)                */
/* -------------------------------------------------- */
function Section3Karsilastirma({
  data,
  isPro,
}: {
  data: GenelPageData;
  isPro: boolean;
}) {
  const ref = useFadeIn<HTMLDivElement>();
  const [openCat, setOpenCat] = useState<string | null>(null);

  const FREE_OPEN_ITEMS = 10; // toplam 10 madde açık

  if (data.auditItems.length === 0) {
    return (
      <div ref={ref} className="gh7-fade-in">
        <SectionHeading>Nerede eksiksiniz, ne gerekiyor.</SectionHeading>
        <p style={{ fontSize: 14, color: "#AAA", marginTop: 24 }}>
          Henüz 43 madde audit yapılmadı.
        </p>
      </div>
    );
  }

  let itemsShownSoFar = 0;

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Nerede eksiksiniz, ne gerekiyor.</SectionHeading>
      <SectionLead>
        GEO görünürlüğü için gerekli 43 kontrol noktası, rakibinizde ne var,
        sizde ne var.
      </SectionLead>

      <div style={{ marginTop: 32 }}>
        {CATEGORY_ORDER.map((key) => {
          const itemsInCat = data.auditItems.filter(
            (it) => it.category === key,
          );
          const passCount = itemsInCat.filter((it) => it.status === "pass").length;
          if (itemsInCat.length === 0) return null;

          const isOpen = openCat === key;
          return (
            <div
              key={key}
              style={{
                borderBottom: "1px solid #E8E8E8",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenCat(isOpen ? null : key)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#000",
                  }}
                >
                  {CATEGORY_LABELS[key]}{" "}
                  <span style={{ color: "#888", fontWeight: 500 }}>
                    · {passCount}/{itemsInCat.length} kontrol geçti
                  </span>
                </span>
                <span
                  style={{
                    fontSize: 20,
                    color: "#888",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.2s",
                  }}
                >
                  ▾
                </span>
              </button>
              {isOpen && (
                <div style={{ paddingBottom: 24 }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 14,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid #E8E8E8",
                          color: "#888",
                          fontWeight: 500,
                          textAlign: "left",
                        }}
                      >
                        <th style={{ padding: "8px 0", fontWeight: 500 }}>
                          Gereklilik
                        </th>
                        <th style={{ padding: "8px 12px", fontWeight: 500 }}>
                          Rakip
                        </th>
                        <th style={{ padding: "8px 0", fontWeight: 500 }}>
                          Siz
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsInCat.map((it) => {
                        const isLocked =
                          !isPro && itemsShownSoFar >= FREE_OPEN_ITEMS;
                        itemsShownSoFar++;
                        return (
                          <tr
                            key={it.key}
                            style={{
                              borderBottom: "1px solid #F3F3F3",
                              position: "relative",
                            }}
                          >
                            <td
                              style={{
                                padding: "12px 0",
                                color: "#000",
                                filter: isLocked ? "blur(3px)" : undefined,
                              }}
                            >
                              {it.label}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                color: "#333",
                                filter: isLocked ? "blur(3px)" : undefined,
                              }}
                            >
                              {it.competitorValue ?? "—"}
                            </td>
                            <td
                              style={{
                                padding: "12px 0",
                                color: "#000",
                                fontWeight: it.status === "fail" ? 700 : 500,
                                filter: isLocked ? "blur(3px)" : undefined,
                              }}
                            >
                              {it.value ?? "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!isPro && itemsInCat.length > 0 && (
                    <p
                      style={{
                        marginTop: 12,
                        fontSize: 13,
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      Detaylı madde analizleri Pro ile açılır · ₺699/ay
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SourceNote>
        DataForSEO On-Page + Backlinks + SERP API · Perplexity Sonar ·{" "}
        {formatDate(data.lastUpdate)}
      </SourceNote>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Section 4 — Aksiyon Planı                          */
/* -------------------------------------------------- */
function Section4Aksiyon({
  data,
  isPro,
}: {
  data: GenelPageData;
  isPro: boolean;
}) {
  const ref = useFadeIn<HTMLDivElement>();

  if (data.topActions.length === 0) {
    return (
      <div ref={ref} className="gh7-fade-in">
        <SectionHeading>Kendiniz yapabileceğiniz adımlar.</SectionHeading>
        <p style={{ fontSize: 14, color: "#AAA", marginTop: 24 }}>
          Tebrikler — iyileştirilecek kritik madde yok.
        </p>
      </div>
    );
  }

  const FREE_OPEN = 3;

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Kendiniz yapabileceğiniz adımlar.</SectionHeading>
      <SectionLead>
        43 kontrol noktasından en kritik olanları öncelik sırasına göre
        listeledik.
      </SectionLead>

      <div style={{ marginTop: 32 }}>
        {data.topActions.map((action, idx) => {
          const isLocked = !isPro && idx >= FREE_OPEN;
          return (
            <div
              key={action.key}
              style={{
                padding: "28px 0",
                borderBottom: "1px solid #E8E8E8",
                position: "relative",
              }}
            >
              <div
                style={{
                  filter: isLocked ? "blur(4px)" : undefined,
                  pointerEvents: isLocked ? "none" : undefined,
                  userSelect: isLocked ? "none" : undefined,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    color: "#888",
                    fontFamily: "monospace",
                    marginBottom: 8,
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: "#000",
                    marginBottom: 8,
                  }}
                >
                  {action.label}
                </h3>
                {action.recommendation && (
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.7,
                      color: "#333",
                      marginBottom: 8,
                    }}
                  >
                    {action.recommendation}
                  </p>
                )}
                <p style={{ fontSize: 13, color: "#888" }}>
                  Durum:{" "}
                  {action.status === "fail"
                    ? "eksik"
                    : action.status === "partial"
                      ? "yetersiz"
                      : "tamam"}
                  {action.value && ` · Şu anki: ${action.value}`}
                  {action.competitorValue &&
                    ` · Rakip: ${action.competitorValue}`}
                </p>
              </div>
              {isLocked && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      color: "#666",
                      fontWeight: 500,
                    }}
                  >
                    Pro ile devamını görün · ₺699/ay
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SourceNote>
        DataForSEO analizi + Claude Opus önceliklendirmesi ·{" "}
        {formatDate(data.lastUpdate)}
      </SourceNote>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Section 5 — GH7 Ne Öneriyor                        */
/* -------------------------------------------------- */
function Section5GH7() {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Biz yaparsak ne olur.</SectionHeading>

      <div style={{ marginTop: 32 }}>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.9,
            color: "#333",
            marginBottom: 24,
          }}
        >
          Yukarıdaki adımları kendiniz uygulayabilirsiniz. Ancak schema markup
          yazmak, içerik stratejisi oluşturmak, backlink kazanmak ve entity
          varlığını güçlendirmek farklı uzmanlık alanları gerektirir.
        </p>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.9,
            color: "#333",
            marginBottom: 24,
          }}
        >
          GH7 olarak bu adımları sizin için uyguluyoruz. Sonucu kendi
          panelinizde görürsünüz — önce gör, sonra öde.
        </p>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.9,
            color: "#333",
            marginBottom: 40,
          }}
        >
          Pro üyelerimize özel hizmet paketleri sunuyoruz. Temel, Büyüme ve
          Hakimiyet paketleri ile ihtiyacınıza uygun çözüm seçebilirsiniz.
          Detaylar ve fiyatlar Pro panelinde.
        </p>
      </div>

      <div
        style={{
          padding: "32px 0",
          borderTop: "1px solid #E8E8E8",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#000",
            marginBottom: 16,
          }}
        >
          Pro · ₺699/ay · yıllık ₺8.388
        </p>
        <Link
          href="/panel/abonelik"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            background: "#000",
            color: "#FFF",
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 8,
            fontFamily: "inherit",
          }}
        >
          Pro&apos;ya Geç
        </Link>
      </div>

      <SourceNote>Claude Opus önerisi · {formatDate(null)}</SourceNote>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Section 6 — Pro ile Büyüyün                        */
/* -------------------------------------------------- */
function Section6Pro() {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className="gh7-fade-in">
      <h2
        style={{
          fontSize: "clamp(36px, 6vw, 48px)",
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          marginBottom: 20,
        }}
      >
        Her hafta ölçün, her hafta büyüyün.
      </h2>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          color: "#555",
          marginBottom: 40,
        }}
      >
        Haftada 3 analiz · 5 rakip takibi · 23 sorgu izleme · İl bazlı kırılım ·
        Haftalık rapor · Özel hizmet paketleri
      </p>

      {/* Basit timeline bar */}
      <div
        style={{
          marginBottom: 48,
          display: "flex",
          gap: 12,
          alignItems: "flex-end",
          height: 120,
        }}
      >
        {[
          { label: "Bugün", score: 21, height: 21 },
          { label: "4. hafta", score: 34, height: 34 },
          { label: "8. hafta", score: 52, height: 52 },
          { label: "12. hafta", score: 65, height: 65 },
        ].map((p, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                height: `${p.height}%`,
                background: "#000",
                marginBottom: 8,
                borderRadius: "2px 2px 0 0",
              }}
            />
            <div style={{ fontSize: 11, color: "#888" }}>{p.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#000" }}>
              {p.score}
            </div>
          </div>
        ))}
      </div>

      {/* Dev fiyat */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            fontSize: "clamp(56px, 12vw, 80px)",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          ₺699
        </div>
        <p
          style={{
            marginTop: 12,
            fontSize: 16,
            color: "#888",
          }}
        >
          /ay · yıllık tek ödeme ₺8.388
        </p>
      </div>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Link
          href="/panel/abonelik"
          style={{
            display: "inline-block",
            padding: "16px 48px",
            background: "#000",
            color: "#FFF",
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 700,
            borderRadius: 8,
            fontFamily: "inherit",
          }}
        >
          Pro&apos;ya Geç
        </Link>
      </div>
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#BBB",
          marginBottom: 48,
        }}
      >
        İlk 7 gün memnun kalmazsanız iade
      </p>

      {/* Pro içeriği listesi */}
      <div
        style={{
          padding: "32px 0",
          borderTop: "1px solid #E8E8E8",
        }}
      >
        {[
          "Haftada 3 otomatik analiz",
          "5 rakip sürekli takip",
          "23+ sorgu izleme",
          "3 il bazlı kırılım",
          "Haftalık e-posta raporu",
          "Rakip değişiklik alert'leri",
          "Özel hizmet paketlerine erişim",
          "Önce gör sonra öde sistemi",
        ].map((line, i) => (
          <p
            key={i}
            style={{
              fontSize: 16,
              lineHeight: 2,
              color: "#000",
              padding: "4px 0",
              borderBottom: i < 7 ? "1px solid #F3F3F3" : "none",
            }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Footer — Data Sources                              */
/* -------------------------------------------------- */
function Footer({ lastUpdate }: { lastUpdate: string | null }) {
  const ref = useFadeIn<HTMLDivElement>();
  const sources = [
    ["DataForSEO On-Page API", "site taraması, schema, hız"],
    ["DataForSEO Backlinks API", "backlink profili"],
    ["DataForSEO SERP API", "Knowledge Panel, marka araması"],
    ["Perplexity Sonar", "firma keşfi, rakip tespiti"],
    ["ChatGPT gpt-4o-search", "gerçek sorgu yanıtları"],
    ["Claude claude-3.5-sonnet", "gerçek sorgu + Opus analiz"],
    ["Gemini gemini-1.5-flash", "gerçek sorgu yanıtları"],
    ["Google AIO via SerpAPI", "AI Overview yanıtları"],
  ];
  return (
    <div ref={ref} className="gh7-fade-in">
      <h3
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 24,
        }}
      >
        Bu analizi oluşturan kaynaklar
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {sources.map(([name, desc], i) => (
          <div
            key={i}
            style={{
              padding: "16px 20px",
              border: "1px solid #F3F3F3",
              borderRadius: 8,
              background: "#FFF",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "#000" }}>
              {name}
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              {desc}
            </div>
          </div>
        ))}
      </div>
      <p
        style={{
          marginTop: 32,
          fontSize: 12,
          color: "#BBB",
        }}
      >
        Son güncelleme: {formatDate(lastUpdate)}
      </p>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Shared components                                  */
/* -------------------------------------------------- */
function Divider() {
  return <div style={{ height: 1, background: "#E8E8E8", margin: "80px 0" }} />;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "clamp(28px, 4.5vw, 36px)",
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: "-0.03em",
        marginBottom: 16,
      }}
    >
      {children}
    </h2>
  );
}

function SectionLead({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 16,
        lineHeight: 1.7,
        color: "#777",
      }}
    >
      {children}
    </p>
  );
}

function SourceNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        marginTop: 40,
        fontSize: 11,
        color: "#CCC",
        fontStyle: "italic",
      }}
    >
      {children}
    </p>
  );
}

/* -------------------------------------------------- */
/*  Helpers                                            */
/* -------------------------------------------------- */
function formatDate(iso: string | null): string {
  if (!iso) return "henüz yok";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "henüz yok";
  }
}
