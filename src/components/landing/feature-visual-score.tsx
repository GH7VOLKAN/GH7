const platformBars = [
  { label: "ChatGPT", icon: "/chatgpt-icon.webp", score: 85 },
  { label: "Claude", icon: "/claude-ai-icon.webp", score: 72 },
  { label: "Gemini", icon: "/google-gemini-icon.webp", score: 55 },
  { label: "Perplexity", icon: "/perplexity-ai-icon.webp", score: 90 },
];

export function FeatureVisualScore() {
  const score = 78;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 20,
        padding: 32,
      }}
    >
      {/* Score Ring */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          <svg width="140" height="140" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#f0f0f0" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54"
              fill="none" stroke="#111" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 800, color: "#111" }}>{score}</span>
            <span style={{ fontSize: 10, color: "#999" }}>/100</span>
          </div>
        </div>
      </div>

      {/* Platform bars */}
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        {platformBars.map((p) => (
          <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={p.icon} alt={p.label} style={{ width: 20, height: 20, borderRadius: 5 }} />
            <span style={{ width: 72, fontSize: 12, fontWeight: 500, color: "#888" }}>{p.label}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#f0f0f0", overflow: "hidden" }}>
              <div style={{ width: `${p.score}%`, height: "100%", borderRadius: 3, background: "#111" }} />
            </div>
            <span style={{ width: 28, textAlign: "right", fontSize: 12, fontWeight: 700, color: "#111" }}>
              {p.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
