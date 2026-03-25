"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AgencyReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyword?: string;
  pageType: string;
}

export function AgencyReportModal({
  open,
  onOpenChange,
  keyword,
  pageType,
}: AgencyReportModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    onOpenChange(false);
    // Reset state after close animation
    setTimeout(() => {
      setEmail("");
      setMessage("");
      setSuccess(false);
      setError(null);
    }, 200);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/panel/agency-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim() || undefined,
          keyword: keyword || undefined,
          pageType,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Bir hata olustu. Lutfen tekrar deneyin.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajansınıza Rapor Gönderin</DialogTitle>
          <DialogDescription>
            Bu optimizasyon raporunu ajans ortağınıza e-posta ile gönderin
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-6 w-6 text-gray-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">Rapor başarıyla gönderildi!</p>
            <p className="mt-1 text-xs text-gray-500">{email} adresine gönderildi.</p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Kapat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {keyword && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-500">Anahtar Kelime</p>
                <p className="text-sm font-medium text-gray-900 truncate">{keyword}</p>
              </div>
            )}

            <div>
              <label htmlFor="agency-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Ajans E-posta Adresi
              </label>
              <input
                id="agency-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ajans@ornek.com"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="agency-message" className="mb-1.5 block text-sm font-medium text-gray-700">
                Mesaj <span className="font-normal text-gray-400">(opsiyonel)</span>
              </label>
              <textarea
                id="agency-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ajansınıza iletmek istediğiniz ek notlar..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Gönderiliyor..." : "Gönder"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
