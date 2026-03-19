import Link from "next/link";

interface PlanFeature {
  text: string;
}

const plans = [
  {
    name: "Ücretsiz",
    price: "0₺",
    period: "Sonsuza kadar",
    cta: "Ücretsiz Dene",
    ctaStyle: "outline" as const,
    popular: false,
    features: [
      { text: "Adını veya firmanı yaz, sonucunu gör" },
      { text: "5 yapay zekada tarama" },
      { text: "10 soru analizi" },
    ],
  },
  {
    name: "Pro",
    price: "2.495₺",
    period: "7 gün ücretsiz deneme",
    cta: "Takibe Başla",
    ctaStyle: "solid" as const,
    popular: true,
    features: [
      { text: "1 marka takibi" },
      { text: "50 soru (tamamı)" },
      { text: "10 rakip analizi" },
      { text: "Haftada 3 otomatik kontrol" },
      { text: "Haftalık değişimleri takip et" },
      { text: "Haftalık e-posta raporu" },
    ],
  },
  {
    name: "Business",
    price: "7.495₺",
    period: "Çoklu marka yönetimi",
    cta: "Başla",
    ctaStyle: "outline" as const,
    popular: false,
    features: [
      { text: "Pro'daki her şey" },
      { text: "3 marka yönetimi" },
      { text: "50 soru/marka" },
      { text: "10 rakip/marka" },
      { text: "Marka karşılaştırma" },
      { text: "Öncelikli destek" },
    ],
  },
  {
    name: "Ajans",
    price: "19.995₺",
    period: "Günlük tarama, sınırsız güç",
    cta: "Bize Ulaşın",
    ctaStyle: "outline" as const,
    popular: false,
    features: [
      { text: "Business'taki her şey" },
      { text: "25 marka yönetimi" },
      { text: "50 soru/marka" },
      { text: "10 rakip/marka" },
      { text: "White label & API erişimi" },
      { text: "Ajans paneli" },
    ],
  },
];

function FeatureItem({ feature }: { feature: PlanFeature }) {
  return (
    <li style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <span style={{ color: "#555" }}>{feature.text}</span>
    </li>
  );
}

export function PricingSection() {
  return (
    <section id="fiyatlandirma" style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
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
            Fiyatlandırma
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-1.5px",
              color: "#111",
            }}
          >
            Hemen başla, sonuçları gör
          </h2>
          <p style={{ fontSize: 15, color: "#888", marginTop: 12, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
            Ücretsiz dene. İstediğin zaman iptal et.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            maxWidth: 1100,
            margin: "0 auto",
          }}
          className="grid-cols-1! sm:grid-cols-2! lg:grid-cols-4!"
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                position: "relative",
                background: "#fff",
                border: plan.popular ? "2px solid #111" : "1px solid #eee",
                borderRadius: 20,
                padding: 28,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "5px 16px",
                    borderRadius: 100,
                    background: "#111",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  En Popüler
                </div>
              )}

              <p style={{ fontSize: 13, fontWeight: 700, color: plan.popular ? "#111" : "#888" }}>
                {plan.name}
              </p>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#111", marginTop: 8 }}>
                {plan.price}
                {plan.price !== "0₺" && (
                  <span style={{ fontSize: 14, fontWeight: 400, color: "#888" }}>/ay</span>
                )}
              </p>
              <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>{plan.period}</p>

              <ul style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                {plan.features.map((f) => (
                  <FeatureItem key={f.text} feature={f} />
                ))}
              </ul>

              <Link
                href="/login"
                style={{
                  marginTop: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 24px",
                  borderRadius: 100,
                  background: plan.ctaStyle === "solid" ? "#111" : "transparent",
                  color: plan.ctaStyle === "solid" ? "#fff" : "#111",
                  border: plan.ctaStyle === "solid" ? "none" : "1px solid #eee",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
