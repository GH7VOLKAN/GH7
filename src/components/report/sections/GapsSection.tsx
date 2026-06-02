"use client";

import { useState } from "react";
import type { GapItem, Section } from "@/lib/report/types";
import type { ReportLabels } from "@/lib/report/labels";
import { SectionTitle } from "@/components/kinde/animations";
import { CopyButton } from "../CopyButton";

export function GapsSection({
  section,
  t,
}: {
  section: Extract<Section, { type: "gaps" }>;
  t: ReportLabels;
}) {
  return (
    <section>
      <SectionTitle title={section.title} />
      <div className="flex flex-col gap-3">
        {section.items.map((item, i) => (
          <GapCard key={i} item={item} t={t} priority={i + 1} defaultOpen={i === 0} />
        ))}
      </div>
    </section>
  );
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  color: "#bbb",
  marginBottom: 8,
};

function GapCard({
  item,
  t,
  priority,
  defaultOpen,
}: {
  item: GapItem;
  t: ReportLabels;
  priority: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 20, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            background: "#111",
            borderRadius: 9999,
            padding: "3px 9px",
            whiteSpace: "nowrap",
          }}
        >
          Öncelik {priority}
        </span>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#111", lineHeight: 1.4 }}>
          {item.query}
        </span>
        <span style={{ fontSize: 22, color: "#bbb", lineHeight: 1 }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <div style={LABEL_STYLE}>{t.gapWhyLosing}</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#555" }}>{item.diagnosis}</p>
          </div>

          {item.contentGap.length > 0 && (
            <div>
              <div style={LABEL_STYLE}>{t.gapAddThis}</div>
              <ul style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 18, margin: 0 }}>
                {item.contentGap.map((g, i) => (
                  <li key={i} style={{ fontSize: 14, lineHeight: 1.5, color: "#555" }}>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.faq.length > 0 && (
            <div>
              <div style={LABEL_STYLE}>{t.gapFaq}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {item.faq.map((f, i) => (
                  <div
                    key={i}
                    style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 12, padding: 14 }}
                  >
                    <div style={{ display: "flex", alignItems: "start", gap: 10 }}>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#111" }}>{f.q}</span>
                      <CopyButton text={`${f.q}\n${f.a}`} copyLabel={t.copy} copiedLabel={t.copied} />
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: "#666", marginTop: 6 }}>{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.jsonLd && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ ...LABEL_STYLE, marginBottom: 0 }}>{t.gapSchema}</span>
                <CopyButton text={item.jsonLd} copyLabel={t.copy} copiedLabel={t.copied} />
              </div>
              <pre
                style={{
                  background: "#0f172a",
                  color: "#e2e8f0",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 12,
                  lineHeight: 1.5,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                <code>{item.jsonLd}</code>
              </pre>
            </div>
          )}

          {item.actions.length > 0 && (
            <div>
              <div style={LABEL_STYLE}>{t.gapActions}</div>
              <ol style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 18, margin: 0 }}>
                {item.actions.map((a, i) => (
                  <li key={i} style={{ fontSize: 14, lineHeight: 1.5, color: "#555" }}>
                    {a}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
