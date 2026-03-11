"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GH7Logo } from "@/components/gh7-logo";
import { GH7Icon } from "@/components/gh7-icon";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [registered, setRegistered] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err) {
      console.error("[auth] Google login error:", err);
      setError(err instanceof Error ? err.message : "Bağlantı hatası. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          setError(error.message);
        } else {
          setRegistered(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          router.push("/dashboard/genel");
          router.refresh();
          return; // Don't reset loading — page will redirect
        }
      }
    } catch (err) {
      console.error("[auth] Email auth error:", err);
      setError(err instanceof Error ? err.message : "Bağlantı hatası. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left — form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <Link href="/">
              <GH7Logo size="default" />
            </Link>
            <h1 className="mt-6 text-2xl font-light tracking-[-0.04em]">
              {mode === "login" ? "Hesabınıza giriş yapın" : "Yeni hesap oluşturun"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              AI görünürlük yönetim platformu
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {registered && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
              Kayıt başarılı! E-posta adresinize gönderilen doğrulama linkine tıklayın.
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border px-4 py-3 text-sm font-medium transition-transform hover:scale-[1.01] hover:bg-background-secondary active:scale-[0.99] disabled:opacity-50"
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
              Google ile {mode === "login" ? "Giriş" : "Kayıt"}
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
                className="mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm transition-colors focus:border-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                minLength={6}
                className="mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm transition-colors focus:border-foreground focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
            >
              {loading
                ? "Yükleniyor..."
                : mode === "login"
                  ? "Giriş Yap"
                  : "Kayıt Ol"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {mode === "login" ? (
              <>
                Hesabınız yok mu?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className="font-bold text-foreground underline"
                >
                  Ücretsiz Kayıt Olun
                </button>
              </>
            ) : (
              <>
                Zaten hesabınız var mı?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="font-bold text-foreground underline"
                >
                  Giriş Yapın
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right — visual panel (desktop only) */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-foreground lg:p-12">
        <div className="max-w-md">
          <GH7Icon size={48} className="mb-10 text-background/20" />

          <h2 className="text-2xl font-light tracking-[-0.04em] text-background">
            AI yanıtlarında markanızın
            <br />
            görünürlüğünü ölçün
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-background/50">
            ChatGPT, Claude, Gemini ve Perplexity — kullanıcılar artık arama
            yerine AI&apos;a soruyor. Markanız bu yanıtlarda yer alıyor mu?
          </p>

          <div className="mt-10 space-y-5">
            {[
              {
                step: "1",
                title: "AI Bahsedilme Taraması",
                desc: "4 büyük AI platformunda markanızın ne sıklıkta ve hangi bağlamda bahsedildiğini analiz edin.",
              },
              {
                step: "2",
                title: "Site Hazırlık Analizi",
                desc: "Web sitenizin yapılandırılmış veri, teknik SEO ve içerik açısından AI'a ne kadar hazır olduğunu görün.",
              },
              {
                step: "3",
                title: "Aksiyon Planı",
                desc: "Skorunuzu artırmak için önceliklendirilmiş adımları takip edin. İsterseniz biz uygulayalım.",
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
              { label: "AI Platform", value: "4" },
              { label: "SEO Kontrol", value: "13" },
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
