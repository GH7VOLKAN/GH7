import Link from "next/link";
import { GH7Logo } from "@/components/gh7-logo";
import { createClient } from "@/lib/supabase/server";

const navLinks = [
  { label: "Nasıl Çalışır", href: "#nasil-calisir" },
  { label: "Fiyatlandırma", href: "#fiyatlandirma" },
];

export async function Navbar() {
  let isLoggedIn = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    isLoggedIn = !!user;
  } catch {
    // Auth check failed — show logged-out state
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <GH7Logo size="default" />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard/genel"
              className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Kontrol Paneli
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Giriş Yap
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                Pro Başla
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
