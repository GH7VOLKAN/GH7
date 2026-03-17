const weekData = [
  { day: "Pzt", value: 35 },
  { day: "Sal", value: 42 },
  { day: "Çar", value: 38 },
  { day: "Per", value: 52 },
  { day: "Cum", value: 48 },
  { day: "Cmt", value: 55 },
  { day: "Paz", value: 65 },
];

export function FeatureVisualTracking() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 20,
        padding: 32,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Haftalık Takip</p>
        </div>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 100,
            background: "#f0fdf4",
            fontSize: 11,
            fontWeight: 700,
            color: "#16a34a",
          }}
        >
          +12% bu hafta
        </span>
      </div>

      {/* Chart */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
        {weekData.map((d, i) => (
          <div
            key={d.day}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: "100%",
                height: `${d.value}%`,
                borderRadius: "6px 6px 0 0",
                background: i === weekData.length - 1 ? "#111" : "#f0f0f0",
                transition: "height 0.5s ease",
              }}
            />
            <span style={{ fontSize: 10, color: "#999" }}>{d.day}</span>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: "1px solid #f0f0f0",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>65</p>
          <p style={{ fontSize: 10, color: "#999" }}>Bu Hafta</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>35</p>
          <p style={{ fontSize: 10, color: "#999" }}>Geçen Hafta</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#22c55e" }}>+30</p>
          <p style={{ fontSize: 10, color: "#999" }}>Değişim</p>
        </div>
      </div>
    </div>
  );
}
