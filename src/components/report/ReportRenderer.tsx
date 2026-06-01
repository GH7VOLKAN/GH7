"use client";

import type { ReactNode } from "react";
import type { Report, Section } from "@/lib/report/types";
import { labels, type ReportLabels } from "@/lib/report/labels";
import { PageSection } from "@/components/kinde/animations";
import { ReportHeader } from "./ReportHeader";
import { SummarySection } from "./sections/SummarySection";
import { VisibilitySection } from "./sections/VisibilitySection";
import { CompetitorsSection } from "./sections/CompetitorsSection";
import { SourceMapSection } from "./sections/SourceMapSection";
import { GapsSection } from "./sections/GapsSection";

/**
 * Product-agnostic report renderer. Maps section.type -> component.
 * A new product = a new engine that emits the same Report shape; this
 * renderer never changes.
 */
export function ReportRenderer({ report }: { report: Report }) {
  const t = labels[report.lang];
  return (
    <div
      style={{
        background: "#fafafa",
        minHeight: "100vh",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "48px 20px 80px" }}>
        <ReportHeader report={report} />
        <div style={{ display: "flex", flexDirection: "column", gap: 56, marginTop: 40 }}>
          {report.sections.map((section, i) => (
            <PageSection key={i}>{renderSection(section, t)}</PageSection>
          ))}
        </div>
        <footer style={{ marginTop: 64, textAlign: "center", fontSize: 12, color: "#bbb" }}>
          {t.poweredBy}
        </footer>
      </div>
    </div>
  );
}

function renderSection(section: Section, t: ReportLabels): ReactNode {
  switch (section.type) {
    case "summary":
      return <SummarySection section={section} />;
    case "visibility":
      return <VisibilitySection section={section} t={t} />;
    case "competitors":
      return <CompetitorsSection section={section} t={t} />;
    case "sourceMap":
      return <SourceMapSection section={section} t={t} />;
    case "gaps":
      return <GapsSection section={section} t={t} />;
    default: {
      const _exhaustive: never = section;
      void _exhaustive;
      return null;
    }
  }
}
