export function ShowcaseSection() {
  const stats = [
    { label: "GEO Skoru", value: "74/100" },
    { label: "5 AI Platform", value: "Takip ediliyor" },
    { label: "Ses Payı", value: "%26" },
  ];

  return (
    <section
      style={{
        padding: "60px 24px",
        background: "#fff",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          marginBottom: 8,
        }}
      >
        Gerçek Sonuçlar
      </p>

      <h2
        style={{
          fontSize: "clamp(22px, 3vw, 32px)",
          fontWeight: 700,
          color: "#111",
          maxWidth: 600,
          margin: "0 auto",
          lineHeight: 1.3,
        }}
      >
        ISITMAX, GH7.ai ile yapay zeka görünürlüğünü %74&apos;e çıkardı
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 16,
          marginTop: 32,
          flexWrap: "wrap",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "24px 32px",
              minWidth: 180,
              background: "#fff",
            }}
          >
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#111",
                lineHeight: 1.2,
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "#888",
                marginTop: 4,
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 13,
          color: "#aaa",
          marginTop: 24,
        }}
      >
        isitmax.com — Isıtma Sistemleri
      </p>
    </section>
  );
}
