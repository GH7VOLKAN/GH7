import Link from "next/link";
import { GH7Logo } from "@/components/gh7-logo";
import { createClient } from "@/lib/supabase/server";

const navLinks = [
  { label: "Nasıl Çalışır", href: "#nasil-calisir" },
  { label: "Özellikler", href: "#ozellikler" },
  { label: "Fiyatlandırma", href: "#fiyatlandirma" },
];

export async function Navbar() {
  let isLoggedIn = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    isLoggedIn = !!user;
  } catch {
    // Auth check failed
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
        }}
      >
        <GH7Logo size="default" />

        <nav className="hidden md:flex" style={{ gap: 32 }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#888",
                textDecoration: "none",
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isLoggedIn ? (
            <Link
              href="/panel/genel"
              style={{
                padding: "9px 22px",
                borderRadius: 100,
                background: "#111",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Kontrol Paneli
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  padding: "9px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#888",
                  textDecoration: "none",
                }}
              >
                Giriş Yap
              </Link>
              <Link
                href="/login"
                style={{
                  padding: "9px 22px",
                  borderRadius: 100,
                  background: "#111",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Ücretsiz Başla
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
