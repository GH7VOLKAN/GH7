"use client";

import { FadeIn, Stagger, AnimatedNumber } from "@/components/kinde/animations";
import { PlatformLogo } from "@/components/kinde/ai-logos";
import { GH7Logo } from "@/components/gh7-logo";

const PLATFORMS = ["openai", "anthropic", "gemini", "perplexity", "google_aio"];

const VALUE = [
  { t: "Ölç", d: "5 AI motorunda (ChatGPT, Claude, Gemini, Perplexity, Google) markanın gerçekte nasıl göründüğünü, kaçıncı sırada çıktığını ölçer." },
  { t: "Rakibi gör", d: "Senin yerine hangi firmaların önerildiğini ve AI'ların hangi kaynaklara güvendiğini ortaya çıkarır." },
  { t: "Aksiyon ver", d: "Her kayıp sorgu için kopyala-yapıştır hazır içerik: FAQ, JSON-LD şema ve sayfa aksiyonları." },
];

const TIERS = [
  { name: "Standart", prompts: 10, note: "Hızlı görünürlük taraması" },
  { name: "Pro", prompts: 100, note: "Derin analiz + rakip haritası", featured: true },
  { name: "Max", prompts: 500, note: "Tam kapsam + white-label rapor" },
];

export default function HomePage() {
  return (
    <div style={{ background: "#fafafa", color: "#111", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", minHeight: "100vh" }}>
      <header style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <GH7Logo size="default" />
        <a href="mailto:info@gh7.ai" style={ctaSmall}>İletişime geç</a>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "64px 20px 40px", textAlign: "center" }}>
        <FadeIn>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 3, color: "#bbb", marginBottom: 16 }}>
            Türkiye'nin AI görünürlük motoru
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05 }}>
            AI seni değil<br />rakibini öneriyor.
          </h1>
          <p style={{ fontSize: 18, color: "#666", marginTop: 20, lineHeight: 1.6 }}>
            Müşterilerin artık Google yerine ChatGPT, Claude, Gemini ve Perplexity'ye soruyor.
            Bu yapay zekâlar seni mi öneriyor, rakibini mi? Ölçüyoruz, sebebini buluyoruz, kapatıyoruz.
          </p>
          <div style={{ marginTop: 28 }}>
            <a href="mailto:info@gh7.ai" style={ctaPrimary}>Görünürlüğünü ölç →</a>
          </div>
        </FadeIn>

        <Stagger className="flex items-center justify-center gap-4">
          {PLATFORMS.map((p) => (
            <div key={p} style={{ marginTop: 40 }}>
              <PlatformLogo platform={p} size={40} />
            </div>
          ))}
        </Stagger>
      </section>

      {/* Value */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 20px" }}>
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {VALUE.map((v) => (
            <div key={v.t} style={card}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{v.t}</div>
              <p style={{ fontSize: 14, color: "#666", marginTop: 8, lineHeight: 1.6 }}>{v.d}</p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* Honest result framing */}
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "48px 20px", textAlign: "center" }}>
        <FadeIn>
          <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px" }}>Vaadimiz görünürlük, masal değil.</h2>
          <p style={{ fontSize: 16, color: "#666", marginTop: 14, lineHeight: 1.7 }}>
            Ciro garantisi vermiyoruz. Ölçülebilir olanı sunuyoruz: AI aramada bulunma oranın,
            rakibe karşı konumun ve zamanla bunu koruyup geliştirmen. Öncesi → sonrası, net.
          </p>
          <div className="flex items-center justify-center gap-10" style={{ marginTop: 28 }}>
            <Metric value={5} label="AI motoru" />
            <Metric value={3} label="dakikada rapor" />
            <Metric value={100} label="hazır aksiyon" suffix="+" />
          </div>
        </FadeIn>
      </section>

      {/* Tiers (marketing) */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 20px 80px" }}>
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.name} style={{ ...card, border: t.featured ? "2px solid #111" : "1px solid #eee" }}>
              <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: "#bbb" }}>{t.name}</div>
              <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px", marginTop: 6 }}>
                {t.prompts}
                <span style={{ fontSize: 15, fontWeight: 500, color: "#999" }}> prompt</span>
              </div>
              <p style={{ fontSize: 14, color: "#666", marginTop: 6 }}>{t.note}</p>
              <a href="mailto:info@gh7.ai" style={{ ...ctaSmall, display: "block", textAlign: "center", marginTop: 18 }}>Başla</a>
            </div>
          ))}
        </Stagger>
      </section>

      <footer style={{ textAlign: "center", padding: "0 20px 48px", fontSize: 12, color: "#bbb" }}>
        GH7 · AI Görünürlük
      </footer>
    </div>
  );
}

function Metric({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  return (
    <div>
      <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px" }}>
        <AnimatedNumber value={value} suffix={suffix} />
      </div>
      <div style={{ fontSize: 13, color: "#999" }}>{label}</div>
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", border: "1px solid #eee", borderRadius: 20, padding: 28 };
const ctaPrimary: React.CSSProperties = { display: "inline-block", padding: "14px 28px", borderRadius: 9999, background: "#111", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none" };
const ctaSmall: React.CSSProperties = { padding: "9px 18px", borderRadius: 9999, background: "#111", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" };
