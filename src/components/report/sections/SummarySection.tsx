import type { Section } from "@/lib/report/types";
import { SectionTitle } from "@/components/kinde/animations";

export function SummarySection({
  section,
}: {
  section: Extract<Section, { type: "summary" }>;
}) {
  const paragraphs = section.body.split(/\n\n+/).filter(Boolean);
  return (
    <section>
      <SectionTitle title={section.title} />
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "#444",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}
