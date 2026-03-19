"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GH7Logo } from "@/components/gh7-logo";
import { GH7Icon } from "@/components/gh7-icon";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [sessionCleared, setSessionCleared] = useState(false);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // On page load: check for existing session and handle ?logout=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldLogout = params.get("logout") === "true";
    const supabase = createClient();

    async function handleSessionCleanup() {
      const { data: { session } } = await supabase.auth.getSession();

      if (shouldLogout && session) {
        // User explicitly wants to log out — clear session
        await supabase.auth.signOut();
        // Clear all Supabase cookies
        document.cookie.split(";").forEach((c) => {
          const name = c.split("=")[0].trim();
          if (name.startsWith("sb-")) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        });
        setSessionCleared(true);
        window.history.replaceState({}, "", "/login");
      } else if (session) {
        // There's an existing session — show which account is logged in
        setExistingEmail(session.user.email ?? null);
      }
    }

    handleSessionCleanup();
  }, []);

  // Show auth error from redirect (bad_oauth_state etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth") {
      setError("Giriş süresi doldu. Lütfen tekrar deneyin.");
      // Clean URL
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

  // ─── Google Login ─────────────────────────────────

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      // Always sign out existing session before starting a new Google login
      // This prevents the old session from persisting after OAuth redirect
      await supabase.auth.signOut();

      // Use consistent origin to prevent state cookie mismatch
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

  // ─── Send OTP ─────────────────────────────────────

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign out any existing session before email login
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

  // ─── Verify OTP ───────────────────────────────────

  const handleVerifyOtp = useCallback(
    async (digits: string[]) => {
      const code = digits.join("");
      if (code.length !== 6) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Doğrulama başarısız");
          setOtpDigits(["", "", "", "", "", ""]);
          setTimeout(() => inputRefs.current[0]?.focus(), 100);
          setLoading(false);
          return;
        }

        // Sign out any existing session before creating the new one
        const supabase = createClient();
        await supabase.auth.signOut();

        // Use tokenHash to create Supabase session
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.tokenHash,
          type: "magiclink",
        });

        if (verifyError) {
          setError("Oturum oluşturulamadı. Lütfen tekrar deneyin.");
          setLoading(false);
          return;
        }

        router.push("/dashboard/genel");
        router.refresh();
      } catch {
        setError("Bağlantı hatası. Lütfen tekrar deneyin.");
        setLoading(false);
      }
    },
    [email, router]
  );

  // ─── OTP Input Handlers ───────────────────────────

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];

    // Handle paste
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

    // Auto-submit when all 6 digits entered
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
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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

  // ─── Render ───────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left — form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <Link href="/">
              <GH7Logo size="default" />
            </Link>

            {step === "email" ? (
              <>
                <h1 className="mt-6 text-2xl font-light tracking-[-0.04em]">
                  Hesabınıza giriş yapın
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Yapay zekalarda görünürlüğünüzü takip edin
                </p>
              </>
            ) : (
              <>
                <h1 className="mt-6 text-2xl font-light tracking-[-0.04em]">
                  Doğrulama kodu gönderildi
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{email}</span>{" "}
                  adresine 6 haneli kod gönderdik
                </p>
              </>
            )}
          </div>

          {sessionCleared && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
              Oturum kapatıldı. Yeni hesapla giriş yapabilirsiniz.
            </div>
          )}

          {existingEmail && !sessionCleared && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
              <p>
                Şu anda <span className="font-medium">{existingEmail}</span> olarak giriş yapılmış.
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
                className="mt-1 text-xs font-medium underline hover:text-amber-900 dark:hover:text-amber-300"
              >
                Farklı hesapla giriş yap
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {step === "email" ? (
            <>
              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-border px-4 py-3 text-sm font-medium transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google ile Giriş
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground">
                    veya
                  </span>
                </div>
              </div>

              {/* Email OTP Form */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@firma.com"
                    required
                    autoFocus
                    className="mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm transition-colors focus:border-foreground focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
                >
                  {loading ? "Gönderiliyor..." : "Doğrulama Kodu Gönder"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* OTP Verification */}
              <div className="flex justify-center gap-2.5">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={loading}
                    className="h-14 w-11 rounded-xl border-[1.5px] border-border bg-background text-center text-xl font-bold transition-colors focus:border-foreground focus:outline-none disabled:opacity-50 sm:h-16 sm:w-12"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleVerifyOtp(otpDigits)}
                disabled={loading || otpDigits.some((d) => d === "")}
                className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
              >
                {loading ? "Doğrulanıyor..." : "Doğrula"}
              </button>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button
                  onClick={() => {
                    setStep("email");
                    setError(null);
                    setOtpDigits(["", "", "", "", "", ""]);
                  }}
                  className="underline hover:text-foreground"
                >
                  ← Farklı e-posta
                </button>

                <button
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || loading}
                  className="underline hover:text-foreground disabled:no-underline disabled:opacity-50"
                >
                  {cooldown > 0
                    ? `Tekrar gönder (${cooldown}s)`
                    : "Tekrar gönder"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right — visual panel (desktop only) */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-foreground lg:p-12">
        <div className="max-w-md">
          <GH7Icon size={48} className="mb-10 text-background/20" />

          <h2 className="text-2xl font-light tracking-[-0.04em] text-background">
            Yapay zekalar seni
            <br />
            tanıyor mu?
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-background/50">
            Müşterilerin artık yapay zekaya soruyor. ChatGPT, Claude, Gemini ve
            Perplexity — seni öneriyorlar mı?
          </p>

          <div className="mt-10 space-y-5">
            {[
              {
                step: "1",
                title: "Adını yaz",
                desc: "30 saniyede 4 yapay zekaya sorarız.",
              },
              {
                step: "2",
                title: "Sonucu gör",
                desc: "Seni tanıyorlar mı, ne diyorlar, senin yerine kimi öneriyorlar.",
              },
              {
                step: "3",
                title: "Düzelt",
                desc: "Ne yapman gerektiğini söyleriz. İstersen biz yaparız.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-background/20 text-xs font-bold text-background/40">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-medium text-background">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-background/40">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-6 border-t border-background/10 pt-8">
            {[
              { label: "Yapay Zeka", value: "4" },
              { label: "Sonuç Süresi", value: "30sn" },
              { label: "Ücretsiz", value: "Başla" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-light text-background">
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-background/30">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
