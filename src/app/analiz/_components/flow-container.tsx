"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import s from "../analiz.module.css";
import type {
  AnalysisResult,
  Answer,
  CandidateCompetitor,
  DetectResult,
  Door,
  FlowPhase,
  Product,
  ProgressStep,
  Query,
  RunResult,
} from "@/lib/analiz/types";
import { AI_PROVIDERS, AI_PROVIDER_LABELS } from "@/lib/analiz/types";
import { DetectingStrip } from "./detecting-strip";
import { ProductPicker } from "./product-picker";
import { AnalyzingProgress } from "./analyzing-progress";
import { Scoreboard } from "./scoreboard";
import { ProGate } from "./pro-gate";

type Props = {
  domain: string;
  door: Door;
  forceRefresh?: boolean;
};

type ApiDoor = "firma" | "kisi" | "eticaret" | "yurtdisi";

function doorToApiDoor(door: Door): ApiDoor {
  if (door === "export") return "yurtdisi";
  return door as ApiDoor;
}

type SelectedCompetitor = { name: string; isNew: boolean };

function buildInitialSteps(): ProgressStep[] {
  return [
    { key: "gen", label: "Sorgular üretiliyor", status: "running" },
    ...AI_PROVIDERS.map<ProgressStep>((p) => ({
      key: p,
      label: `${AI_PROVIDER_LABELS[p]} · yanıt bekleniyor`,
      status: "pending",
    })),
  ];
}

