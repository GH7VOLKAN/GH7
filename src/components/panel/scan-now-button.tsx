"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  KINDE_COLORS,
  BTN_PRIMARY,
} from "@/components/panel/kinde/primitives";

/**
 * Scan tetikleyici buton.
 * /api/panel/scan-now endpoint'ine GET atar. Scan arka planda başlar,
 * cevap hemen döner. 2-5 dk sonra sayfayı yenile.
 */
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
  const [success, setSuccess] = useState(false);

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
      if (body.info) {
        // Zaten çalışan scan var
        setMsg(body.info);
        setSuccess(true);
      } else {
        setMsg(
          `Tarama başlatıldı. ${body.promptCount} sorgu × ${body.platformCount} platform. 2-5 dakika sürer.`,
        );
        setSuccess(true);
      }
      // 60 saniye sonra sayfayı yenile — scan tamamlanmış olabilir
      setTimeout(() => {
        router.refresh();
      }, 60_000);
    } catch {
      setMsg("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

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
          Tarama hazır, başlatmak için tıklayın.
        </div>
        <div
          style={{
            fontSize: 13,
            color: KINDE_COLORS.muted,
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          Sorgularınız üretildi ama 5 AI platformuna henüz sorulmadı. Tara
          butonuna basın, 2-5 dakika içinde sonuçlar burada görünür.
        </div>
        <button
          type="button"
          onClick={trigger}
          disabled={loading || success}
          style={{
            ...BTN_PRIMARY,
            opacity: loading || success ? 0.6 : 1,
            cursor: loading || success ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Başlatılıyor..." : success ? "Başlatıldı ✓" : label}
        </button>
        {msg && (
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: success ? KINDE_COLORS.black : "#C62828",
            }}
          >
            {msg}
          </div>
        )}
      </div>
    );
  }

  // Primary variant — basit inline buton
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button
        type="button"
        onClick={trigger}
        disabled={loading || success}
        style={{
          ...BTN_PRIMARY,
          opacity: loading || success ? 0.6 : 1,
          cursor: loading || success ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Başlatılıyor..." : success ? "Başlatıldı ✓" : label}
      </button>
      {msg && (
        <span
          style={{
            fontSize: 12,
            color: success ? KINDE_COLORS.muted : "#C62828",
          }}
        >
          {msg}
        </span>
      )}
    </div>
  );
}
