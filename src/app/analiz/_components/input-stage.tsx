"use client";

import { useState } from "react";
import s from "../analiz.module.css";
import type { AnalyzeInput, Door } from "@/lib/analiz/types";
import { DOOR_CONFIG, TARGET_COUNTRIES } from "@/lib/analiz/constants";

type Props = {
  door: Door;
  initialDomain?: string;
  onSubmit: (input: AnalyzeInput) => void;
};

export function InputStage({ door, initialDomain, onSubmit }: Props) {
  const config = DOOR_CONFIG[door];
  const [field1, setField1] = useState(initialDomain ?? "");
  const [field2, setField2] = useState("");
  const [countryCode, setCountryCode] = useState("DE");

  const canSubmit = (() => {
    if (door === "firma" || door === "eticaret") return field1.trim().length > 2;
    if (door === "kisi") return field1.trim().length > 2 && field2.trim().length > 1;
    if (door === "yurtdisi") return field1.trim().length > 2 && countryCode;
    return false;
  })();

  const submit = () => {
    if (!canSubmit) return;
    if (door === "firma" || door === "eticaret") {
      onSubmit({ door, domain: field1.trim() });
    } else if (door === "kisi") {
      onSubmit({ door, fullName: field1.trim(), city: field2.trim() });
    } else if (door === "yurtdisi") {
      const country = TARGET_COUNTRIES.find((c) => c.code === countryCode);
      onSubmit({
        door,
        domain: field1.trim(),
        targetMarket: country?.name ?? "hedef pazar",
        targetLanguage: country?.lang ?? "en",
      });
    }
  };

  return (
    <section className={s.screen}>
      <div className={s.screenLabel}>Ekran 1 · Bilgi Gir</div>
      <h2 className={s.h2}>{config.label} analizi başlatalım.</h2>
      <p className={s.sub}>
        Tek kural: doğru adres. Gerisini AI&apos;lar yerine biz tararız.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        <label style={{ fontSize: 12, color: "var(--g500)", letterSpacing: "0.06em" }}>
          {config.inputLabels[0].toUpperCase()}
        </label>
        <input
          type="text"
          value={field1}
          onChange={(e) => setField1(e.target.value)}
          placeholder={config.placeholder[0]}
          onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
          style={inputStyle}
          autoFocus
        />

        {config.inputLabels.length > 1 && door !== "yurtdisi" && (
          <>
            <label style={{ fontSize: 12, color: "var(--g500)", letterSpacing: "0.06em", marginTop: 8 }}>
              {config.inputLabels[1].toUpperCase()}
            </label>
            <input
              type="text"
              value={field2}
              onChange={(e) => setField2(e.target.value)}
              placeholder={config.placeholder[1]}
              onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
              style={inputStyle}
            />
          </>
        )}

        {door === "yurtdisi" && (
          <>
            <label style={{ fontSize: 12, color: "var(--g500)", letterSpacing: "0.06em", marginTop: 8 }}>
              HEDEF PAZAR
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              style={inputStyle}
            >
              {TARGET_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </>
        )}

        <button
          onClick={submit}
          disabled={!canSubmit}
          style={{
            marginTop: 24,
            padding: "14px 28px",
            background: canSubmit ? "var(--black)" : "var(--g200)",
            color: canSubmit ? "var(--white)" : "var(--g400)",
            border: "none",
            borderRadius: 8,
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 600,
            cursor: canSubmit ? "pointer" : "not-allowed",
            alignSelf: "flex-start",
          }}
        >
          Analiz Et →
        </button>
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "14px 16px",
  border: "1px solid var(--g300)",
  borderRadius: 8,
  fontFamily: "inherit",
  fontSize: 15,
  outline: "none",
  background: "var(--white)",
};
