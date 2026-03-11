import Link from "next/link";
import { GH7Logo } from "@/components/gh7-logo";

const features = [
  {
    title: "AI Bahsedilme Takibi",
    description:
      "ChatGPT, Claude, Gemini ve Perplexity yanıtlarında markanızın ne sıklıkla ve nasıl bahsedildiğini izleyin.",
  },
  {
    title: "Prompt Görünürlüğü",
    description:
      "Sektörünüzle ilgili promptlarda markanızın konumunu, duygu analizini ve rakiplerinizle karşılaştırmasını görün.",
  },
  {
    title: "Kaynak Analizi",
    description:
      "AI modellerinin yanıtlarında hangi kaynakları referans gösterdiğini ve sitenizin ne kadar atıf aldığını analiz edin.",
  },
  {
    title: "Rakip İstihbaratı",
    description:
      "Rakiplerinizin AI görünürlük skorlarını karşılaştırın, fark analiziyle nerede geride kaldığınızı keşfedin.",
  },
  {
    title: "Site GEO Analizi",
    description:
      "Sitenizin yapılandırılmış veri, içerik ve teknik açıdan AI hazırlık seviyesini ölçün ve iyileştirin.",
  },
  {
    title: "Aksiyon Planı + RaaS",
    description:
      "Önceliklendirilmiş görevlerle skorunuzu artırın. İsterseniz biz uygulayalım — hedefe ulaşınca ödeyin.",
  },
];

const stats = [
  { value: "4", label: "AI Platform" },
  { value: "32+", label: "Aktif Prompt" },
  { value: "7/24", label: "Tarama" },
  { value: "%100", label: "Türkçe" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <GH7Logo size="lg" />
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
              Ücretsiz Dene
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            AI Görünürlük Yönetim Platformu
          </p>
          <h1 className="mt-4 text-4xl font-light tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Markanız AI yanıtlarında
            <span className="block font-medium">görünür mü?</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            ChatGPT, Claude, Gemini ve Perplexity sektörünüzle ilgili sorularda
            markanızı öneriyorlar mı? GH7 ile AI görünürlüğünüzü ölçün,
            rakiplerinizi izleyin ve aksiyona geçin.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-8 py-3.5 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Ücretsiz Başla
            </Link>
            <Link
              href="/dashboard/genel"
              className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3.5 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Demo Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-background-secondary">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-light tracking-[-0.04em] sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Özellikler
        </p>
        <h2 className="mt-3 text-2xl font-light tracking-[-0.04em] sm:text-3xl">
          AI çağında görünürlük yönetimi
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:bg-background-secondary"
            >
              <h3 className="text-sm font-bold tracking-[-0.02em]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-background-secondary">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Nasıl Çalışır
          </p>
          <h2 className="mt-3 text-2xl font-light tracking-[-0.04em] sm:text-3xl">
            3 adımda AI görünürlüğünüzü artırın
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Tarama",
                desc: "Web sitenizi ve sektör promptlarınızı 4 AI platformunda tarayalım.",
              },
              {
                step: "02",
                title: "Analiz",
                desc: "Bahsedilme skorunuz, kaynak analiziniz ve rakip karşılaştırmanızı görün.",
              },
              {
                step: "03",
                title: "Aksiyon",
                desc: "Öncelikli görevleri kendiniz uygulayın veya bize bırakın. Hedefe ulaşınca ödeyin.",
              },
            ].map((item) => (
              <div key={item.step}>
                <span className="text-3xl font-light text-muted-foreground/30">
                  {item.step}
                </span>
                <h3 className="mt-2 text-sm font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
            Rakipleriniz çoktan başladı. Siz de markanızın AI görünürlüğünü bugün ölçmeye başlayın.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-background px-8 py-3.5 text-sm font-bold text-foreground transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            Ücretsiz Başla
          </Link>
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
