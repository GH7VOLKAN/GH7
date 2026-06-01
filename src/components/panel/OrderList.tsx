import Link from "next/link";
import { STATUS_META, MARKETPLACE_META, type OrderRow } from "@/lib/operator-data";

export function OrderList({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return (
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 28, textAlign: "center", color: "#999", fontSize: 14 }}>
        Henüz sipariş yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {orders.map((o) => {
        const s = STATUS_META[o.status];
        const date = new Date(o.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
        return (
          <div
            key={o.id}
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 16,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{o.clientName}</div>
              {o.domain && <div style={{ fontSize: 12, color: "#999" }}>{o.domain}</div>}
            </div>

            <span style={pillStyle}>
              {o.tierName} · {o.promptCount} prompt
            </span>

            <span style={{ fontSize: 12, color: "#888", width: 90 }}>{MARKETPLACE_META[o.marketplace]}</span>

            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: s.color,
                background: s.bg,
                padding: "4px 10px",
                borderRadius: 9999,
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </span>

            <span style={{ fontSize: 12, color: "#bbb", width: 96, textAlign: "right" }}>{date}</span>

            {o.reportToken && (
              <Link href={`/${o.reportToken}`} target="_blank" style={{ fontSize: 13, fontWeight: 600, color: "#111", textDecoration: "none" }}>
                Rapor →
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

const pillStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#555",
  background: "#f5f5f5",
  padding: "4px 10px",
  borderRadius: 9999,
  whiteSpace: "nowrap",
};
