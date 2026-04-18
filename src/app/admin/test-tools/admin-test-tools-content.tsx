"use client";

import { useState } from "react";
import {
  UserX,
  Trash2,
  PlayCircle,
  Users,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface Props {
  adminEmail: string;
}

type Toast = { type: "success" | "error"; message: string } | null;

export function AdminTestToolsContent({ adminEmail: _adminEmail }: Props) {
  const [toast, setToast] = useState<Toast>(null);

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertTriangle className="size-4" />
          )}
          {toast.message}
        </div>
      )}

      <ResetUserTool showToast={showToast} />
      <ClearCacheTool showToast={showToast} />
      <UserListTool />
      <TestAuditTool showToast={showToast} />
    </div>
  );
}

/* -------------------------------------------------- */
/*  Reset User — freeAuditUsed=false                   */
/* -------------------------------------------------- */
function ResetUserTool({ showToast }: { showToast: (t: Toast) => void }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const handleReset = async () => {
    if (!input.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/test-tools/reset-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast({
          type: "success",
          message: `Sıfırlandı: ${data.email || data.phone} (freeAuditUsed=false)`,
        });
        setInput("");
      } else {
        showToast({ type: "error", message: data.error || "Hata" });
      }
    } catch {
      showToast({ type: "error", message: "Ağ hatası" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <UserX className="size-5 text-gray-700" />
        <h2 className="font-semibold text-gray-900">Kullanıcıyı Sıfırla</h2>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Verilen telefon/e-postanın <code>freeAuditUsed</code> flag&apos;ini
        false yapar — yeniden analiz yapabilir.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="volkan@isitmax.com veya 05321234567"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 outline-none"
        />
        <button
          type="button"
          onClick={handleReset}
          disabled={busy || !input.trim()}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Sıfırla"}
        </button>
      </div>
    </section>
  );
}

/* -------------------------------------------------- */
/*  Clear Cache                                        */
/* -------------------------------------------------- */
function ClearCacheTool({ showToast }: { showToast: (t: Toast) => void }) {
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);

  const handleClear = async (mode: "domain" | "all") => {
    if (mode === "domain" && !domain.trim()) return;
    setBusy(true);
    try {
      const body =
        mode === "domain"
          ? { domain: domain.trim() }
          : { action: "clear-all-legacy" };
      const res = await fetch("/api/admin/cache/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        const count = data.totalDeleted ?? data.deleted?.length ?? "?";
        showToast({
          type: "success",
          message: `Cache temizlendi (${count} anahtar)`,
        });
        if (mode === "domain") setDomain("");
      } else {
        showToast({ type: "error", message: data.error || "Hata" });
      }
    } catch {
      showToast({ type: "error", message: "Ağ hatası" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <Trash2 className="size-5 text-gray-700" />
        <h2 className="font-semibold text-gray-900">Cache Temizle</h2>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Belirli bir domain için veya tüm eski cache pattern&apos;lerini
        (<code>website-analysis:*</code>, <code>discovery-*</code>,{" "}
        <code>queries-fast:*</code>, <code>audit:*</code>) temizler.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="idavilla.com.tr"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 outline-none"
        />
        <button
          type="button"
          onClick={() => handleClear("domain")}
          disabled={busy || !domain.trim()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Domain
        </button>
        <button
          type="button"
          onClick={() => handleClear("all")}
          disabled={busy}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Tümünü Temizle"}
        </button>
      </div>
    </section>
  );
}

/* -------------------------------------------------- */
/*  User List                                          */
/* -------------------------------------------------- */
interface UserRow {
  id: string;
  email: string;
  phone: string | null;
  freeAuditUsed: boolean;
  freeAuditUsedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

function UserListTool() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/test-tools/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users ?? []);
      }
    } finally {
      setBusy(false);
    }
  };

  const filtered = users?.filter((u) => {
    if (!filter) return true;
    const f = filter.toLowerCase();
    return (
      u.email.toLowerCase().includes(f) ||
      u.phone?.toLowerCase().includes(f)
    );
  });

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-gray-700" />
          <h2 className="font-semibold text-gray-900">Kullanıcı Listesi</h2>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={busy}
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {busy ? "Yükleniyor..." : users ? "Yenile" : "Yükle"}
        </button>
      </div>

      {users && (
        <>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="E-posta veya telefon filtrele..."
            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 outline-none"
          />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-2 py-2">E-posta</th>
                  <th className="px-2 py-2">Telefon</th>
                  <th className="px-2 py-2">Free Used</th>
                  <th className="px-2 py-2">Son Giriş</th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-2 py-2 font-medium text-gray-900">
                      {u.email}
                    </td>
                    <td className="px-2 py-2 text-gray-600">
                      {u.phone ?? "—"}
                    </td>
                    <td className="px-2 py-2">
                      {u.freeAuditUsed ? (
                        <span className="text-red-700">✓ kullanıldı</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-500">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString("tr-TR")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-500">
              Toplam: {filtered?.length ?? 0} kullanıcı
            </p>
          </div>
        </>
      )}
    </section>
  );
}

/* -------------------------------------------------- */
/*  Test Audit                                         */
/* -------------------------------------------------- */
function TestAuditTool({ showToast }: { showToast: (t: Toast) => void }) {
  const [url, setUrl] = useState("");
  const [brand, setBrand] = useState("");
  const [busy, setBusy] = useState(false);

  const handleRun = async () => {
    if (!url.trim() || !brand.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/analiz/run-audit-43", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          brandName: brand.trim(),
          userType: "firma",
          source: "admin-test-tool",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast({
          type: "success",
          message: `Audit tamamlandı: ${data.overallScore}/100 (auditId: ${data.auditId})`,
        });
      } else {
        showToast({ type: "error", message: data.error || "Hata" });
      }
    } catch {
      showToast({ type: "error", message: "Ağ hatası" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <PlayCircle className="size-5 text-gray-700" />
        <h2 className="font-semibold text-gray-900">Test Analizi Başlat</h2>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Form geçmeden direkt 43-item audit çalıştırır. Admin olduğunuz için
        IP rate limit ve freeAuditUsed kontrolü atlanır.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="idavilla.com.tr"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 outline-none"
        />
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Marka adı"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 outline-none"
        />
      </div>
      <button
        type="button"
        onClick={handleRun}
        disabled={busy || !url.trim() || !brand.trim()}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Çalışıyor…
          </>
        ) : (
          "Analizi Başlat"
        )}
      </button>
    </section>
  );
}
