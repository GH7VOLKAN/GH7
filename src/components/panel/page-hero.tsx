export interface HeroStat {
  label: string;
  value: string;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
}

interface PageHeroProps {
  title: string;
  description: string;
  badge?: string;
  action?: {
    label: string;
    href: string;
  };
  stats?: HeroStat[];
}

export function PageHero({ title, description, badge, action, stats }: PageHeroProps) {
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

        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4"
              >
                <div className="text-xs font-medium text-gray-400 mb-1">
                  {stat.label}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[22px] font-extrabold text-gray-900 tracking-tight">
                    {stat.value}
                  </span>
                  {stat.delta && (
                    <span
                      className={`text-xs font-semibold ${
                        stat.deltaType === "positive"
                          ? "text-green-600"
                          : stat.deltaType === "negative"
                          ? "text-red-600"
                          : "text-gray-400"
                      }`}
                    >
                      {stat.deltaType === "positive" && "↑ "}
                      {stat.deltaType === "negative" && "↓ "}
                      {stat.delta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
