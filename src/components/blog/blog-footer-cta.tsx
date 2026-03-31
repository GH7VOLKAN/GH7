import Link from "next/link";

const DOORS = [
  { id: "firma", label: "Firma Analizi", desc: "Markaniz AI'da nasil gorunuyor?" },
  { id: "kisi", label: "Kisi Analizi", desc: "Adiniz AI'da nasil geciyor?" },
  { id: "eticaret", label: "E-Ticaret Analizi", desc: "Urununuz oneriliyor mu?" },
  { id: "export", label: "Export Analizi", desc: "Yabancilar sizi buluyor mu?" },
];

export function BlogFooterCTA() {
  return (
    <div className="bg-[#09090B] rounded-2xl p-8 md:p-12 mt-12">
      <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2">
        Bu siralamada yerinizi merak ediyor musunuz?
      </h2>
      <p className="text-sm text-zinc-400 mb-8 max-w-lg">
        Yapay zekanin markanizi, adinizi veya urununuzu nasil gordugunu 60 saniyede ogrenin.
        Ucretsiz, kayit gerektirmez.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {DOORS.map((door) => (
          <Link
            key={door.id}
            href={`/analiz?type=${door.id}`}
            className="bg-zinc-800 hover:bg-zinc-700 rounded-xl p-4 transition-colors group"
          >
            <div className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">
              {door.label}
            </div>
            <div className="text-xs text-zinc-500 mt-1">{door.desc}</div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-zinc-600 mt-6 text-center">
        Ucretsiz · 60 saniye · Tum platformlar
      </p>
    </div>
  );
}
