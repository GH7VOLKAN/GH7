import { PenLineIcon, EyeIcon, WrenchIcon } from "lucide-react";

const steps = [
  {
    icon: PenLineIcon,
    step: "1",
    title: "Adını yaz",
    desc: "30 saniyede 4 yapay zekaya sorarız.",
  },
  {
    icon: EyeIcon,
    step: "2",
    title: "Sonucu gör",
    desc: "Seni tanıyor mu, ne diyor, senin yerine kimi öneriyor.",
  },
  {
    icon: WrenchIcon,
    step: "3",
    title: "Düzelt",
    desc: "Ne yapman gerektiğini söyleriz. İstersen biz yaparız.",
  },
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Nasıl Çalışır
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] sm:text-3xl lg:text-4xl">
            Üç adımda öğren
          </h2>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-16">
          {steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-foreground text-background">
                  <Icon className="size-6" />
                </div>

                {i < steps.length - 1 && (
                  <div className="absolute top-7 left-[calc(50%+36px)] hidden h-px w-[calc(100%-72px)] bg-border sm:block" />
                )}

                <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
