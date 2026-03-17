import Link from "next/link";

interface FeatureSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  visual: React.ReactNode;
  reversed?: boolean;
}

export function FeatureSection({
  eyebrow,
  title,
  description,
  ctaText,
  ctaHref = "/login",
  visual,
  reversed = false,
}: FeatureSectionProps) {
  return (
    <section style={{ padding: "80px 24px" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
        className="grid-cols-1! lg:grid-cols-2!"
      >
        {/* Text side */}
        <div style={{ order: reversed ? 2 : 1 }} className={reversed ? "lg:order-2" : ""}>
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
              background: "#f5f5f5",
              marginBottom: 16,
            }}
          >
            {eyebrow}
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              color: "#111",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "#888",
              marginTop: 16,
              maxWidth: 440,
            }}
          >
            {description}
          </p>
          {ctaText && (
            <Link
              href={ctaHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 24,
                padding: "10px 24px",
                borderRadius: 100,
                background: "#111",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {ctaText}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Visual side */}
        <div style={{ order: reversed ? 1 : 2 }} className={reversed ? "lg:order-1" : ""}>
          {visual}
        </div>
      </div>
    </section>
  );
}
