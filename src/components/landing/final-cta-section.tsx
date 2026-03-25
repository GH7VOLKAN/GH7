"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFadeIn } from "@/hooks/use-fade-in";

export function FinalCtaSection() {
  const ref = useFadeIn<HTMLElement>();
  const router = useRouter();
  const [selected, setSelected] = useState<"firma" | "kisisel" | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    if (!selected || !inputValue.trim()) return;
    if (selected === "firma") {
      router.push(`/analiz?type=firma&domain=${encodeURIComponent(inputValue.trim())}`);
    } else {
      router.push(`/analiz?type=kisisel&name=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  return (
    <section ref={ref} className="fi-section bg-[#09090B] text-white py-[72px] sm:py-[120px] px-5 sm:px-10 text-center">
      <h2
        className="font-extrabold text-white leading-[1.08] max-w-[560px] mx-auto mb-4"
        style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: "-0.035em" }}
      >
        Yapay zekanın
        <br />
        sizi tanımasını sağlayın
      </h2>
      <p className="text-[15px] text-zinc-600 leading-[1.7] max-w-[520px] mx-auto mb-10">
        60 saniyede AI görünürlüğünüzü öğrenin. Ücretsiz.
      </p>

      {/* Dual selection cards */}
      <div className="flex gap-3 max-w-[420px] mx-auto mb-4">
        <button
          onClick={() => { setSelected("firma"); setInputValue(""); }}
          className={`flex-1 border rounded-[14px] p-4 text-left transition-all cursor-pointer ${
            selected === "firma"
              ? "border-zinc-500 bg-zinc-900"
              : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
          }`}
        >
          <div className="text-[20px] mb-1">🏢</div>
          <div className="text-[14px] font-bold text-white">Firmamı Test Et</div>
          <div className="text-[12px] text-zinc-500 mt-0.5">Şirket, marka, işletme</div>
        </button>
        <button
          onClick={() => { setSelected("kisisel"); setInputValue(""); }}
          className={`flex-1 border rounded-[14px] p-4 text-left transition-all cursor-pointer ${
            selected === "kisisel"
              ? "border-zinc-500 bg-zinc-900"
              : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
          }`}
        >
          <div className="text-[20px] mb-1">👤</div>
          <div className="text-[14px] font-bold text-white">Kendi Adımı Test Et</div>
          <div className="text-[12px] text-zinc-500 mt-0.5">Doktor, avukat, danışman</div>
        </button>
      </div>

      {selected && (
        <div className="flex max-w-[420px] mx-auto border-[1.5px] border-zinc-700 rounded-xl p-1 focus-within:border-zinc-500 transition-colors">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={selected === "firma" ? "firmanız.com" : "Adınız Soyadınız"}
            className="flex-1 border-none outline-none px-4 py-[13px] text-[15px] bg-transparent text-white placeholder:text-zinc-700"
          />
          <button
            onClick={handleSubmit}
            className="bg-white text-[#09090B] px-6 py-[13px] rounded-[9px] text-[14px] font-semibold whitespace-nowrap cursor-pointer border-none"
          >
            Analiz Et
          </button>
        </div>
      )}

      <p className="text-[12px] text-zinc-700 mt-6">
        Bir ISITMAX projesidir · 1M+ aylık ziyaretçinin arkasındaki ekip
      </p>
    </section>
  );
}
