export default function AnalysisLoading() {
  return (
    <div style={{ maxWidth: 800, margin: "80px auto", padding: "0 24px" }}>
      <div
        style={{
          height: 40,
          width: "60%",
          background: "#F3F4F6",
          borderRadius: 8,
          marginBottom: 16,
        }}
      />
      <div
        style={{
          height: 20,
          width: "80%",
          background: "#F3F4F6",
          borderRadius: 6,
          marginBottom: 40,
        }}
      />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 80,
            background: "#F9FAFB",
            borderRadius: 12,
            marginBottom: 8,
            border: "1px solid #E5E7EB",
          }}
        />
      ))}
    </div>
  );
}
