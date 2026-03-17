const competitors = [
  { rank: 1, name: "Rakip A (Sektör Lideri)", score: 92, isYou: false },
  { rank: 2, name: "Rakip B", score: 78, isYou: false },
  { rank: 3, name: "Senin Markan", score: 45, isYou: true },
  { rank: 4, name: "Rakip C", score: 38, isYou: false },
];

export function FeatureVisualCompetitors() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 20,
        padding: 32,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
          </svg>
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Senin Yerine Kim Öneriliyor?</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {competitors.map((c) => (
          <div
            key={c.rank}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 12,
              background: c.isYou ? "#fafafa" : "transparent",
              border: c.isYou ? "1px solid #eee" : "1px solid transparent",
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                background: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#888",
                flexShrink: 0,
              }}
            >
              {c.rank}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                {c.name}
                {c.isYou && (
                  <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: "#b45309", textTransform: "uppercase" }}>
                    Sen
                  </span>
                )}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 64, height: 5, borderRadius: 3, background: "#f0f0f0", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${c.score}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: c.isYou ? "#f59e0b" : "#111",
                  }}
                />
              </div>
              <span style={{ width: 24, textAlign: "right", fontSize: 12, fontWeight: 700, color: "#888" }}>
                {c.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
