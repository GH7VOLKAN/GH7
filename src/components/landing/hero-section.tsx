import { GH7Icon } from "@/components/gh7-icon";
import { FreeToolWidget } from "@/components/free-tool/free-tool-widget";

export function HeroSection() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28 sm:pb-12 lg:px-8">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <GH7Icon size={14} className="text-foreground" />
            Yapay Zeka Görünürlük Aracı
          </div>

          <h1 className="text-3xl font-light tracking-[-0.04em] sm:text-4xl md:text-5xl lg:text-6xl">
            Yapay zekaya soruyorlar:
            <span className="mt-2 block text-muted-foreground/60">
              &ldquo;İyi bir doktor öner&rdquo;
            </span>
            <span className="mt-2 block font-bold">Seni öneriyor mu?</span>
          </h1>

          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Adını veya firmanı yaz.
            <span className="font-medium text-foreground">
              {" "}30 saniyede öğren. Ücretsiz.
            </span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <FreeToolWidget />
      </section>
    </>
  );
}
