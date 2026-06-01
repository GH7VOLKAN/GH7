import type { Section } from "@/lib/report/types";
import type { ReportLabels } from "@/lib/report/labels";
import { SectionTitle, Stagger, AnimatedNumber } from "@/components/kinde/animations";
import { PlatformLogo, getPlatformColor } from "@/components/kinde/ai-logos";

/** Normalize a display name to a logo/colour key the kinde helpers understand. */
function logoKey(name: string): string {
  const k = name.toLowerCase();
  if (k.includes("google") || k.includes("aio") || k.includes("serp")) return "google_aio";
  return name;
}

export function VisibilitySection({
  section,
  t,
}: {
  section: Extract<Section, { type: "visibility" }>;
  t: ReportLabels;
}) {
  return (
    <section>
      <SectionTitle title={section.title} />
      <Stagger className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {section.engines.map((e) => {
          const color = getPlatformColor(logoKey(e.name));
          const active = e.pct > 0;
          return (
            <div
              key={e.name}
              style={{
                background: "#fff",
                border: `1px solid ${active ? color + "55" : "#eee"}`,
                borderRadius: 20,
                padding: 24,
              }}
            >
              <PlatformLogo platform={logoKey(e.name)} size={36} mentioned={active} />
              <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: "#111" }}>
                {e.name}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: active ? "#111" : "#bbb",
                  letterSpacing: "-1px",
                  lineHeight: 1.1,
                }}
              >
                <AnimatedNumber value={Math.round(e.pct)} suffix="%" />
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                {e.avgPos != null ? `${t.avgPosition} ${e.avgPos.toFixed(1)}` : "—"}
              </div>
              {e.note && (
                <div style={{ fontSize: 12, color: "#999", marginTop: 6 }}>{e.note}</div>
              )}
            </div>
          );
        })}
      </Stagger>
    </section>
  );
}
