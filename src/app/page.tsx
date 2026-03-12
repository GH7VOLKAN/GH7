import Link from "next/link";
import { GH7Logo } from "@/components/gh7-logo";
import { GH7Icon } from "@/components/gh7-icon";
import { FreeToolWidget } from "@/components/free-tool/free-tool-widget";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <GH7Logo size="default" />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Giriş Yap
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Pro
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-12">
        <div className="text-center">
          <GH7Icon size={40} className="mx-auto mb-6 text-muted-foreground/30" />
          <h1 className="text-4xl font-light tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Yapay Zeka Seni
            <span className="block font-medium">Tanıyor mu?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            ChatGPT, Claude, Gemini ve Perplexity&apos;de adını veya firmanı test et.
            <span className="font-medium text-foreground"> 30 saniyede öğren.</span>
          </p>
        </div>
      </section>

      {/* Free Tool Widget */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <FreeToolWidget />
      </section>

      {/* How it works — brief */}
      <section className="border-y border-border bg-background-secondary">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Nasıl Çalışır
          </p>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Test Et",
                desc: "Adını veya firma adını gir. 4 AI platformunda anında tara.",
              },
              {
                step: "2",
                title: "Sonuçları Gör",
                desc: "Hangi platformlar seni tanıyor, hangileri tanımıyor — hemen öğren.",
              },
              {
                step: "3",
                title: "Pro ile Derinleş",
                desc: "Senin yerine kim öneriliyor? Neden tanımıyor? Haftalık takip başlat.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex size-10 items-center justify-center rounded-full border border-border text-sm font-bold text-muted-foreground">
                  {item.step}
                </div>
                <h3 className="mt-3 text-sm font-bold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-xl border border-border bg-foreground p-8 text-center sm:p-14">
          <h2 className="text-2xl font-light tracking-[-0.04em] text-background sm:text-3xl">
            AI yanıtlarında yerinizi alın
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-background/60">
            Kişisel veya kurumsal — AI görünürlüğünüzü ölçün, takip edin, artırın.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-background px-8 py-3.5 text-sm font-bold text-foreground transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Pro Başla — 2.495₺/ay
            </Link>
          </div>
          <p className="mt-3 text-xs text-background/40">
            7 gün ücretsiz deneme. Kredi kartı gerekmez.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
          <GH7Logo size="sm" />
          <p className="text-xs text-muted-foreground">
            2026 GH7.ai — Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
