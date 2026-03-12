import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

interface FeatureSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  visual: React.ReactNode;
  reversed?: boolean;
}

export function FeatureSection({
  eyebrow,
  title,
  description,
  ctaText,
  ctaHref = "/login",
  visual,
  reversed = false,
}: FeatureSectionProps) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Text side */}
          <div className={reversed ? "lg:order-last" : ""}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
            {ctaText && (
              <Link
                href={ctaHref}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
              >
                {ctaText}
                <ArrowRightIcon className="size-4" />
              </Link>
            )}
          </div>

          {/* Visual side */}
          <div className={reversed ? "lg:order-first" : ""}>
            {visual}
          </div>
        </div>
      </div>
    </section>
  );
}
