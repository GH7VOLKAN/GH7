"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, X, CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  email: string;
  emailVerified: boolean;
}

/**
 * Panel'de e-posta doğrulanmamışsa banner gösterir.
 * searchParams?emailVerify=success/expired/... ise toast bildirimi yapar.
 */
export function EmailVerificationBanner({ email, emailVerified }: Props) {
  const searchParams = useSearchParams();
  const verifyStatus = searchParams.get("emailVerify");
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synthetic phone_*@gh7.ai e-postasını göster ama doğrulamaya zorlama
  const isSyntheticEmail = email.startsWith("phone_") && email.endsWith("@gh7.ai");

  const handleResend = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Gönderilemedi");
        return;
      }
      setSent(true);
    } catch {
      setError("Bir hata oluştu");
    } finally {
      setSending(false);
    }
  };

  // verifyStatus toast
  if (verifyStatus === "success") {
    return (
      <div className="bg-green-50 border-b border-green-200">
        <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center gap-2 text-sm">
          <CheckCircle2 className="size-4 text-green-600 shrink-0" />
          <span className="text-green-800">
            E-posta adresiniz başarıyla doğrulandı.
          </span>
        </div>
      </div>
    );
  }

  if (verifyStatus === "expired" || verifyStatus === "invalid") {
    return (
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center gap-2 text-sm">
          <AlertTriangle className="size-4 text-amber-600 shrink-0" />
          <span className="text-amber-800">
            Doğrulama linki geçersiz veya süresi dolmuş. Yeni link gönderin.
          </span>
        </div>
      </div>
    );
  }

  if (emailVerified || isSyntheticEmail || dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center gap-3 text-sm">
        <Mail className="size-4 text-amber-600 shrink-0" />
        <span className="flex-1 text-amber-800">
          <strong>{email}</strong> e-posta adresinizi onaylayın.
          {sent && " ✓ Doğrulama maili gönderildi."}
        </span>
        {!sent && (
          <button
            type="button"
            onClick={handleResend}
            disabled={sending}
            className="shrink-0 rounded-md bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {sending ? "Gönderiliyor…" : "Tekrar Gönder"}
          </button>
        )}
        {error && (
          <span className="shrink-0 text-xs text-red-600">{error}</span>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded p-1 text-amber-600 hover:bg-amber-100"
          aria-label="Kapat"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
