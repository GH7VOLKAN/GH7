"use client";

import { useState, useRef, useEffect } from "react";
import s from "../analiz.module.css";

type Props = {
  domain: string;
  onVerified: (profileId: string) => void;
  onCancel: () => void;
};

type Stage = "enter_info" | "enter_otp" | "checking";

function isValidEmail(email: string): boolean {
  if (!email) return true; // boş geçerli (opsiyonel)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function PhoneVerifyModal({ domain, onVerified, onCancel }: Props) {
  const [stage, setStage] = useState<Stage>("enter_info");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(true); // default işaretli
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stage === "enter_info") phoneInputRef.current?.focus();
    if (stage === "enter_otp") otpInputRef.current?.focus();
  }, [stage]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const formatPhone = (val: string): string => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  };

  const sendOtp = async () => {
    setError(null);

    if (phone.replace(/\D/g, "").length < 10) {
      setError("Telefon numarasını eksiksiz gir.");
      return;
    }
    if (email && !isValidEmail(email)) {
      setError("Geçerli bir e-posta adresi gir veya boş bırak.");
      return;
    }

    setLoading(true);
    const rawPhone = phone.replace(/\D/g, "");

    try {
      const body: Record<string, unknown> = {
        phone: rawPhone,
        mode: "register",
      };
      if (email.trim()) body.email = email.trim();

      const res = await fetch("/api/auth/send-sms-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "SMS gönderilemedi. Numaranı kontrol et.");
        setLoading(false);
        return;
      }
      setCooldown(60);
      setStage("enter_otp");
    } catch {
      setError("Bağlantı hatası. Tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setLoading(true);
    const rawPhone = phone.replace(/\D/g, "");

    try {
      const verifyBody: Record<string, unknown> = {
        phone: rawPhone,
        code: otp,
      };
      if (email.trim()) verifyBody.email = email.trim();

      const verifyRes = await fetch("/api/auth/verify-sms-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(verifyBody),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.ok) {
        setError(verifyData.error || "Kod yanlış veya süresi dolmuş.");
        setLoading(false);
        return;
      }

      const profileId = verifyData.profileId || verifyData.userId || "";

      // Newsletter opt-in varsa Profile'a işle (email verildiyse)
      if (email.trim() && newsletterOptIn && profileId) {
        try {
          await fetch("/api/analiz/newsletter-optin", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ profileId, optIn: true }),
          });
        } catch (err) {
          console.warn("Newsletter opt-in failed (non-blocking):", err);
        }
      }

      // can-start kontrolü
      setStage("checking");
      const canStartRes = await fetch("/api/analiz/can-start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: rawPhone }),
      });
      const canStartData = await canStartRes.json();

      if (canStartData.canStart === false) {
        if (canStartData.reason === "pro_user") {
          window.location.href = canStartData.redirectTo || "/dashboard/genel";
          return;
        }
        if (canStartData.reason === "already_used") {
          setError(
            canStartData.message ||
              "Bu numara ile daha önce ücretsiz analiz kullanıldı. Pro'ya geçin.",
          );
          setStage("enter_otp");
          setLoading(false);
          return;
        }
        setError("Analiz başlatılamadı.");
        setStage("enter_otp");
        setLoading(false);
        return;
      }

      onVerified(profileId);
    } catch {
      setError("Bağlantı hatası. Tekrar dene.");
      setStage("enter_otp");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    await sendOtp();
  };

  return (
    <div className={s.modalBackdrop} onClick={onCancel}>
      <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <div className={s.modalBrand}>
            <span className={s.modalBrandLogo}>GH7</span>
            <span className={s.modalBrandProduct}>INSIGHT</span>
          </div>
          <button onClick={onCancel} className={s.modalClose} aria-label="Kapat">
            ×
          </button>
        </div>

        {stage === "enter_info" && (
          <>
            <h2 className={s.modalTitle}>Ücretsiz analiz başlıyor.</h2>
            <p className={s.modalSub}>
              Analiz raporun ve ileride Pro üyeliğin için iletişim bilgilerini
              doğrulayalım.
            </p>

            <div className={s.modalFieldGroup}>
              <label className={s.modalLabel}>Telefon numarası</label>
              <div className={s.modalPhoneRow}>
                <span className={s.modalPhonePrefix}>+90</span>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(formatPhone(e.target.value));
                    setError(null);
                  }}
                  placeholder="5XX XXX XX XX"
                  className={s.modalPhoneInput}
                />
              </div>
            </div>

            <div className={s.modalFieldGroup}>
              <label className={s.modalLabel}>
                E-posta <span className={s.modalOptional}>opsiyonel</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="ornek@mail.com"
                className={s.modalEmailInput}
                autoComplete="email"
              />
            </div>

            {email.trim() && (
              <label className={s.modalCheckboxRow}>
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  className={s.modalCheckbox}
                />
                <span className={s.modalCheckboxLabel}>
                  <strong>GH7 Advisor Haftalık</strong> — AI görünürlük
                  trendleri, algoritma değişiklikleri ve senin sektöründe öne
                  çıkan fırsatlar her Pazartesi sabahı e-postanda.
                  <br />
                  <span className={s.modalCheckboxSmall}>
                    İstediğin zaman tek tıkla aboneliğini iptal edebilirsin.
                  </span>
                </span>
              </label>
            )}

            {error && <p className={s.modalError}>{error}</p>}

            <p className={s.modalDisclaimer}>
              {domain} için ücretsiz analizin 60-90 saniye sürer. Telefon
              numaran sadece analiz raporu ve Pro üyelik için kullanılır.
            </p>

            <button
              onClick={sendOtp}
              disabled={phone.replace(/\D/g, "").length < 10 || loading}
              className={s.modalBtn}
            >
              {loading ? "SMS gönderiliyor..." : "Doğrulama Kodu Gönder"}
            </button>
          </>
        )}

        {stage === "enter_otp" && (
          <>
            <h2 className={s.modalTitle}>Kodu gir.</h2>
            <p className={s.modalSub}>
              <strong>+90 {phone}</strong> numarasına 6 haneli kod gönderdik.
            </p>

            <div className={s.modalFieldGroup}>
              <label className={s.modalLabel}>Doğrulama kodu</label>
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError(null);
                }}
                placeholder="000000"
                className={s.modalOtpInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && otp.length === 6) verifyOtp();
                }}
                maxLength={6}
              />
            </div>

            {error && <p className={s.modalError}>{error}</p>}

            <div className={s.modalActions}>
              <button
                onClick={() => {
                  setStage("enter_info");
                  setOtp("");
                  setError(null);
                }}
                className={s.modalBtnSecondary}
              >
                ← Bilgileri düzelt
              </button>
              <button
                onClick={resend}
                disabled={cooldown > 0 || loading}
                className={s.modalBtnLink}
              >
                {cooldown > 0 ? `Yeniden gönder (${cooldown}s)` : "Yeniden gönder"}
              </button>
            </div>

            <button
              onClick={verifyOtp}
              disabled={otp.length !== 6 || loading}
              className={s.modalBtn}
            >
              {loading ? "Doğrulanıyor..." : "Doğrula ve Analizi Başlat"}
            </button>
          </>
        )}

        {stage === "checking" && (
          <>
            <h2 className={s.modalTitle}>Doğrulanıyor...</h2>
            <p className={s.modalSub}>
              Telefon numaran kontrol ediliyor, analizin başlatılıyor.
            </p>
            <div className={s.modalLoader}>
              <div className={s.modalLoaderDot}></div>
              <div className={s.modalLoaderDot}></div>
              <div className={s.modalLoaderDot}></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
