import Link from "next/link";
import { CheckIcon } from "lucide-react";

const freePlan = [
  "Adını yaz, sonucunu gör",
  "4 yapay zekada test",
  "Temel sonuç raporu",
];

const proPlan = [
  "Her hafta otomatik kontrol",
  "Senin yerine kimin önerildiğini gör",
  "Ne yapman gerektiğini öğren",
  "Değişimleri takip et",
  "Öncelikli destek",
];

const bizYapalim = [
  "Her şeyi biz yaparız",
  "4-6 haftada tamamlanır",
  "Sen sadece sonucu takip edersin",
];

export function PricingSection() {
  return (
    <section id="fiyatlandirma" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Fiyatlandırma
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] sm:text-3xl lg:text-4xl">
            Hemen başla, sonuçları gör
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            7 gün ücretsiz dene. İstediğin zaman iptal et.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-3">
          {/* Ücretsiz */}
          <div className="rounded-2xl border border-border p-6 sm:p-8">
            <p className="text-sm font-bold text-muted-foreground">Ücretsiz</p>
            <p className="mt-2 text-4xl font-bold">0₺</p>
            <p className="mt-1 text-sm text-muted-foreground">Sonsuza kadar</p>

            <ul className="mt-8 space-y-4">
              {freePlan.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <CheckIcon className="size-4 shrink-0 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="#hero"
              className="mt-8 flex w-full items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Ücretsiz dene
            </Link>
          </div>

          {/* Aylık Takip — En Popüler */}
          <div className="relative rounded-2xl border-2 border-foreground bg-foreground/[0.02] p-6 sm:p-8">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-1 text-xs font-bold text-background">
              En Popüler
            </div>

            <p className="text-sm font-bold">Aylık Takip</p>
            <p className="mt-2 text-4xl font-bold">
              2.495₺
              <span className="text-base font-normal text-muted-foreground">
                /ay
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              7 gün ücretsiz deneme
            </p>

            <ul className="mt-8 space-y-4">
              {proPlan.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <CheckIcon className="size-4 shrink-0 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="mt-8 flex w-full items-center justify-center rounded-lg bg-foreground px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Takibi başlat
            </Link>
          </div>

          {/* Biz Yapalım */}
          <div className="rounded-2xl border border-border p-6 sm:p-8">
            <p className="text-sm font-bold text-muted-foreground">
              Biz Yapalım
            </p>
            <p className="mt-2 text-4xl font-bold">
              15.000₺
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tek seferlik
            </p>

            <ul className="mt-8 space-y-4">
              {bizYapalim.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <CheckIcon className="size-4 shrink-0 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="mt-8 flex w-full items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Bize ulaşın
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
