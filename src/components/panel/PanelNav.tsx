"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GH7Logo } from "@/components/gh7-logo";
import { MARKETPLACE_META, type Marketplace } from "@/lib/panel-meta";

const MARKETPLACES: Marketplace[] = ["bionluk", "fiverr", "upwork", "own"];

export function PanelNav() {
  const params = useSearchParams();
  const active = params.get("m");

  return (
    <aside
      style={{
        width: 256,
        flexShrink: 0,
        background: "#fff",
        borderRight: "1px solid #eee",
        minHeight: "100vh",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <div style={{ padding: "0 8px 24px" }}>
        <GH7Logo size="default" />
      </div>

      <div style={labelStyle}>Ürünler</div>
      <Link href="/panel" style={itemStyle(!active)}>
        AI Görünürlük
      </Link>

      <div style={{ ...labelStyle, marginTop: 18 }}>Pazaryeri</div>
      {MARKETPLACES.map((m) => (
        <Link key={m} href={`/panel?m=${m}`} style={itemStyle(active === m)}>
          {MARKETPLACE_META[m]}
        </Link>
      ))}

      <form action="/panel/logout" method="post" style={{ marginTop: "auto" }}>
        <button type="submit" style={{ ...itemStyle(false), width: "100%", textAlign: "left", cursor: "pointer", border: "none", background: "transparent", color: "#999" }}>
          Çıkış
        </button>
      </form>
    </aside>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 2,
  color: "#bbb",
  padding: "0 8px 8px",
};

function itemStyle(isActive: boolean): React.CSSProperties {
  return {
    display: "block",
    padding: "9px 12px",
    borderRadius: 9999,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 2,
    textDecoration: "none",
    color: isActive ? "#fff" : "#555",
    background: isActive ? "#111" : "transparent",
  };
}
