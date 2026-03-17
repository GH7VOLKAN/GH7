import Link from "next/link";

export function HeroSection() {
  return (
    <section id="hero" style={{ padding: "80px 24px 60px", textAlign: "center" }}>
      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 16px",
          borderRadius: 100,
          background: "#f5f5f5",
          fontSize: 12,
          fontWeight: 600,
          color: "#666",
          marginBottom: 24,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
        GEO &mdash; Generative Engine Optimization
      </div>

      <h1
        style={{
          fontSize: "clamp(40px, 6vw, 72px)",
          fontWeight: 800,
          letterSpacing: "-2.5px",
          lineHeight: 1.05,
          color: "#111",
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        Yapay Zeka
        <br />
        Seni Tanıyor mu?
      </h1>

      <p
        style={{
          fontSize: 17,
          color: "#888",
          maxWidth: 500,
          margin: "20px auto 0",
          lineHeight: 1.6,
        }}
      >
        Müşterilerin artık yapay zekaya soruyor. Seni öneriyorlar mı?{" "}
        <span style={{ fontWeight: 600, color: "#111" }}>Ücretsiz analiz et.</span>
      </p>

      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "16px 48px",
            borderRadius: 12,
            background: "#111",
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
        >
          Ücretsiz Başla →
        </Link>
        <span style={{ fontSize: 13, color: "#999" }}>Kredi kartı gerekmez • 2 dakikada kurulum</span>
      </div>
    </section>
  );
}
