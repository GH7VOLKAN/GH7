import { XIcon, CheckIcon } from "lucide-react";

const oldWays = [
  { text: "Google'a reklam ver", note: null },
  { text: "Anahtar kelime doldur", note: "%10 azaltıyor" },
  { text: "Link satın al", note: null },
];

const newWays = [
  { text: "Bilgilerini yapılandır", note: null },
  { text: "Sık sorulan sorulara cevap ver", note: "%25 artış" },
  { text: "Güvenilir kaynaklarda adın geçsin", note: "%30 artış" },
  { text: "Rakamlarla konuş", note: "%35 artış" },
  { text: "Profillerini güncel tut", note: null },
];

export function OldVsNewSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-[-0.03em] sm:text-3xl lg:text-4xl">
          Neler işe yarıyor, neler yaramıyor?
        </h2>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
          {/* Eski yol */}
          <div className="rounded-2xl border border-border p-6 sm:p-8">
            <p className="text-sm font-bold text-red-500">
              Eski yol — işe yaramıyor
            </p>
            <div className="mt-6 space-y-4">
              {oldWays.map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <XIcon className="mt-0.5 size-4 shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {item.text}
                    </p>
                    {item.note && (
                      <p className="mt-0.5 text-xs font-medium text-red-500">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yeni yol */}
          <div className="rounded-2xl border-2 border-foreground bg-foreground/[0.02] p-6 sm:p-8">
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              Yeni yol — kanıtlanmış
            </p>
            <div className="mt-6 space-y-4">
              {newWays.map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
                  <div>
                    <p className="text-sm">{item.text}</p>
                    {item.note && (
                      <p className="mt-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Princeton araştırması: Yeni yöntemler görünürlüğü{" "}
          <span className="font-medium text-foreground">%40 artırıyor.</span>{" "}
          Eski yöntemler{" "}
          <span className="font-medium text-red-500">%10 azaltıyor.</span>
        </p>
      </div>
    </section>
  );
}
