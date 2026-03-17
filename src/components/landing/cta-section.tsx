export function CtaSection() {
  return (
    <section style={{ padding: "0 24px 80px" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          borderRadius: 24,
          background: "#111",
          padding: "64px 40px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(28px, 3.5vw, 40px)",
            fontWeight: 800,
            letterSpacing: "-1.5px",
            color: "#fff",
            lineHeight: 1.1,
          }}
        >
          Yapay zeka seni tanıyor mu?
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.5)",
            marginTop: 12,
            maxWidth: 400,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.6,
          }}
        >
          30 saniyede öğren. Tamamen ücretsiz.
        </p>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <a
            href="#hero"
            style={{
              padding: "12px 32px",
              borderRadius: 100,
              background: "#fff",
              color: "#111",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Hemen Dene
          </a>
          <a
            href="/login"
            style={{
              padding: "12px 32px",
              borderRadius: 100,
              background: "transparent",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            Pro ile Başla
          </a>
        </div>
      </div>
    </section>
  );
}
