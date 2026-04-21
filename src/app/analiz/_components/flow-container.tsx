"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import s from "../analiz.module.css";
import type {
  AnalysisResult,
  Competitor,
  DetectResult,
  Door,
  FlowPhase,
  Product,
  ProgressStep,
} from "@/lib/analiz/types";
import { AI_PROVIDERS, AI_PROVIDER_LABELS } from "@/lib/analiz/types";
import { DetectingStrip } from "./detecting-strip";
import { ProductPicker } from "./product-picker";
import { CompetitorPicker } from "./competitor-picker";
import { AnalyzingProgress } from "./analyzing-progress";
import { Scoreboard } from "./scoreboard";
import { AuditReport } from "./audit-report";
import { ProGate } from "./pro-gate";

type Props = {
  domain: string;
  door: Door;
  forceRefresh?: boolean;
};

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

/**
 * Orkestra. 4 faz: detecting → picking → analyzing → done.
 */
export function FlowContainer({ domain, door, forceRefresh }: Props) {
  const [phase, setPhase] = useState<FlowPhase>("detecting");
  const [detected, setDetected] = useState<DetectResult | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(buildInitialSteps());
  const [generatedQueries, setGeneratedQueries] = useState<string[]>([]);

  const hasRequestedDetect = useRef(false);

  // --- Auto scroll into newly mounted screen ---
  const detectRef = useRef<HTMLDivElement | null>(null);
  const pickingRef = useRef<HTMLDivElement | null>(null);
  const competitorRef = useRef<HTMLDivElement | null>(null);
  const analyzingRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // ---------- Faz 1: detect ----------
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
        setPhase("picking");
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

  // ---------- Faz 2: product pick → competitor pick → analyze ----------
  const onProductSelect = useCallback((p: Product) => {
    setSelectedProduct(p);
    setSelectedCompetitor(null);
    setTimeout(() => competitorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, []);

  const startAnalysis = useCallback(
    async (competitor: Competitor, product: Product) => {
      setPhase("analyzing");
      setProgressSteps(buildInitialSteps());
      setGeneratedQueries([]);

      // Fake progress animation — gerçekte API SSE veya polling döndürürse buraya bağlanır
      const FAKE_QUERIES = [
        "en iyi yerden ısıtma markaları Türkiye",
        "yerden ısıtma hangi marka daha sağlam",
        "ısıtma kablosu PEX borusu tavsiye",
        "villa zemin ısıtma sistemi kurulum",
        "yerden ısıtma fiyat karşılaştırma 2026",
      ];

      // Step 0: sorgular üretiliyor → üretildi
      setTimeout(() => {
        setGeneratedQueries(FAKE_QUERIES);
        setProgressSteps((prev) =>
          prev.map((st, i) =>
            i === 0
              ? { ...st, status: "done", detail: `${FAKE_QUERIES.length} soru` }
              : i === 1
                ? { ...st, status: "running", label: `${AI_PROVIDER_LABELS[AI_PROVIDERS[0]]} · çalışıyor` }
                : st,
          ),
        );
      }, 800);

      // Her AI provider sırayla 600-900ms içinde tamamlanır
      AI_PROVIDERS.forEach((prov, idx) => {
        setTimeout(
          () => {
            setProgressSteps((prev) =>
              prev.map((st, i) => {
                if (i === idx + 1) return { ...st, status: "done", detail: "tamam" };
                if (i === idx + 2 && i < prev.length)
                  return {
                    ...st,
                    status: "running",
                    label: `${AI_PROVIDER_LABELS[AI_PROVIDERS[idx + 1]]} · çalışıyor`,
                  };
                return st;
              }),
            );
          },
          1200 + idx * 700,
        );
      });

      // Gerçek API çağrısı paralel başlar; progress animasyonu UX için
      try {
        const res = await fetch("/api/analiz/run", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            yourDomain: domain,
            productId: product.id,
            productName: product.name,
            competitorDomain: competitor.domain,
            forceRefresh: forceRefresh ?? false,
          }),
        });
        if (!res.ok) throw new Error(`Analiz başarısız (${res.status})`);
        const data = (await res.json()) as AnalysisResult;

        // Progress'in bitmesini beklemeden sonuçları hazır tut, min 5sn UX
        const minWait = new Promise((r) => setTimeout(r, 5000));
        await minWait;
        setAnalysis(data);
        setPhase("done");
      } catch (e) {
        setError((e as Error).message);
        setPhase("error");
      }
    },
    [domain, forceRefresh],
  );

  const onCompetitorSelect = useCallback(
    (c: Competitor) => {
      if (!selectedProduct) return;
      setSelectedCompetitor(c);
      void startAnalysis(c, selectedProduct);
    },
    [selectedProduct, startAnalysis],
  );

  // Auto scroll when phase changes
  useEffect(() => {
    if (phase === "analyzing") {
      setTimeout(() => analyzingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
    if (phase === "done") {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }, [phase]);

  // ---------- Render ----------
  if (phase === "error") {
    return (
      <div className={s.errorBox}>
        <strong>Analiz çalıştırılamadı.</strong>
        <br />
        {error ?? "Bilinmeyen hata."} Tekrar denemek için sayfayı yenile.
      </div>
    );
  }

  return (
    <>
      <div ref={detectRef}>
        <DetectingStrip
          domain={domain}
          sector={detected?.sector}
        />
      </div>

      {detected && (
        <div ref={pickingRef}>
          <ProductPicker
            products={detected.products}
            selectedId={selectedProduct?.id ?? null}
            onSelect={onProductSelect}
          />
        </div>
      )}

      {detected && selectedProduct && (
        <div ref={competitorRef}>
          <CompetitorPicker
            productName={selectedProduct.name}
            competitors={detected.competitorsByProductId[selectedProduct.id] ?? []}
            selectedId={selectedCompetitor?.id ?? null}
            onSelect={onCompetitorSelect}
          />
        </div>
      )}

      {phase === "analyzing" && (
        <div ref={analyzingRef}>
          <AnalyzingProgress
            steps={progressSteps}
            generatedQueries={generatedQueries}
          />
        </div>
      )}

      {phase === "done" && analysis && (
        <div ref={resultsRef}>
          <Scoreboard analysis={analysis} />
          <AuditReport analysis={analysis} />
          <ProGate productName={analysis.productName} />
        </div>
      )}
    </>
  );
}
