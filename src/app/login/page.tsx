"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GH7Logo } from "@/components/gh7-logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <GH7Logo className="text-3xl" />
          <p className="mt-2 text-sm text-muted-foreground">
            AI Görünürlük Yönetim Platformu
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="örnek@firma.com"
              className="mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Şifre
            </label>
            <input
              type="password"
              placeholder="********"
              className="mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-colors"
            />
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            Giriş Yap
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-lg border border-border px-4 py-3 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            Google ile Giriş
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Hesabınız yok mu?{" "}
          <button className="font-bold text-foreground underline">
            Kayıt Olun
          </button>
        </p>
      </div>
    </div>
  );
}
