interface PageHeroProps {
  title: string;
  description: string;
  badge?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function PageHero({ title, description, badge, action }: PageHeroProps) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderBottom: "1px solid #E5E7EB",
      padding: "32px 0",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
        {badge && (
          <span style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
            letterSpacing: "0.8px", color: "#9CA3AF",
            display: "block", marginBottom: 12,
          }}>
            {badge}
          </span>
        )}
        <h1 style={{
          fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800,
          letterSpacing: "-0.03em", color: "#09090B",
          marginBottom: 8, lineHeight: 1.2,
        }}>
          {title}
        </h1>
        <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6, maxWidth: 560 }}>
          {description}
        </p>
        {action && (
          <a
            href={action.href}
            style={{
              display: "inline-block", marginTop: 16,
              fontSize: 14, fontWeight: 700, color: "#09090B",
              textDecoration: "none",
            }}
          >
            {action.label} →
          </a>
        )}
      </div>
    </div>
  );
}
