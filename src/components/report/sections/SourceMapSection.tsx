import type { Section, SourceClass } from "@/lib/report/types";
import type { ReportLabels } from "@/lib/report/labels";
import { SectionTitle, Stagger, AnimBar } from "@/components/kinde/animations";

const KLASS_COLOR: Record<SourceClass, string> = {
  own: "#111111",
  comp: "#ef4444",
  neutral: "#9ca3af",
};

export function SourceMapSection({
  section,
  t,
}: {
  section: Extract<Section, { type: "sourceMap" }>;
  t: ReportLabels;
}) {
  const klassLabel: Record<SourceClass, string> = {
    own: t.sourceOwn,
    comp: t.sourceComp,
    neutral: t.sourceNeutral,
  };
  const max = section.sources.reduce((m, s) => Math.max(m, s.count), 0) || 1;

  return (
    <section>
      <SectionTitle title={section.title} />
      <Stagger className="flex flex-col gap-2">
        {section.sources.map((s, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 14,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span
              style={{
                width: 190,
                fontSize: 14,
                fontWeight: 600,
                color: "#111",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.domain}
            </span>
            <div style={{ flex: 1 }}>
              <AnimBar percent={(s.count / max) * 100} color={KLASS_COLOR[s.klass]} height={8} delay={i * 40} />
            </div>
            <span style={{ width: 70, textAlign: "right", fontSize: 13, color: "#666" }}>
              {s.count} {t.sourceCount}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: KLASS_COLOR[s.klass],
                background: KLASS_COLOR[s.klass] + "14",
                padding: "2px 8px",
                borderRadius: 9999,
                whiteSpace: "nowrap",
              }}
            >
              {klassLabel[s.klass]}
            </span>
          </div>
        ))}
      </Stagger>
    </section>
  );
}
