const steps = [
  {
    num: "01",
    title: "Adını Yaz",
    desc: "Firma adını veya kendi adını yaz. 5 yapay zekada anında taranır.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Sonucu Gör",
    desc: "Seni tanıyorlar mı, ne diyorlar, senin yerine kimi öneriyorlar — hemen öğren.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Düzelt",
    desc: "Ne yapman gerektiğini söyleriz. İstersen biz senin için yaparız.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m13 2-2 2.5h3L12 7" /><path d="M10 14v-3" /><path d="M14 14v-3" /><path d="M11 19c-1.7 0-3-1.3-3-3v-2h8v2c0 1.7-1.3 3-3 3z" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section
      id="nasil-calisir"
      style={{
        borderTop: "1px solid #f0f0f0",
        borderBottom: "1px solid #f0f0f0",
        background: "#fafafa",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "#999",
              padding: "4px 12px",
              borderRadius: 100,
              background: "#fff",
              border: "1px solid #eee",
              marginBottom: 16,
            }}
          >
            Nasıl Çalışır
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-1.5px",
              color: "#111",
            }}
          >
            Üç adımda yapay zekada görün
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
          className="grid-cols-1! sm:grid-cols-3!"
        >
          {steps.map((item) => (
            <div
              key={item.num}
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 20,
                padding: 32,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                {item.icon}
              </div>

              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#999",
                  letterSpacing: 1,
                }}
              >
                ADIM {item.num}
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111", marginTop: 8 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#888", marginTop: 8, maxWidth: 260, marginLeft: "auto", marginRight: "auto" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
