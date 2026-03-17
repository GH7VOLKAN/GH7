import { GH7Logo } from "@/components/gh7-logo";

const columns = [
  {
    title: "Ürün",
    links: [
      { label: "Nasıl Çalışır", href: "#nasil-calisir" },
      { label: "Fiyatlandırma", href: "#fiyatlandirma" },
      { label: "Aylık Takip", href: "/login" },
      { label: "Biz Yapalım", href: "/login" },
    ],
  },
  {
    title: "Şirket",
    links: [
      { label: "Hakkımızda", href: "#" },
      { label: "Blog", href: "#" },
      { label: "İletişim", href: "#" },
    ],
  },
  {
    title: "Destek",
    links: [
      { label: "Yardım Merkezi", href: "#" },
      { label: "SSS", href: "#" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { label: "Gizlilik Politikası", href: "#" },
      { label: "Kullanım Şartları", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #f0f0f0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
            gap: 32,
          }}
          className="grid-cols-2! lg:grid-cols-5!"
        >
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <GH7Logo size="default" />
            <p style={{ fontSize: 13, color: "#888", marginTop: 12, maxWidth: 220, lineHeight: 1.6 }}>
              Yapay zekalarda görünür olmanızı sağlıyoruz.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {col.title}
              </p>
              <ul style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      style={{ fontSize: 13, color: "#888", textDecoration: "none" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <p style={{ fontSize: 12, color: "#999" }}>
            2026 GH7.ai — Tüm hakları saklıdır.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* X / Twitter */}
            <a href="#" aria-label="X" style={{ color: "#999" }}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" aria-label="LinkedIn" style={{ color: "#999" }}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
