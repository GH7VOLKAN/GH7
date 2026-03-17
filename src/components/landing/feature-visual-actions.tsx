const actions = [
  { text: "İşletme bilgilerini internette tamamla", done: true },
  { text: "Müşterilerin sık sorduğu soruları cevapla", done: true },
  { text: "Güvenilir sitelerde adının geçmesini sağla", done: false },
  { text: "Hizmetlerini rakamlarla ve örneklerle anlat", done: false },
  { text: "İnternet profillerini güncel tut", done: false },
];

export function FeatureVisualActions() {
  const completed = actions.filter((a) => a.done).length;
  const pct = (completed / actions.length) * 100;

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
              background: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Gelişim Planı</p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>
          {completed}/{actions.length}
        </span>
      </div>

      {/* Actions list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {actions.map((action, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 0",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                border: action.done ? "none" : "1.5px solid #e5e5e5",
                background: action.done ? "#f0fdf4" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {action.done && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
            <p
              style={{
                fontSize: 13,
                color: action.done ? "#999" : "#444",
                textDecoration: action.done ? "line-through" : "none",
              }}
            >
              {action.text}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 20, height: 6, borderRadius: 3, background: "#f0f0f0", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: "#22c55e" }} />
      </div>
    </div>
  );
}
