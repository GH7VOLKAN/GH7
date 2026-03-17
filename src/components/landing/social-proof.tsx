"use client";

const stats = [
  { value: "4", label: "Yapay Zeka Platformu" },
  { value: "30sn", label: "Sonuç Süresi" },
  { value: "1,247+", label: "Aktif Kullanıcı" },
  { value: "%99", label: "Doğruluk Oranı" },
];

const platforms = [
  { name: "ChatGPT", icon: "/chatgpt-icon.webp" },
  { name: "Claude", icon: "/claude-ai-icon.webp" },
  { name: "Gemini", icon: "/google-gemini-icon.webp" },
  { name: "Perplexity", icon: "/perplexity-ai-icon.webp" },
  { name: "Grok", icon: "/grok-icon.webp" },
];

export function SocialProof() {
  return (
    <section style={{ borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        {/* Stats */}
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}
          className="grid-cols-2! sm:grid-cols-4!"
        >
          {stats.map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px", color: "#111" }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Platform logos */}
        <div
          style={{
            marginTop: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          {platforms.map((p) => (
            <div
              key={p.name}
              style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.6 }}
            >
              <img
                src={p.icon}
                alt={p.name}
                style={{ width: 24, height: 24, borderRadius: 6 }}
              />
              <span style={{ fontSize: 13, fontWeight: 500, color: "#888" }}>
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
