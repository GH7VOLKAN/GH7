"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { STATUS_META, MARKETPLACE_META, type OrderRow, type OrderStatus } from "@/lib/panel-meta";
import { runOrder } from "@/app/panel/(app)/actions";

const IN_PROGRESS: OrderStatus[] = ["intake", "running", "analyzing"];

const PIPELINE: { key: string; label: string; statuses: OrderStatus[] }[] = [
  { key: "intake", label: "Intake", statuses: ["intake"] },
  { key: "run", label: "Çalıştır", statuses: ["running"] },
  { key: "gap", label: "Gap analizi", statuses: ["analyzing"] },
  { key: "report", label: "Rapor", statuses: ["report"] },
  { key: "deliver", label: "Teslim", statuses: ["delivered"] },
];

const STATUS_ORDER: OrderStatus[] = ["new", "intake", "running", "analyzing", "report", "delivered"];

export function OrdersView({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = orders.find((o) => o.id === selectedId) ?? null;

  // While any order is mid-run, poll for status so the pipeline animates live.
  useEffect(() => {
    if (!orders.some((o) => IN_PROGRESS.includes(o.status))) return;
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [orders, router]);

  if (orders.length === 0) {
    return (
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 28, textAlign: "center", color: "#999", fontSize: 14 }}>
        Henüz sipariş yok.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {orders.map((o) => {
          const s = STATUS_META[o.status];
          const date = new Date(o.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelectedId(o.id)}
              style={{
                textAlign: "left",
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 16,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
                cursor: "pointer",
              }}
            >
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{o.clientName}</div>
                {o.domain && <div style={{ fontSize: 12, color: "#999" }}>{o.domain}</div>}
              </div>
              <span style={pill}>{o.tierName} · {o.promptCount} prompt</span>
              <span style={{ fontSize: 12, color: "#888", width: 90 }}>{MARKETPLACE_META[o.marketplace]}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, padding: "4px 10px", borderRadius: 9999, whiteSpace: "nowrap" }}>{s.label}</span>
              <span style={{ fontSize: 12, color: "#bbb", width: 96, textAlign: "right" }}>{date}</span>
            </button>
          );
        })}
      </div>

      {selected && <OrderDrawer order={selected} onClose={() => setSelectedId(null)} />}
    </>
  );
}

function OrderDrawer({ order, onClose }: { order: OrderRow; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const inProgress = IN_PROGRESS.includes(order.status);
  const token = order.reportToken;

  function onRun() {
    setError(null);
    startTransition(async () => {
      const res = await runOrder(order.id);
      if ("error" in res) setError(res.error);
    });
  }
  const competitors = Array.isArray(order.intake?.competitors)
    ? (order.intake!.competitors as unknown[]).map(String)
    : [];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
      <div
        style={{
          position: "relative",
          width: 440,
          maxWidth: "100%",
          background: "#fff",
          height: "100%",
          overflowY: "auto",
          padding: 28,
          boxShadow: "-8px 0 30px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#111" }}>{order.clientName}</h2>
            {order.domain && <div style={{ fontSize: 13, color: "#999" }}>{order.domain}</div>}
          </div>
          <button type="button" onClick={onClose} style={{ fontSize: 22, color: "#bbb", background: "none", border: "none", cursor: "pointer" }}>×</button>
        </div>

        {/* Intake */}
        <div style={sectionLabel}>Intake</div>
        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: 13, margin: 0 }}>
          <Row k="Paket" v={`${order.tierName} · ${order.promptCount} prompt`} />
          <Row k="Pazaryeri" v={MARKETPLACE_META[order.marketplace]} />
          <Row k="Coğrafya" v={order.geography ?? "—"} />
          <Row k="Kitle" v={order.audience ?? "—"} />
          <Row k="Rapor dili" v={order.reportLang} />
          <Row k="White-label" v={order.whiteLabel ? "Evet" : "Hayır"} />
          <Row k="Rakipler" v={competitors.length ? competitors.join(", ") : "—"} />
        </dl>

        {/* Pipeline */}
        <div style={sectionLabel}>Üretim hattı</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PIPELINE.map((step) => {
            const stepIdx = STATUS_ORDER.indexOf(step.statuses[0]);
            const state = currentIdx > stepIdx ? "done" : currentIdx === stepIdx ? "current" : "pending";
            const color = state === "done" ? "#22c55e" : state === "current" ? "#f59e0b" : "#d1d5db";
            return (
              <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: 9999, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                  {state === "done" ? "✓" : ""}
                </span>
                <span style={{ fontSize: 14, fontWeight: state === "current" ? 700 : 500, color: state === "pending" ? "#aaa" : "#111" }}>{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          {token && (
            <a href={`/${token}`} target="_blank" rel="noreferrer" style={primaryBtn}>
              Raporu aç →
            </a>
          )}
          {order.status !== "delivered" && (
            <button
              type="button"
              onClick={onRun}
              disabled={isPending || inProgress}
              style={{
                ...(token ? secondaryBtn : primaryBtn),
                opacity: isPending || inProgress ? 0.6 : 1,
                cursor: isPending || inProgress ? "default" : "pointer",
              }}
            >
              {inProgress
                ? "Çalışıyor…"
                : isPending
                  ? "Kuyruğa alınıyor…"
                  : token
                    ? "Yeniden çalıştır"
                    : "Çalıştır"}
            </button>
          )}
          {inProgress && (
            <div style={{ fontSize: 12, color: "#888" }}>
              Arka planda çalışıyor — sekmeyi kapatabilirsin, durum otomatik güncellenir.
            </div>
          )}
          {error && <div style={{ fontSize: 12, color: "#ef4444" }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt style={{ color: "#999" }}>{k}</dt>
      <dd style={{ margin: 0, color: "#111", fontWeight: 500 }}>{v}</dd>
    </>
  );
}

const pill: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#555", background: "#f5f5f5", padding: "4px 10px", borderRadius: 9999, whiteSpace: "nowrap" };
const sectionLabel: React.CSSProperties = { fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#bbb", margin: "26px 0 12px" };
const primaryBtn: React.CSSProperties = { display: "block", textAlign: "center", padding: "11px 16px", borderRadius: 9999, background: "#111", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", border: "none", cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { display: "block", textAlign: "center", padding: "11px 16px", borderRadius: 9999, background: "#fff", color: "#111", fontSize: 14, fontWeight: 600, border: "1px solid #e5e5e5", cursor: "pointer" };
