"use client";

export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body>
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 800,
              marginBottom: "12px",
            }}
          >
            Beklenmeyen bir hata oluştu
          </h2>
          <p style={{ color: "#6B7280", marginBottom: "24px" }}>
            Ekibimiz bilgilendirildi. Lütfen tekrar deneyin.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#09090B",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}
