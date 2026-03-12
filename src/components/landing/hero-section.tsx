import { GH7Icon } from "@/components/gh7-icon";
import { FreeToolWidget } from "@/components/free-tool/free-tool-widget";

export function HeroSection() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28 sm:pb-12 lg:px-8">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <GH7Icon size={14} className="text-foreground" />
            Yapay Zeka Görünürlüğü
          </div>

          <h1 className="text-4xl font-light tracking-[-0.04em] sm:text-5xl md:text-6xl lg:text-7xl">
            Yapay Zeka Seni
            <span className="block font-bold">Tanıyor mu?</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Müşterilerin artık yapay zekaya soruyor. Seni öneriyorlar mı?
            <span className="font-medium text-foreground"> 30 saniyede öğren.</span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <FreeToolWidget />
      </section>
    </>
  );
}
