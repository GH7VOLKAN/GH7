import type { Section } from "@/lib/report/types";
import type { ReportLabels } from "@/lib/report/labels";
import { SectionTitle, Stagger } from "@/components/kinde/animations";

export function CompetitorsSection({
  section,
  t,
}: {
  section: Extract<Section, { type: "competitors" }>;
  t: ReportLabels;
}) {
  return (
    <section>
      <SectionTitle title={section.title} />
      <Stagger className="flex flex-col gap-2.5">
        {section.rows.map((r, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 16,
              padding: "16px 20px",
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{r.name}</span>
            {r.where && (
              <span style={{ fontSize: 12, color: "#888" }}>
                {t.competitorsWhere}: {r.where}
              </span>
            )}
            {r.note && (
              <span style={{ fontSize: 13, color: "#666", flexBasis: "100%" }}>{r.note}</span>
            )}
          </div>
        ))}
      </Stagger>
    </section>
  );
}
