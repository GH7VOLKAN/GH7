import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GH7.ai AI G\u00f6r\u00fcn\u00fcrl\u00fck Analizi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let pageData = {
    query: "AI G\u00f6r\u00fcn\u00fcrl\u00fck Analizi",
    sector: "GEO",
    firms: 0,
    platforms: 0,
  };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://gh7.ai"}/api/query-pages/${slug}`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      pageData = {
        query: data.originalQuery || "AI Gorunurluk Analizi",
        sector: (data.sector || "geo").replace(/-/g, " ").toUpperCase(),
        firms: data.totalFirmsMentioned || 0,
        platforms: data.totalPlatformsResponded || 0,
      };
    }
  } catch {
    // Use defaults on error
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#212121",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 48,
            letterSpacing: 1,
          }}
        >
          GH7.ai
        </div>
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: 2,
            marginBottom: 20,
            textTransform: "uppercase" as const,
          }}
        >
          {pageData.sector}
        </div>
        <div
          style={{
            color: "#999999",
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1.4,
            marginBottom: 40,
            maxWidth: "80%",
          }}
        >
          {pageData.query.replace(/[?!]/g, "").substring(0, 80)}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginTop: "auto",
          }}
        >
          <div
            style={{ width: 40, height: 1, backgroundColor: "#333333" }}
          />
          <div style={{ color: "#666666", fontSize: 16 }}>
            {pageData.firms} firma · {pageData.platforms} platform
          </div>
          <div
            style={{ width: 40, height: 1, backgroundColor: "#333333" }}
          />
          <div style={{ color: "#555555", fontSize: 14 }}>gh7.ai/analiz</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
