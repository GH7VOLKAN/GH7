"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  KINDE_COLORS,
  BTN_PRIMARY,
} from "@/components/panel/kinde/primitives";

/**
 * Scan tetikleyici buton + progress bar.
 * - /api/panel/scan-now → scan başlat
 * - /api/panel/scan-status → 5 saniyede bir polling
 * - Progress bar canlı güncellenir
 * - Scan bitince (status=completed veya resultCount>=expected) → router.refresh()
 */

interface StatusData {
  hasScan: boolean;
  scanId?: string;
  status?: string;
  resultCount?: number;
  expectedTotal?: number;
  progressPct?: number;
  elapsedSec?: number;
  isActive?: boolean;
  isDone?: boolean;
  isFailed?: boolean;
}

export function ScanNowButton({
  variant = "primary",
  label = "Şimdi Tara",
}: {
  variant?: "primary" | "banner";
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Sayfa yüklendiğinde aktif scan var mı kontrol et
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/panel/scan-status");
      if (!res.ok) return;
      const body: StatusData = await res.json();
      setStatus(body);
      // Aktif ise polling aç
      if (body.isActive) {
        setPolling(true);
      } else if (body.isDone) {
        setPolling(false);
        // Tamamlandı — sayfayı yenile
        router.refresh();
      } else if (body.isFailed) {
        setPolling(false);
      }
    } catch {
      // sessiz fail
    }
  }, [router]);

  // İlk yüklemede durum kontrol
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Polling — 5 saniyede bir
  useEffect(() => {
    if (!polling) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    pollRef.current = setInterval(fetchStatus, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [polling, fetchStatus]);

  const trigger = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/panel/scan-now", { method: "GET" });
      const body = await res.json();
      if (!res.ok) {
        setMsg(body.error ?? "Scan başlatılamadı.");
        setLoading(false);
        return;
      }
      setMsg(
        body.info
          ? "Zaten çalışan bir scan var. İlerleme yükleniyor..."
          : `Tarama başladı. ${body.promptCount} sorgu × ${body.platformCount} platform.`,
      );
      // Polling başlat
      setPolling(true);
      fetchStatus();
    } catch {
      setMsg("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const showProgressBar =
    status?.hasScan &&
    (status.isActive ||
      (status.isDone && (status.resultCount ?? 0) > 0) ||
      (status.isFailed && (status.resultCount ?? 0) > 0));

  const showTriggerButton = !status?.isActive;

  /* -------------------- BANNER VARIANT -------------------- */
  if (variant === "banner") {
    return (
      <div
        style={{
          padding: 24,
          border: `1px solid ${KINDE_COLORS.black}`,
          borderRadius: 12,
          background: KINDE_COLORS.bgSoft,
          marginBottom: 32,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
          {status?.isActive
            ? "Tarama çalışıyor..."
            : status?.isDone
              ? "Tarama tamamlandı ✓"
              : status?.isFailed && (status?.resultCount ?? 0) > 0
                ? "Tarama kesildi ama veri var"
                : "Tarama hazır, başlatmak için tıklayın."}
        </div>
        <div
          style={{
            fontSize: 13,
            color: KINDE_COLORS.muted,
            lineHeight: 1.6,
            marginBottom: showProgressBar ? 12 : 16,
          }}
        >
          {status?.isActive
            ? `${status.resultCount}/${status.expectedTotal} sorgu-platform sonucu yazıldı · ${status.elapsedSec} saniye geçti`
            : status?.isDone
              ? `${status.resultCount} sonuç yazıldı. Sayfa birazdan yenilenecek.`
              : status?.isFailed && (status?.resultCount ?? 0) > 0
                ? `${status.resultCount} sonuç yazılmış ama scan bitmeden kesildi. Yine de sonuçları görebilirsiniz.`
                : "Sorgularınız üretildi ama 5 AI platformuna sorulmadı. Tara butonuna basın."}
        </div>

        {showProgressBar && (
          <ProgressBar
            pct={status?.progressPct ?? 0}
            resultCount={status?.resultCount ?? 0}
            total={status?.expectedTotal ?? 0}
            isActive={status?.isActive ?? false}
          />
        )}

        {showTriggerButton && (
          <button
            type="button"
            onClick={trigger}
            disabled={loading}
            style={{
              ...BTN_PRIMARY,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Başlatılıyor..." : label}
          </button>
        )}

        {msg && (
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: KINDE_COLORS.muted,
            }}
          >
            {msg}
          </div>
        )}
      </div>
    );
  }

  /* -------------------- PRIMARY VARIANT -------------------- */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {showProgressBar && (
        <ProgressBar
          pct={status?.progressPct ?? 0}
          resultCount={status?.resultCount ?? 0}
          total={status?.expectedTotal ?? 0}
          isActive={status?.isActive ?? false}
        />
      )}
      {showTriggerButton && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={trigger}
            disabled={loading}
            style={{
              ...BTN_PRIMARY,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Başlatılıyor..." : label}
          </button>
          {msg && (
            <span style={{ fontSize: 12, color: KINDE_COLORS.muted }}>
              {msg}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/*  Progress Bar                                        */
/* -------------------------------------------------- */
function ProgressBar({
  pct,
  resultCount,
  total,
  isActive,
}: {
  pct: number;
  resultCount: number;
  total: number;
  isActive: boolean;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
          fontSize: 12,
          color: KINDE_COLORS.muted,
        }}
      >
        <span>
          {isActive ? "Tarama ilerliyor" : "Tarama tamamlandı"} · {resultCount}/
          {total} sonuç
        </span>
        <span style={{ fontWeight: 700, color: KINDE_COLORS.black }}>
          {pct}%
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 6,
          background: KINDE_COLORS.divider,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: KINDE_COLORS.black,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      {isActive && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: KINDE_COLORS.mutedLight,
            fontStyle: "italic",
          }}
        >
          Her 5 saniyede güncellenir. Tamamlandığında sayfa otomatik yenilenir.
        </div>
      )}
    </div>
  );
}
