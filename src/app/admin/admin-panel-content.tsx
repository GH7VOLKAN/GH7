"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserItem {
  id: string;
  email: string;
  phone: string | null;
  fullName: string | null;
  plan: string;
  freeAuditUsed: boolean;
  createdAt: string;
  isAdmin: boolean;
  brands: Array<{ id: string; name: string; domain: string | null; isDefault: boolean }>;
}

interface ScanItem {
  id: string;
  status: string;
  type: string;
  startedAt: string;
  completedAt: string | null;
  resultCount: number;
  brandName: string;
  brandDomain: string;
}

interface Stats {
  totalUsers: number;
  totalBrands: number;
  totalAudits: number;
  totalScans: number;
  proUsers: number;
}

interface Props {
  stats: Stats;
  users: UserItem[];
  recentScans: ScanItem[];
}

interface ProviderPing {
  platform: string;
  available: boolean;
  ok: boolean;
  ms?: number;
  error?: string | null;
}

export function AdminPanelContent({ stats, users, recentScans }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderPing[] | null>(null);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    // İlk yüklemede otomatik ping
    pingProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pingProviders() {
    setPinging(true);
    try {
      const res = await fetch("/api/admin/actions/ping-providers");
      const data = await res.json();
      setProviders(data.providers ?? null);
    } catch {
      setProviders([]);
    } finally {
      setPinging(false);
    }
  }

  async function post(url: string, body?: Record<string, unknown>, label?: string) {
    const confirmed =
      !label ||
      label.startsWith("info:") ||
      window.confirm(`Onaylıyor musunuz?\n\n${label}`);
    if (!confirmed) return;

    setBusy(label ?? url);
    setMsg(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(`❌ Hata: ${data.error ?? res.statusText}`);
      } else {
        setMsg(`✅ Başarılı: ${JSON.stringify(data).slice(0, 200)}`);
        router.refresh();
      }
    } catch (err) {
      setMsg(`❌ Bağlantı hatası: ${err}`);
    } finally {
      setBusy(null);
    }
  }

  async function resetUser(userId: string) {
    await post(
      "/api/admin/actions/reset-user",
      { userId },
      `Kullanıcıyı sıfırla (freeAuditUsed=false): ${userId.slice(0, 8)}`,
    );
  }

  async function deleteBrand(brandId: string) {
    await post(
      "/api/admin/actions/delete-brand",
      { brandId },
      `BRAND SİL — geri alınamaz: ${brandId.slice(0, 8)}`,
    );
  }

  async function deleteUser(userId: string) {
    await post(
      "/api/admin/actions/delete-user",
      { userId },
      `KULLANICI SİL — geri alınamaz: ${userId.slice(0, 8)}`,
    );
  }

  async function clearCache() {
    await post("/api/admin/actions/clear-cache", undefined, "Tüm Redis cache temizle");
  }

  async function resetAllUsers() {
    await post(
      "/api/admin/actions/reset-all-users",
      undefined,
      "Admin hariç TÜM kullanıcıları sıfırla (freeAuditUsed=false)",
    );
  }

  async function resetDatabase() {
    const confirmText = window.prompt(
      'TEHLİKELİ: Tüm non-admin veriler silinecek.\nOnaylamak için "EVET SIFIRLA" yazın:',
    );
    if (confirmText !== "EVET SIFIRLA") {
      setMsg("❌ Onay yanlış, işlem iptal edildi");
      return;
    }
    setBusy("reset-db");
    setMsg(null);
    try {
      const res = await fetch("/api/admin/actions/reset-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "EVET SIFIRLA" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(`❌ ${data.error}`);
      } else {
        setMsg(
          `✅ ${data.deletedProfiles} profile silindi, ${data.adminPreserved} admin korundu`,
        );
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  async function cleanupStuckScans() {
    await post(
      "/api/admin/actions/cleanup-stuck-scans",
      undefined,
      "10+ dakikadır running olan scan'leri temizle",
    );
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        fontFamily:
          '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
        color: "#111",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>
        GH7 Admin
      </h1>

      {msg && (
        <div
          style={{
            padding: 12,
            background: "#F7F7F7",
            border: "1px solid #E8E8E8",
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 13,
            fontFamily: "ui-monospace, monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {msg}
        </div>
      )}

      {/* SİSTEM DURUMU */}
      <Section title="Sistem Durumu">
        <StatRow label="Toplam kullanıcı" value={stats.totalUsers} />
        <StatRow label="Toplam brand" value={stats.totalBrands} />
        <StatRow label="Toplam audit (GeoAudit)" value={stats.totalAudits} />
        <StatRow label="Toplam scan" value={stats.totalScans} />
        <StatRow label="Pro üye" value={stats.proUsers} />
      </Section>

      {/* API DURUMU */}
      <Section
        title="API Durumu"
        action={
          <button onClick={pingProviders} disabled={pinging} style={btnSmall}>
            {pinging ? "Ping atılıyor..." : "Yeniden ping"}
          </button>
        }
      >
        {!providers ? (
          <div style={{ fontSize: 13, color: "#888" }}>Yükleniyor...</div>
        ) : (
          providers.map((p) => (
            <div
              key={p.platform}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #F3F3F3",
                fontSize: 13,
              }}
            >
              <span style={{ fontWeight: 600 }}>{p.platform}</span>
              <span style={{ color: p.ok ? "#111" : "#888" }}>
                {p.ok ? `✓ çalışıyor (${p.ms}ms)` : `✗ ${p.error ?? "yanıt yok"}`}
              </span>
            </div>
          ))
        )}
      </Section>

      {/* KULLANICILAR */}
      <Section title={`Kullanıcılar (${users.length})`}>
        {users.map((u) => (
          <div
            key={u.id}
            style={{
              padding: "12px 0",
              borderBottom: "1px solid #F3F3F3",
              fontSize: 13,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <strong>{u.fullName || u.email}</strong>
                {u.isAdmin && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 10,
                      padding: "1px 6px",
                      background: "#111",
                      color: "#fff",
                      borderRadius: 3,
                    }}
                  >
                    ADMIN
                  </span>
                )}
                <span style={{ marginLeft: 8, color: "#888", fontSize: 11 }}>
                  · {u.phone || "no phone"} · {u.plan}
                  {u.freeAuditUsed ? " · audit kullanıldı" : ""}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => resetUser(u.id)} style={btnSmall} disabled={busy !== null}>
                  Sıfırla
                </button>
                {!u.isAdmin && (
                  <button
                    onClick={() => deleteUser(u.id)}
                    style={btnDanger}
                    disabled={busy !== null}
                  >
                    Kullanıcı Sil
                  </button>
                )}
              </div>
            </div>
            {u.brands.length > 0 && (
              <div style={{ paddingLeft: 12, color: "#666", fontSize: 12 }}>
                {u.brands.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                    }}
                  >
                    <span>
                      {b.name} ({b.domain || "no domain"})
                      {b.isDefault && (
                        <span style={{ marginLeft: 6, color: "#000", fontWeight: 600 }}>
                          · default
                        </span>
                      )}
                    </span>
                    <button onClick={() => deleteBrand(b.id)} style={btnDanger} disabled={busy !== null}>
                      Brand Sil
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </Section>

      {/* SON SCANLER */}
      <Section
        title={`Son Scan'ler (${recentScans.length})`}
        action={
          <button onClick={cleanupStuckScans} style={btnSmall} disabled={busy !== null}>
            Stuck Scan Temizle
          </button>
        }
      >
        {recentScans.map((s) => {
          const elapsed = s.completedAt
            ? new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()
            : Date.now() - new Date(s.startedAt).getTime();
          const secs = Math.round(elapsed / 1000);
          return (
            <div
              key={s.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #F3F3F3",
                fontSize: 12,
              }}
            >
              <span>
                <strong>{s.brandName}</strong>{" "}
                <span style={{ color: "#888" }}>({s.brandDomain})</span>
                {" · "}
                {new Date(s.startedAt).toLocaleString("tr-TR")}
              </span>
              <span style={{ color: s.status === "completed" ? "#111" : "#888" }}>
                {s.status} · {s.resultCount} sonuç · {secs}s
              </span>
            </div>
          );
        })}
      </Section>

      {/* HIZLI İŞLEMLER */}
      <Section title="Hızlı İşlemler">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={clearCache} style={btnFull} disabled={busy !== null}>
            Tüm Redis Cache Temizle
          </button>
          <button onClick={resetAllUsers} style={btnFull} disabled={busy !== null}>
            Tüm Kullanıcıları Sıfırla (freeAuditUsed=false)
          </button>
          <button onClick={resetDatabase} style={btnFullDanger} disabled={busy !== null}>
            Tüm Veritabanını Sıfırla (admin hariç)
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#666" }}>
          {title}
        </h2>
        {action}
      </div>
      <div
        style={{
          padding: 16,
          border: "1px solid #E8E8E8",
          borderRadius: 12,
          background: "#fff",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: "1px solid #F3F3F3",
        fontSize: 13,
      }}
    >
      <span style={{ color: "#666" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const btnSmall: React.CSSProperties = {
  padding: "6px 12px",
  background: "#fff",
  color: "#111",
  border: "1px solid #111",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};
const btnDanger: React.CSSProperties = {
  ...btnSmall,
  borderColor: "#C62828",
  color: "#C62828",
};
const btnFull: React.CSSProperties = {
  padding: "10px 20px",
  background: "#111",
  color: "#fff",
  border: 0,
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};
const btnFullDanger: React.CSSProperties = {
  ...btnFull,
  background: "#C62828",
};
