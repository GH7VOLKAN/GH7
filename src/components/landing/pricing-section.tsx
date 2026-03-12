import Link from "next/link";
import { CheckIcon, XIcon } from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

const freePlan: PlanFeature[] = [
  { text: "Günde 1 test", included: true },
  { text: "4 AI platform taraması", included: true },
  { text: "Genel AI görünürlük skoru", included: true },
  { text: "3 temel içgörü", included: true },
  { text: "Rakip analizi", included: false },
  { text: "Haftalık takip raporu", included: false },
  { text: "Kişisel aksiyon planı", included: false },
  { text: "Kaynak ve prompt analizi", included: false },
];

const proPlan: PlanFeature[] = [
  { text: "Sınırsız test", included: true },
  { text: "4 AI platform taraması", included: true },
  { text: "Detaylı AI görünürlük skoru", included: true },
  { text: "Tüm içgörüler ve analizler", included: true },
  { text: "Rakip analizi", included: true },
  { text: "Haftalık otomatik takip", included: true },
  { text: "Kişisel aksiyon planı", included: true },
  { text: "Kaynak ve prompt analizi", included: true },
  { text: "Öncelikli destek", included: true },
];

function FeatureItem({ feature }: { feature: PlanFeature }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      {feature.included ? (
        <CheckIcon className="size-4 shrink-0 text-green-500" />
      ) : (
        <XIcon className="size-4 shrink-0 text-muted-foreground/40" />
      )}
      <span className={feature.included ? "" : "text-muted-foreground/60"}>
        {feature.text}
      </span>
    </li>
  );
}

export function PricingSection() {
  return (
    <section id="fiyatlandirma" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Fiyatlandırma
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            Hemen başla, sonuçları gör
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            7 gün ücretsiz dene. İstediğin zaman iptal et.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-2">
          {/* Free plan */}
          <div className="rounded-2xl border border-border p-8">
            <p className="text-sm font-bold text-muted-foreground">Ücretsiz</p>
            <p className="mt-2 text-4xl font-bold">
              0₺
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sonsuza kadar
            </p>

            <ul className="mt-8 space-y-4">
              {freePlan.map((f) => (
                <FeatureItem key={f.text} feature={f} />
              ))}
            </ul>

            <Link
              href="/login"
              className="mt-8 flex w-full items-center justify-center rounded-lg border border-border px-8 py-3.5 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Ücretsiz Dene
            </Link>
          </div>

          {/* Pro plan */}
          <div className="relative rounded-2xl border-2 border-foreground bg-foreground/[0.02] p-8">
            {/* Popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-1 text-xs font-bold text-background">
              En Popüler
            </div>

            <p className="text-sm font-bold">Pro</p>
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
                <FeatureItem key={f.text} feature={f} />
              ))}
            </ul>

            <Link
              href="/login"
              className="mt-8 flex w-full items-center justify-center rounded-lg bg-foreground px-8 py-3.5 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Pro ile Başla
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
