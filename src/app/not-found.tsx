import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <p className="text-6xl font-extrabold tabular-nums text-muted-foreground/30">404</p>
      <h2 className="text-2xl font-bold">Sayfa Bulunamadı</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link
        href="/dashboard/genel"
        className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02]"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
