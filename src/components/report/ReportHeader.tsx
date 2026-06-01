/* eslint-disable @next/next/no-img-element */
import type { Report } from "@/lib/report/types";

export function ReportHeader({ report }: { report: Report }) {
  const d = new Date(report.date);
  const dateStr = isNaN(d.getTime())
    ? report.date
    : d.toLocaleDateString(report.lang === "tr" ? "tr-TR" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <header style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {report.logoUrl && (
        <img
          src={report.logoUrl}
          alt={report.brand}
          style={{ height: 44, width: "auto", maxWidth: 160, borderRadius: 8, objectFit: "contain" }}
        />
      )}
      <div>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 3, color: "#bbb" }}>
          {report.product}
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px", color: "#111", lineHeight: 1.1 }}>
          {report.brand}
        </h1>
        <div style={{ fontSize: 13, color: "#999", marginTop: 2 }}>{dateStr}</div>
      </div>
    </header>
  );
}