export function FlowContainer({ domain, door, forceRefresh }: Props) {
  const [phase, setPhase] = useState<FlowPhase>("detecting");
  const [detected, setDetected] = useState<DetectResult | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [citiesInput, setCitiesInput] = useState<string>("");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [selectedCompetitors, setSelectedCompetitors] = useState<SelectedCompetitor[]>([]);
  const [manualCompetitorInput, setManualCompetitorInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(buildInitialSteps());
  const [generatedQueries, setGeneratedQueries] = useState<string[]>([]);

  const hasRequestedDetect = useRef(false);

  const detectRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const citiesRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef<HTMLDivElement>(null);
  const competitorPickRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // ─── Detect ──────────────────────────────────────────
  useEffect(() => {
    if (hasRequestedDetect.current) return;
    hasRequestedDetect.current = true;
    let aborted = false;

    (async () => {
      try {
        const res = await fetch("/api/analiz/detect", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ domain, door }),
        });
        if (!res.ok) throw new Error(`Detect başarısız (${res.status})`);
        const data = (await res.json()) as DetectResult;
        if (aborted) return;
        setDetected(data);
        setPhase("product-pick");
      } catch (e) {
        if (aborted) return;
        setError((e as Error).message);
        setPhase("error");
      }
    })();

    return () => {
      aborted = true;
    };
  }, [domain, door]);

  // ─── Product toggle ──────────────────────────────────
  const onProductToggle = useCallback((p: Product) => {
    setSelectedProducts((prev) => {
      if (prev.some((x) => x.id === p.id)) {
        return prev.filter((x) => x.id !== p.id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, p];
    });
  }, []);

  const onProductsConfirmed = useCallback(() => {
    if (selectedProducts.length === 0) return;
    setPhase("cities-pick");
  }, [selectedProducts.length]);

  // ─── Cities confirmed → run ──────────────────────────
  const onCitiesConfirmed = useCallback(async () => {
    setPhase("running");
    setProgressSteps(buildInitialSteps());
    setGeneratedQueries([]);

    // Fake progress — gerçek bağlantı ayrı PR'da
    const FAKE_QUERY_COUNT = 5;
    setTimeout(() => {
      setGeneratedQueries(Array(FAKE_QUERY_COUNT).fill("sorgu üretildi"));
      setProgressSteps((prev) =>
        prev.map((st, i) =>
          i === 0
            ? { ...st, status: "done", detail: `${FAKE_QUERY_COUNT} soru` }
            : i === 1
              ? { ...st, status: "running", label: `${AI_PROVIDER_LABELS[AI_PROVIDERS[0]]} · çalışıyor` }
              : st,
        ),
      );
    }, 1000);

    AI_PROVIDERS.forEach((_prov, idx) => {
      setTimeout(
        () => {
          setProgressSteps((prev) =>
            prev.map((st, i) => {
              if (i === idx + 1) return { ...st, status: "done", detail: "tamam" };
              if (i === idx + 2 && i < prev.length) {
                return {
                  ...st,
                  status: "running",
                  label: `${AI_PROVIDER_LABELS[AI_PROVIDERS[idx + 1]]} · çalışıyor`,
                };
              }
              return st;
            }),
          );
        },
        2000 + idx * 3000,
      );
    });

    try {
      const citiesArr = citiesInput
        ? citiesInput.split(",").map((x) => x.trim()).filter(Boolean)
        : undefined;

      const res = await fetch("/api/analiz/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          domain,
          door: doorToApiDoor(door),
          sector: detected?.sector,
          products: selectedProducts.map((p) => p.name),
          cities: citiesArr,
          forceRefresh: forceRefresh ?? false,
        }),
      });
      if (!res.ok) throw new Error(`Analiz başarısız (${res.status})`);
      const data = (await res.json()) as RunResult;

      // Min 5sn UX bekleme (progress animasyonu bitsin)
      await new Promise((r) => setTimeout(r, 5000));
      setRunResult(data);

      if (data.candidateCompetitors.length > 0) {
        setPhase("competitor-pick");
      } else {
        setPhase("done");
      }
    } catch (e) {
      setError((e as Error).message);
      setPhase("error");
    }
  }, [domain, door, detected, selectedProducts, citiesInput, forceRefresh]);

  // ─── Competitor toggle ───────────────────────────────
  const onCompetitorToggle = useCallback((name: string, isNew = false) => {
    setSelectedCompetitors((prev) => {
      if (prev.some((c) => c.name === name)) {
        return prev.filter((c) => c.name !== name);
      }
      if (prev.length >= 3) return prev;
      return [...prev, { name, isNew }];
    });
  }, []);

  const onAddManualCompetitor = useCallback(() => {
    const name = manualCompetitorInput.trim();
    if (!name) return;
    if (selectedCompetitors.some((c) => c.name === name)) return;
    if (selectedCompetitors.length >= 3) return;
    setSelectedCompetitors((prev) => [...prev, { name, isNew: true }]);
    setManualCompetitorInput("");
  }, [manualCompetitorInput, selectedCompetitors]);

  const onCompetitorsConfirmed = useCallback(() => {
    if (selectedCompetitors.length === 0) return;
    setPhase("done");
  }, [selectedCompetitors.length]);

  // ─── Scroll into view ────────────────────────────────
  useEffect(() => {
    const refMap: Record<FlowPhase, React.RefObject<HTMLDivElement | null>> = {
      detecting: detectRef,
      "product-pick": productRef,
      "cities-pick": citiesRef,
      running: runningRef,
      "competitor-pick": competitorPickRef,
      done: doneRef,
      error: detectRef,
    };
    const target = refMap[phase];
    if (target?.current) {
      setTimeout(
        () => target.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        80,
      );
    }
  }, [phase]);

  if (phase === "error") {
    return (
      <div className={s.errorBox}>
        <strong>Analiz çalıştırılamadı.</strong>
        <br />
        {error ?? "Bilinmeyen hata."} Tekrar denemek için sayfayı yenile.
      </div>
    );
  }

  const adapted = runResult
    ? runResultToAnalysisResult(runResult, selectedCompetitors)
    : null;

  return (
    <>
      <div ref={detectRef}>
        <DetectingStrip domain={domain} sector={detected?.sector} />
      </div>

      {detected && (
        <div ref={productRef}>
          <ProductPicker
            products={detected.products}
            selectedIds={selectedProducts.map((p) => p.id)}
            onToggle={onProductToggle}
            onSubmit={onProductsConfirmed}
            submitDisabled={selectedProducts.length === 0}
          />
        </div>
      )}

      {(phase === "cities-pick" ||
        phase === "running" ||
        phase === "competitor-pick" ||
        phase === "done") && (
        <div ref={citiesRef}>
          <CitiesStub
            door={door}
            value={citiesInput}
            onChange={setCitiesInput}
            onSubmit={onCitiesConfirmed}
            locked={phase !== "cities-pick"}
          />
        </div>
      )}

      {(phase === "running" || phase === "competitor-pick" || phase === "done") && (
        <div ref={runningRef}>
          <AnalyzingProgress
            steps={progressSteps}
            generatedQueries={generatedQueries}
          />
        </div>
      )}

      {(phase === "competitor-pick" || phase === "done") && runResult && (
        <div ref={competitorPickRef}>
          <CompetitorPickStub
            candidates={runResult.candidateCompetitors}
            selected={selectedCompetitors}
            manualInput={manualCompetitorInput}
            onToggle={onCompetitorToggle}
            onManualChange={setManualCompetitorInput}
            onAddManual={onAddManualCompetitor}
            onSubmit={onCompetitorsConfirmed}
            locked={phase === "done"}
          />
        </div>
      )}

      {phase === "done" && adapted && (
        <div ref={doneRef}>
          <Scoreboard analysis={adapted} />
          <ProGate productName={selectedProducts[0]?.name} />
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Stub: Cities input (inline, basit)
// ═══════════════════════════════════════════════════════════

function CitiesStub({
  door,
  value,
  onChange,
  onSubmit,
  locked,
}: {
  door: Door;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  locked: boolean;
}) {
  const placeholder =
    door === "kisi"
      ? "İl (zorunlu): Balıkesir"
      : door === "eticaret"
        ? "Türkiye geneli (isteğe bağlı il)"
        : door === "export"
          ? "Hedef ülke: Almanya"
          : "İl(ler) (opsiyonel, virgülle ayır): Balıkesir, Bursa";

  const canSubmit = door === "kisi" ? value.trim().length > 0 : true;
  const disabled = locked || !canSubmit;

  return (
    <section className={s.screen}>
      <div className={s.screenLabel}>Ekran 4 · İl seçimi</div>
      <h2 className={s.h2}>Hangi ilde ölçelim?</h2>
      <p className={s.sub}>
        {door === "kisi"
          ? "İlini gir — kişi/uzman analizi için zorunlu."
          : door === "eticaret"
            ? "E-ticaret için Türkiye geneli sorgular gider."
            : door === "export"
              ? "Hedef ülkeyi (ve opsiyonel şehri) gir."
              : "İl(ler) opsiyonel. Boş bırakırsan Türkiye geneli."}
      </p>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={locked}
        style={{
          width: "100%",
          padding: "12px 16px",
          border: "1px solid var(--g300)",
          borderRadius: 8,
          fontFamily: "inherit",
          fontSize: 14,
          outline: "none",
          marginBottom: 16,
          background: "var(--white)",
        }}
      />
      <button
        onClick={onSubmit}
        disabled={disabled}
        style={{
          padding: "12px 24px",
          background: disabled ? "var(--g200)" : "var(--black)",
          color: disabled ? "var(--g400)" : "var(--white)",
          border: "none",
          borderRadius: 6,
          fontFamily: "inherit",
          fontSize: 14,
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        Analiz Başlat →
      </button>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// Stub: Competitor picker post-run
// ═══════════════════════════════════════════════════════════

function CompetitorPickStub({
  candidates,
  selected,
  manualInput,
  onToggle,
  onManualChange,
  onAddManual,
  onSubmit,
  locked,
}: {
  candidates: CandidateCompetitor[];
  selected: SelectedCompetitor[];
  manualInput: string;
  onToggle: (name: string) => void;
  onManualChange: (v: string) => void;
  onAddManual: () => void;
  onSubmit: () => void;
  locked: boolean;
}) {
  const isSelected = (name: string) => selected.some((c) => c.name === name);
  const canSubmit = selected.length >= 1 && selected.length <= 3;
  const disabled = locked || !canSubmit;

  // Manual-added isimler ayrı göstereceğiz; candidates listesinden çıkar
  const candidateNames = new Set(candidates.map((c) => c.name));
  const manualSelected = selected.filter((c) => c.isNew && !candidateNames.has(c.name));

  return (
    <section className={s.screen}>
      <div className={s.screenLabel}>Ekran 5 · Rakip seç</div>
      <h2 className={s.h2}>AI&apos;lar sana şunları önerdi.</h2>
      <p className={s.sub}>En fazla 3 gerçek rakibini seç. Frekans sırasına göre listelendi.</p>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }}>
        {candidates.slice(0, 15).map((c) => {
          const checked = isSelected(c.name);
          return (
            <li
              key={c.name}
              onClick={() => !locked && onToggle(c.name)}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                gap: 12,
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid var(--g200)",
                cursor: locked ? "default" : "pointer",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  border: "1px solid var(--g400)",
                  borderRadius: 3,
                  background: checked ? "var(--black)" : "transparent",
                  color: "var(--white)",
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {checked ? "✓" : ""}
              </span>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</span>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--g500)",
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
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
                {c.providers.slice(0, 3).join(", ")}
              </span>
            </li>
          );
        })}

        {manualSelected.map((c) => (
          <li
            key={c.name}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto auto",
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
                flexShrink: 0,
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
              YENİ
            </span>
            <span style={{ fontSize: 11, color: "var(--g500)" }}>
              Sonraki taramada
            </span>
          </li>
        ))}
      </ul>

      {!locked && selected.length < 3 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Başka bir firma ekle (manuel)"
            value={manualInput}
            onChange={(e) => onManualChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAddManual();
            }}
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
            onClick={onAddManual}
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
        <span
          style={{
            fontSize: 13,
            color: "var(--g500)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          Seçilen: {selected.length}/3
        </span>
        <button
          onClick={onSubmit}
          disabled={disabled}
          style={{
            padding: "12px 24px",
            background: disabled ? "var(--g200)" : "var(--black)",
            color: disabled ? "var(--g400)" : "var(--white)",
            border: "none",
            borderRadius: 6,
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 600,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          Onayla ve Sonuçları Gör →
        </button>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// Adapter: RunResult → AnalysisResult (Scoreboard backward compat)
// ═══════════════════════════════════════════════════════════

function runResultToAnalysisResult(
  run: RunResult,
  selectedCompetitors: SelectedCompetitor[],
): AnalysisResult {
  const primaryCompetitor = selectedCompetitors[0];

  const queries: Query[] = run.queries.map((q) => ({
    id: q.id,
    text: q.text,
    answers: q.answers.map(
      (a): Answer => ({
        provider: a.provider,
        text: a.text,
        mentionedYou: a.mentionedYou,
        mentionedThem: selectedCompetitors.some((c) =>
          a.mentionedCompetitors.some(
            (m) =>
              m.toLowerCase().includes(c.name.toLowerCase()) ||
              c.name.toLowerCase().includes(m.toLowerCase()),
          ),
        ),
        yourRank: null,
      }),
    ),
  }));

  return {
    yourDomain: run.yourDomain,
    yourBrandName: run.yourBrandName,
    productName: "",
    competitorDomain: primaryCompetitor?.name ?? "",
    competitorBrandName: primaryCompetitor?.name ?? "Rakip",
    queries,
    audit: [],
    cached: run.cached,
    generatedAt: run.generatedAt,
  };
}
