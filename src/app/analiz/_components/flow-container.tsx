"use client";

import { useState, useCallback } from "react";
import s from "../analiz.module.css";
import type { AnalyzeInput, AnalyzeResult, Door, FlowPhase, SelectedCompetitor } from "@/lib/analiz/types";
import { InputStage } from "./input-stage";
import { AnalyzingStage } from "./analyzing-stage";
import { ResultStage } from "./result-stage";
import { PhoneVerifyModal } from "./phone-verify-modal";

type Props = {
  initialDoor: Door;
  initialDomain?: string;
};

export function FlowContainer({ initialDoor, initialDomain }: Props) {
  const [phase, setPhase] = useState<FlowPhase>("input");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState<AnalyzeInput | null>(null);

  const runAnalyze = useCallback(
    async (input: AnalyzeInput, profileId: string) => {
      setPhase("analyzing");
      setError(null);

      try {
        const res = await fetch("/api/analiz/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...input, profileId }),
        });

        if (!res.ok) {
          const errBody = await res
            .json()
            .catch(() => ({ error: "Bilinmeyen hata" }));
          throw new Error(errBody.error || `Sunucu hatası (${res.status})`);
        }

        const data = (await res.json()) as AnalyzeResult;
        setResult(data);
        setPhase("result");
      } catch (e) {
        setError((e as Error).message);
        setPhase("error");
      }
    },
    [],
  );

  const onSubmit = useCallback((input: AnalyzeInput) => {
    setCurrentInput(input);
    setPhase("verifying");
    setError(null);
  }, []);

  const onVerified = useCallback(
    (profileId: string) => {
      if (!currentInput) return;
      void runAnalyze(currentInput, profileId);
    },
    [currentInput, runAnalyze],
  );

  const onVerifyCancel = useCallback(() => {
    setPhase("input");
  }, []);

  const onFinalize = useCallback((selected: SelectedCompetitor[]) => {
    // TODO: POST to /api/analiz/finalize veya dashboard'a yönlendir
    console.log("Selected competitors:", selected);
    alert(`${selected.length} rakip kaydedildi. Dashboard entegrasyonu sonraki iş.`);
  }, []);

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
      {(phase === "input" || phase === "verifying") && (
        <InputStage
          door={initialDoor}
          initialDomain={initialDomain}
          onSubmit={onSubmit}
        />
      )}

      {phase === "verifying" && currentInput && (
        <PhoneVerifyModal
          domain={currentInput.domain || ""}
          onVerified={onVerified}
          onCancel={onVerifyCancel}
        />
      )}

      {phase === "analyzing" && (
        <AnalyzingStage firmDomain={currentInput?.domain} />
      )}

      {phase === "result" && result && (
        <ResultStage result={result} onFinalize={onFinalize} />
      )}
    </>
  );
}
