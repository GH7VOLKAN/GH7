"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isOperator } from "@/lib/operator";

export default function PanelLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr("Giriş başarısız. E-posta veya şifre hatalı.");
      setBusy(false);
      return;
    }
    if (!isOperator(data.user?.email)) {
      await supabase.auth.signOut();
      setErr("Bu hesap operatör olarak yetkili değil.");
      setBusy(false);
      return;
    }
    router.push("/panel");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: 20,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 20,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 3, color: "#bbb" }}>
          GH7 · Operatör
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", color: "#111" }}>
          Panel girişi
        </h1>
        <input
          type="email"
          required
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          required
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {err && <div style={{ fontSize: 13, color: "#ef4444" }}>{err}</div>}
        <button
          type="submit"
          disabled={busy}
          style={{
            marginTop: 4,
            padding: "12px 16px",
            borderRadius: 9999,
            border: "none",
            background: "#111",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "11px 14px",
  borderRadius: 12,
  border: "1px solid #e5e5e5",
  fontSize: 14,
  outline: "none",
  background: "#fafafa",
};
