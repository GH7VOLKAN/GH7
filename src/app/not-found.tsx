/**
 * 404 — Kinde editorial design (Brief H-polish Aşama 5).
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <div className="text-label text-muted-foreground mb-6">GH7 · 404</div>
      <h1 className="text-display mb-6">Sayfa bulunamadı.</h1>
      <p className="mb-10 text-base leading-relaxed text-muted-foreground">
        Aradığın sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
        Dashboard&apos;a dönüp oradan ilerlemeyi dene.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Dashboard&apos;a Git →
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium tracking-tight transition-colors hover:border-foreground/30"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
