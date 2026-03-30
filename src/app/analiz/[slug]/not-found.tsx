import Link from "next/link";

export default function AnalysisNotFound() {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: "120px auto",
        padding: "0 24px",
        textAlign: "center",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 800,
          marginBottom: 16,
          color: "#09090B",
        }}
      >
        Analiz bulunamad&#x131;
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "#6B7280",
          marginBottom: 32,
          lineHeight: 1.6,
        }}
      >
        Bu sorgu hen&#xFC;z analiz edilmemi&#x15F; olabilir. &#xDC;cretsiz GEO analizi yaparak
        firman&#x131;z&#x131;n yapay zeka g&#xF6;r&#xFC;n&#xFC;rl&#xFC;&#x11F;&#xFC;n&#xFC; &#xF6;l&#xE7;ebilirsiniz.
      </p>
      <Link
        href="/analiz"
        style={{
          display: "inline-block",
          background: "#09090B",
          color: "#fff",
          padding: "14px 28px",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
        }}
      >
        &#xDC;cretsiz Analiz Yap
      </Link>
      <div style={{ marginTop: 16 }}>
        <Link
          href="/analizler"
          style={{ fontSize: 14, color: "#6B7280", textDecoration: "none" }}
        >
          veya mevcut analizlere g&#xF6;z at&#x131;n
        </Link>
      </div>
    </div>
  );
}
