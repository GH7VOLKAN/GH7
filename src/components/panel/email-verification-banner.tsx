"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface Props {
  email: string;
  emailVerified: boolean;
}

type BannerState = "promote" | "code_input" | "success" | "hidden";

const DEFER_KEY = "gh7_email_verify_deferred_until";
const DEFER_HOURS = 24;

/**
 * E-posta doğrulama bileşeni — modern kart, 3 state:
 *   promote    → "E-postanı doğrula" kartı + [Kod Gönder] / [Daha Sonra]
 *   code_input → 6 haneli kod inputu + [Doğrula]
 *   success    → "Doğrulandı" yeşil kart (2sn sonra kaybolur)
 *
 * "Daha Sonra" tıklanırsa 24 saat boyunca gizli (localStorage).
 * 6 hane dolunca otomatik doğrulama tetiklenir.
 */
export function EmailVerificationBanner({ email, emailVerified }: Props) {
  const router = useRouter();

  // Synthetic phone_*@gh7.ai e-postalarını gösterme
  const isSyntheticEmail =
    email.startsWith("phone_") && email.endsWith("@gh7.ai");

  const [state, setState] = useState<BannerState>("promote");
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Daha önce "daha sonra" dediyse 24 saat boyunca gizle
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (emailVerified || isSyntheticEmail) {
      setState("hidden");
      return;
    }
    const deferUntil = localStorage.getItem(DEFER_KEY);
    if (deferUntil && Number(deferUntil) > Date.now()) {
      setState("hidden");
    }
  }, [emailVerified, isSyntheticEmail]);

  // Başarı sonrası 2 saniye → kaybol
  useEffect(() => {
    if (state !== "success") return;
    const t = setTimeout(() => {
      setState("hidden");
      router.refresh();
    }, 2000);
    return () => clearTimeout(t);
  }, [state, router]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (state === "hidden") return null;

  const verifyWithCode = async (fullCode: string) => {
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-email-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Kod yanlış");
        return;
      }
      setState("success");
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setVerifying(false);
    }
  };

  const handleSendCode = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-email-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Kod gönderilemedi");
        return;
      }
      if (data.alreadyVerified) {
        setState("success");
        return;
      }
      setState("code_input");
      setCooldown(60);
      setTimeout(() => codeInputRefs.current[0]?.focus(), 100);
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("6 haneli kodu eksiksiz girin");
      return;
    }
    verifyWithCode(fullCode);
  };

  const handleDefer = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        DEFER_KEY,
        String(Date.now() + DEFER_HOURS * 60 * 60 * 1000),
      );
    }
    setState("hidden");
  };

  const handleCodeChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);

    if (digit && idx < 5) {
      codeInputRefs.current[idx + 1]?.focus();
    }

    // 6 hane dolunca otomatik doğrula
    if (idx === 5 && digit && next.every((c) => c)) {
      setTimeout(() => verifyWithCode(next.join("")), 50);
    }
  };

  const handleCodeKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      codeInputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter" && code.every((c) => c)) {
      e.preventDefault();
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const next = [...code];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] ?? "";
    }
    setCode(next);
    const lastIdx = Math.min(pasted.length - 1, 5);
    codeInputRefs.current[lastIdx]?.focus();
    if (pasted.length === 6) {
      setTimeout(() => verifyWithCode(pasted), 50);
    }
  };

  // ─── Success State ──────────────────────────────
  if (state === "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="size-5 text-green-600 shrink-0" />
          <span className="text-sm font-medium text-green-900">
            E-posta adresiniz başarıyla doğrulandı.
          </span>
        </div>
      </div>
    );
  }

  // ─── Code Input State ───────────────────────────
  if (state === "code_input") {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900">
              <Mail className="size-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900">
                Kod gönderildi
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 truncate">
                {email} — gelen kutunuzdaki 6 haneli kodu girin
              </p>
            </div>
            <button
              type="button"
              onClick={handleDefer}
              className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Daha sonra"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            {code.map((c, i) => (
              <input
                key={i}
                ref={(el) => {
                  codeInputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={c}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="h-12 w-10 rounded-lg border border-gray-300 bg-white text-center text-lg font-semibold text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />
            ))}
          </div>

          {error && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-600">
              <AlertTriangle className="size-3.5" />
              {error}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sending || cooldown > 0}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50"
            >
              {sending
                ? "Gönderiliyor..."
                : cooldown > 0
                  ? `Tekrar gönder (${cooldown}sn)`
                  : "Kod gelmedi mi? Tekrar gönder"}
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying || code.some((c) => !c)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Doğrulanıyor
                </>
              ) : (
                <>
                  Doğrula <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Promote State (default) ────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 pt-4">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900">
            <Mail className="size-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900">
              E-posta adresinizi doğrulayın
            </h3>
            <p className="mt-0.5 text-sm text-gray-600 truncate">{email}</p>
            <p className="mt-1 text-xs text-gray-500">
              Haftalık raporlar, skor değişim alarmları ve Pro üyelik için gerekli.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertTriangle className="size-3.5" />
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleSendCode}
            disabled={sending}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 sm:flex-none"
          >
            {sending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                E-postama Kod Gönder <ArrowRight className="size-3.5" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDefer}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            Daha sonra
          </button>
        </div>
      </div>
    </div>
  );
}
