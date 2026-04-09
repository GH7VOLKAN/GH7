"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GH7Logo } from "@/components/gh7-logo";

type Step = "input" | "otp";
type LoginMethod = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [method, setMethod] = useState<LoginMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [sessionCleared, setSessionCleared] = useState(false);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // On page load: check for existing session and handle ?logout=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldLogout = params.get("logout") === "true";
    const supabase = createClient();

    // Check if returning user — email'i otomatik doldur
    const savedEmail = localStorage.getItem("gh7_email");
    if (savedEmail || params.get("returning")) {
      setIsReturning(true);
      if (savedEmail && savedEmail.includes("@")) {
        setEmail(savedEmail);
      } else if (savedEmail && savedEmail.startsWith("+90")) {
        setMethod("phone");
        setPhone(savedEmail.replace("+90", "").replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4"));
      }
    }

    async function handleSessionCleanup() {
      const { data: { session } } = await supabase.auth.getSession();

      if (shouldLogout && session) {
        await supabase.auth.signOut();
        document.cookie.split(";").forEach((c) => {
          const name = c.split("=")[0].trim();
          if (name.startsWith("sb-")) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        });
        setSessionCleared(true);
        window.history.replaceState({}, "", "/login");
      } else if (session) {
<<<<<<< Updated upstream
        // Aktif session var — otomatik yönlendir
        if (session.user.email) {
          localStorage.setItem("gh7_email", session.user.email);
        }
        router.push("/panel/genel");
=======
        // There's an existing session — redirect to dashboard
        router.push("/dashboard/genel");
>>>>>>> Stashed changes
        return;
      }
    }

    handleSessionCleanup();
  }, []);

  // Show auth error from redirect (bad_oauth_state etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth") {
      setError("Giriş süresi doldu. Lütfen tekrar deneyin.");
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ─── Phone formatting ──────────────────────────────

  function formatPhoneDisplay(value: string): string {
    const digits = value.replace(/\D/g, "");
    const limited = digits.slice(0, 10);
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    if (limited.length <= 8)
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`;
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setPhone(formatPhoneDisplay(raw));
  }

  function getRawPhone(): string {
    return "+90" + phone.replace(/\D/g, "");
  }

  // ─── Google Login ─────────────────────────────────

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      const redirectOrigin = typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? `https://${window.location.hostname}`
        : window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${redirectOrigin}/auth/callback`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  }

  // ─── Send Email OTP ─────────────────────────────────

  async function handleSendEmailOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kod gönderilemedi");
        setLoading(false);
        return;
      }

      setStep("otp");
      setCooldown(60);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  }

  // ─── Send SMS OTP ───────────────────────────────────

  async function handleSendSmsOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const rawPhone = getRawPhone();
    const digits = rawPhone.replace(/\D/g, "");

    if (digits.length < 12) {
      setError("Geçerli bir telefon numarası girin");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      const res = await fetch("/api/auth/send-sms-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: rawPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "SMS gönderilemedi");
        setLoading(false);
        return;
      }

      setStep("otp");
      setCooldown(60);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  }

  // ─── Verify OTP (both email and SMS) ────────────────

  const handleVerifyOtp = useCallback(
    async (digits: string[]) => {
      const code = digits.join("");
      if (code.length !== 6) return;

      setLoading(true);
      setError(null);

      try {
        const endpoint =
          method === "phone"
            ? "/api/auth/verify-sms-otp"
            : "/api/auth/verify-otp";

        const body =
          method === "phone"
            ? { phone: getRawPhone(), code }
            : { email, code };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Doğrulama başarısız");
          setOtpDigits(["", "", "", "", "", ""]);
          setTimeout(() => inputRefs.current[0]?.focus(), 100);
          setLoading(false);
          return;
        }

        const supabase = createClient();

        document.cookie.split(";").forEach((c) => {
          const name = c.split("=")[0].trim();
          if (name.startsWith("sb-")) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        });

        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.tokenHash,
          type: "magiclink",
        });

        if (verifyError) {
          console.error("[login] verifyOtp error:", verifyError);
          setError("Oturum oluşturulamadı. Lütfen tekrar deneyin. (" + verifyError.message + ")");
          setLoading(false);
          return;
        }

        // Başarılı giriş — email'i kaydet ve yönlendir
        const userEmail = method === "email" ? email : `+90${phone.replace(/\D/g, "")}`;
        if (userEmail) localStorage.setItem("gh7_email", userEmail);
        router.push("/panel/genel");
        router.refresh();
      } catch {
        setError("Bağlantı hatası. Lütfen tekrar deneyin.");
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [email, phone, method, router]
  );

  // ─── OTP Input Handlers ───────────────────────────

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];

    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      pasted.forEach((d, i) => {
        if (i + index < 6) newDigits[i + index] = d;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(index + pasted.length, 5);
      inputRefs.current[nextIdx]?.focus();
      if (newDigits.every((d) => d !== "")) handleVerifyOtp(newDigits);
      return;
    }

    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== "")) {
      handleVerifyOtp(newDigits);
    }
  }

  function handleOtpKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  // ─── Resend OTP ───────────────────────────────────

  async function handleResendOtp() {
    if (cooldown > 0) return;
    setLoading(true);
    setError(null);

    try {
      const endpoint =
        method === "phone" ? "/api/auth/send-sms-otp" : "/api/auth/send-otp";
      const body =
        method === "phone"
          ? { phone: getRawPhone() }
          : { email };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kod gönderilemedi");
      } else {
        setCooldown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Bağlantı hatası.");
    }
    setLoading(false);
  }

  // ─── Switch method helper ─────────────────────────

  function switchMethod(newMethod: LoginMethod) {
    setMethod(newMethod);
    setError(null);
    setStep("input");
    setOtpDigits(["", "", "", "", "", ""]);
  }

  // ─── Render ───────────────────────────────────────

  const otpDestination =
    method === "phone"
      ? `+90 ${phone}`
      : email;

  const otpDestinationLabel =
    method === "phone"
      ? "numarasına 6 haneli SMS kodu gönderdik"
      : "adresine 6 haneli kod gönderdik";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    fontSize: 15,
    border: "1.5px solid var(--g200)",
    borderRadius: 10,
    background: "var(--white)",
    color: "var(--black)",
    outline: "none",
    fontFamily: "var(--font)",
    marginBottom: 12,
    transition: "border-color .15s",
    boxSizing: "border-box",
  };

  const primaryBtnStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    borderRadius: 10,
    border: "none",
    background: "var(--black)",
    color: "var(--white)",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "var(--font)",
    transition: "opacity .15s",
  };

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .login-right-col { display: none !important; }
          .login-left-col { width: 100% !important; }
        }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font)" }}>
        {/* LEFT COLUMN — Form (45%) */}
        <div
          className="login-left-col"
          style={{
            width: "45%",
            padding: "48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "var(--white)",
          }}
        >
          <div style={{ maxWidth: 400, margin: "0 auto", width: "100%" }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none", display: "block", marginBottom: 40 }}>
              <GH7Logo size="default" />
            </Link>

            {step === "input" ? (
              <>
                {/* Heading */}
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--black)", letterSpacing: "-.03em", marginBottom: 8, lineHeight: 1.2 }}>
                  {isReturning ? "Tekrar hoş geldiniz." : "Giriş yapın."}
                </h1>
                <p style={{ fontSize: 15, color: "var(--g500)", marginBottom: 32 }}>
                  {isReturning ? "Hesabınıza giriş yapın." : "Hesabınız yok mu? Ücretsiz başlayın."}
                </p>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--black)", letterSpacing: "-.03em", marginBottom: 8, lineHeight: 1.2 }}>
                  Doğrulama kodu gönderildi
                </h1>
                <p style={{ fontSize: 15, color: "var(--g500)", marginBottom: 32 }}>
                  <span style={{ fontWeight: 600, color: "var(--black)" }}>{otpDestination}</span>{" "}
                  {otpDestinationLabel}
                </p>
              </>
            )}

            {/* Session cleared notice */}
            {sessionCleared && (
              <div style={{
                borderRadius: 10, border: "1.5px solid #bbf7d0", background: "#f0fdf4",
                padding: "12px 16px", fontSize: 13, color: "#15803d", marginBottom: 20,
              }}>
                Oturum kapatıldı. Yeni hesapla giriş yapabilirsiniz.
              </div>
            )}

            {/* Existing session notice */}
            {existingEmail && !sessionCleared && (
              <div style={{
                borderRadius: 10, border: "1.5px solid #fde68a", background: "#fffbeb",
                padding: "12px 16px", fontSize: 13, color: "#92400e", marginBottom: 20,
              }}>
                <p style={{ margin: 0 }}>
                  Şu anda <span style={{ fontWeight: 600 }}>{existingEmail}</span> olarak giriş yapılmış.
                </p>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    document.cookie.split(";").forEach((c) => {
                      const name = c.split("=")[0].trim();
                      if (name.startsWith("sb-")) {
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                      }
                    });
                    setExistingEmail(null);
                    setSessionCleared(true);
                  }}
                  style={{
                    marginTop: 6, fontSize: 12, fontWeight: 600, color: "#92400e",
                    textDecoration: "underline", background: "none", border: "none",
                    cursor: "pointer", padding: 0, fontFamily: "var(--font)",
                  }}
                >
                  Farklı hesapla giriş yap
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{
                borderRadius: 10, border: "1.5px solid #fecaca", background: "#fef2f2",
                padding: "12px 16px", fontSize: 13, color: "var(--red)", marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            {step === "input" ? (
              <>
                {/* Google OAuth button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 10,
                    border: "1.5px solid var(--g200)", background: "var(--white)",
                    fontSize: 14, fontWeight: 600, color: "var(--black)",
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 10, marginBottom: 24,
                    fontFamily: "var(--font)", transition: "border-color .15s",
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google ile devam et
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{ flex: 1, height: 1, background: "var(--g200)" }} />
                  <span style={{ fontSize: 12, color: "var(--g400)", fontWeight: 500 }}>veya</span>
                  <div style={{ flex: 1, height: 1, background: "var(--g200)" }} />
                </div>

                {/* Email / Phone tabs */}
                <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "var(--g100)", borderRadius: 10, padding: 3 }}>
                  <button
                    type="button"
                    onClick={() => switchMethod("email")}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 8, border: "none",
                      fontSize: 13, fontWeight: 700, cursor: "pointer",
                      fontFamily: "var(--font)", transition: "all .15s",
                      background: method === "email" ? "var(--black)" : "transparent",
                      color: method === "email" ? "var(--white)" : "var(--g500)",
                    }}
                  >
                    E-posta
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMethod("phone")}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 8, border: "none",
                      fontSize: 13, fontWeight: 700, cursor: "pointer",
                      fontFamily: "var(--font)", transition: "all .15s",
                      background: method === "phone" ? "var(--black)" : "transparent",
                      color: method === "phone" ? "var(--white)" : "var(--g500)",
                    }}
                  >
                    Telefon
                  </button>
                </div>

                {/* Email form */}
                {method === "email" && (
                  <form onSubmit={handleSendEmailOtp}>
                    <input
                      type="email"
                      placeholder="örnek@firma.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "var(--black)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--g200)")}
                    />
                    <button
                      type="submit"
                      disabled={loading || !email}
                      style={{ ...primaryBtnStyle, opacity: loading || !email ? 0.5 : 1 }}
                    >
                      {loading ? "Gönderiliyor..." : "Doğrulama kodu gönder \u2192"}
                    </button>
                  </form>
                )}

                {/* Phone form */}
                {method === "phone" && (
                  <form onSubmit={handleSendSmsOtp}>
                    <div style={{
                      display: "flex", alignItems: "center", border: "1.5px solid var(--g200)",
                      borderRadius: 10, background: "var(--white)", marginBottom: 12,
                      transition: "border-color .15s",
                    }}>
                      <span style={{ paddingLeft: 16, fontSize: 15, color: "var(--g400)", userSelect: "none" }}>+90</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="5XX XXX XX XX"
                        required
                        autoFocus
                        maxLength={13}
                        style={{
                          width: "100%", padding: "14px 12px", fontSize: 15,
                          border: "none", background: "transparent",
                          color: "var(--black)", outline: "none",
                          fontFamily: "var(--font)", boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || phone.replace(/\D/g, "").length < 10}
                      style={{ ...primaryBtnStyle, opacity: loading || phone.replace(/\D/g, "").length < 10 ? 0.5 : 1 }}
                    >
                      {loading ? "Gönderiliyor..." : "Kod gönder \u2192"}
                    </button>
                  </form>
                )}
              </>
            ) : (
              <>
                {/* OTP Verification */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={loading}
                      style={{
                        width: 48, height: 56, textAlign: "center",
                        fontSize: 20, fontWeight: 700,
                        border: "1.5px solid var(--g200)", borderRadius: 10,
                        background: "var(--white)", color: "var(--black)",
                        outline: "none", fontFamily: "var(--font)",
                        transition: "border-color .15s",
                        opacity: loading ? 0.5 : 1,
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--black)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--g200)")}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyOtp(otpDigits)}
                  disabled={loading || otpDigits.some((d) => d === "")}
                  style={{ ...primaryBtnStyle, opacity: loading || otpDigits.some((d) => d === "") ? 0.5 : 1, marginBottom: 16 }}
                >
                  {loading ? "Doğrulanıyor..." : "Doğrula"}
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--g400)" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("input");
                      setError(null);
                      setOtpDigits(["", "", "", "", "", ""]);
                    }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 12, color: "var(--g400)", textDecoration: "underline",
                      fontFamily: "var(--font)", padding: 0,
                    }}
                  >
                    {method === "phone" ? "\u2190 Farklı numara" : "\u2190 Farklı e-posta"}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || loading}
                    style={{
                      background: "none", border: "none", cursor: cooldown > 0 ? "default" : "pointer",
                      fontSize: 12, color: "var(--g400)",
                      textDecoration: cooldown > 0 ? "none" : "underline",
                      fontFamily: "var(--font)", padding: 0,
                      opacity: cooldown > 0 ? 0.5 : 1,
                    }}
                  >
                    {cooldown > 0 ? `Tekrar gönder (${cooldown}s)` : "Tekrar gönder"}
                  </button>
                </div>
              </>
            )}

            {/* Bottom link */}
            <p style={{ fontSize: 13, color: "var(--g400)", marginTop: 32, textAlign: "center" }}>
              Hesabınız yok mu?{" "}
              <Link href="/analiz" style={{ color: "var(--black)", fontWeight: 700, textDecoration: "none" }}>
                Ücretsiz başlayın &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN — Content (55%) */}
        <div
          className="login-right-col"
          style={{
            width: "55%",
            background: "var(--black)",
            padding: "48px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            color: "var(--white)",
          }}
        >
          {isReturning ? (
            /* Version B — Returning user */
            <>
              <span style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,.4)", marginBottom: 20, display: "block" }}>
                Tekrar hoş geldiniz
              </span>
              <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1.15, marginBottom: 40 }}>
                Bu hafta için<br/>3 aksiyon hazır.
              </h2>
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: "rgba(255,255,255,.4)", marginBottom: 16 }}>Geçen hafta ne oldu</div>
                {[
                  { label: "GEO Skoru", val: "74", delta: "\u21913" },
                  { label: "Ses Payı", val: "%26", delta: "\u21912" },
                  { label: "Görünür Sorgu", val: "12", delta: "\u21912" },
                ].map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,.1)", fontSize: 14 }}>
                    <span style={{ color: "rgba(255,255,255,.5)" }}>{m.label}</span>
                    <span style={{ fontWeight: 700, fontFamily: "monospace" }}>{m.val} <span style={{ color: "#22C55E" }}>{m.delta}</span></span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,.9)", marginBottom: 8, lineHeight: 1.4 }}>
                Rakibiniz bu hafta 2 sorguda sizi geçti.
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>Giriş yapın, görün.</p>
            </>
          ) : (
            /* Version A — New user */
            <>
              <div style={{ marginBottom: 40 }}>
                <GH7Logo size="lg" className="text-white" />
              </div>
              <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1.15, marginBottom: 20 }}>
                Yapay zeka sizi<br/>tanıyor mu?
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.7, marginBottom: 40, maxWidth: 400 }}>
                ChatGPT, Gemini, Perplexity ve Google AI Overview — müşterileriniz artık bu platformlara soruyor.
              </p>
              <div style={{ marginBottom: 40 }}>
                {[
                  { name: "Tespit Et", price: "Ücretsiz" },
                  { name: "Takip Et", price: "\u20BA2.450/ay" },
                  { name: "Çözüm Üret", price: "\u20BA4.450/ay" },
                  { name: "Uygulat", price: "\u20BA9.450/ay" },
                ].map((tier, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,.1)", fontSize: 14 }}>
                    <span style={{ color: "rgba(255,255,255,.7)", fontWeight: 600 }}>{tier.name}</span>
                    <span style={{ fontFamily: "monospace", color: "rgba(255,255,255,.5)" }}>{tier.price}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", fontStyle: "italic", lineHeight: 1.6 }}>
                &ldquo;12 haftada AI görünürlüğümüz %340 arttı.&rdquo;<br/>
                <span style={{ fontStyle: "normal", fontWeight: 600, color: "rgba(255,255,255,.5)" }}>— ISITMAX &middot; 1M+ aylık ziyaretçi</span>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
