"use client";

import { useState } from "react";
import Link from "next/link";
import { FadeIn } from "./animations";

/* ─────────────────────────────────────────────────────
   DualCTA — Two side-by-side CTA cards for free users
   ───────────────────────────────────────────────────── */

interface DualCTAProps {
  contextMessage?: string;
  platformCount?: number;
  plan?: string;
}

export function DualCTA({ contextMessage, platformCount, plan }: DualCTAProps) {
  const [popupOpen, setPopupOpen] = useState(false);

  // Don't render for paid users
  if (plan && plan !== "free") return null;

  return (
    <>
      <FadeIn>
        <div className="mt-12">
          {/* Context message */}
          {contextMessage && (
            <p
              style={{
                fontSize: 14,
                color: "var(--muted-foreground)",
                textAlign: "center",
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              {contextMessage}
            </p>
          )}

          {/* Two cards side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* LEFT CARD — Kendim takip edeceğim */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--foreground)",
                  marginBottom: 16,
                }}
              >
                Kendim takip edeceğim
              </p>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {[
                  "Haftalık tarama",
                  "Trend takibi",
                  "İlerleme doğrulama",
                  "Rakip değişim takibi",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: 13,
                      color: "var(--muted-foreground)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#111",
                        flexShrink: 0,
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--foreground)",
                  marginTop: 20,
                  marginBottom: 16,
                }}
              >
                2.495₺/ay
              </p>

              <Link
                href="/dashboard/paketler"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#111",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "10px 24px",
                  borderRadius: 999,
                  textDecoration: "none",
                  transition: "transform 0.15s ease",
                }}
                className="hover:scale-[1.02] active:scale-[0.98]"
              >
                Takibe başla →
              </Link>
            </div>

            {/* RIGHT CARD — Siz çözün */}
            <div
              style={{
                background: "#f8f8f8",
                border: "1px solid #eee",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--foreground)",
                  marginBottom: 16,
                }}
              >
                Siz çözün
              </p>

              <p
                style={{
                  fontSize: 13,
                  color: "var(--muted-foreground)",
                  lineHeight: 1.6,
                }}
              >
                1 ayda en az {platformCount || 2} yapay zeka sizi önermeye
                başlasın.
              </p>

              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--foreground)",
                  marginTop: 12,
                  lineHeight: 1.5,
                }}
              >
                Hedefe ulaşınca öde.
                <br />
                Ulaşamazsan 0₺.
              </p>

              <div style={{ marginTop: 20 }}>
                <button
                  onClick={() => setPopupOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#111",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "10px 24px",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    transition: "transform 0.15s ease",
                  }}
                  className="hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sizi Arayalım
                </button>

                <p
                  style={{
                    fontSize: 12,
                    color: "#bbb",
                    marginTop: 10,
                  }}
                >
                  veya 0850 XXX XX XX
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Popup */}
      {popupOpen && (
        <CallRequestPopup onClose={() => setPopupOpen(false)} />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────
   CallRequestPopup — "Sizi Arayalım" modal
   ───────────────────────────────────────────────────── */

function CallRequestPopup({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // TODO: wire up to API
    setSubmitted(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 32,
          maxWidth: 384,
          width: "100%",
          margin: "0 16px",
          position: "relative",
        }}
      >
        {!submitted ? (
          <>
            <p
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--foreground)",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              En kısa sürede sizi arayalım
            </p>

            {/* Phone input */}
            <input
              type="tel"
              placeholder="Telefon numaranız"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: 14,
                border: "1px solid #eee",
                borderRadius: 12,
                outline: "none",
                marginBottom: 12,
                fontFamily: "inherit",
                color: "var(--foreground)",
                background: "#fafafa",
              }}
            />

            {/* Time slot select */}
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: 14,
                border: "1px solid #eee",
                borderRadius: 12,
                outline: "none",
                marginBottom: 20,
                fontFamily: "inherit",
                color: timeSlot ? "var(--foreground)" : "#999",
                background: "#fafafa",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            >
              <option value="" disabled>
                Uygun saatiniz
              </option>
              <option value="09:00-12:00">09:00 - 12:00</option>
              <option value="12:00-15:00">12:00 - 15:00</option>
              <option value="15:00-18:00">15:00 - 18:00</option>
            </select>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!phone}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: phone ? "#111" : "#ccc",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                padding: "12px 24px",
                borderRadius: 999,
                border: "none",
                cursor: phone ? "pointer" : "not-allowed",
                transition: "transform 0.15s ease, background 0.2s ease",
              }}
              className="hover:scale-[1.02] active:scale-[0.98]"
            >
              Arama Talep Et →
            </button>

            {/* Phone number hint */}
            <p
              style={{
                fontSize: 12,
                color: "#bbb",
                textAlign: "center",
                marginTop: 16,
              }}
            >
              veya hemen arayın: 0850 XXX XX XX
            </p>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                fontSize: 13,
                color: "#999",
                background: "none",
                border: "none",
                cursor: "pointer",
                marginTop: 16,
                padding: 8,
              }}
            >
              Kapat
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 24,
                color: "#22c55e",
              }}
            >
              ✓
            </div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--foreground)",
                marginBottom: 8,
              }}
            >
              Talebiniz alındı
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--muted-foreground)",
                marginBottom: 20,
              }}
            >
              En kısa sürede sizi arayacağız.
            </p>
            <button
              onClick={onClose}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#111",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                padding: "10px 24px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
              }}
            >
              Tamam
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
