"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFadeIn } from "@/hooks/use-fade-in";

const AI_PLATFORMS = [
  { name: "ChatGPT", letter: "G", color: "#10A37F" },
  { name: "Gemini", letter: "G", color: "#8B5CF6" },
  { name: "AI Overview", letter: "G", color: "#4285F4" },
  { name: "Perplexity", letter: "P", color: "#22D3EE" },
  { name: "Claude", letter: "C", color: "#D97706" },
  { name: "Copilot", letter: "C", color: "#00BCF2" },
];

export function HeroSectionV3() {
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
    <section
      ref={ref}
      className="fi-section pt-[120px] sm:pt-[150px] pb-[60px] sm:pb-20 px-5 sm:px-10 max-w-[1120px] mx-auto"
    >
      <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-4">
        Generative Engine Optimization
      </div>
      <h1
        className="font-extrabold leading-[0.97] mb-6 max-w-[720px]"
        style={{
          fontSize: "clamp(40px, 6.2vw, 72px)",
          letterSpacing: "-0.045em",
        }}
      >
        Yapay zeka
        <br />
        sizi oneriyor mu<span className="text-zinc-300">?</span>
      </h1>
      <p className="text-[17px] text-zinc-500 leading-[1.65] max-w-[480px] mb-10">
        ChatGPT, Gemini, Perplexity ve Google AI Overview — musterileriniz artik bu platformlara soruyor. Sizi buluyorlar mi, yoksa rakibinizi mi?
      </p>

      {/* Dual selection cards */}
      <div className="flex gap-3 max-w-[480px] mb-4">
        <button
          onClick={() => { setSelected("firma"); setInputValue(""); }}
          className={`flex-1 border rounded-[14px] p-4 text-left transition-all cursor-pointer ${
            selected === "firma"
              ? "border-zinc-900 bg-white"
              : "border-zinc-200 bg-white hover:border-zinc-300"
          }`}
        >
          <div className="text-[20px] mb-1">🏢</div>
          <div className="text-[14px] font-bold text-[#09090B]">Firmami Test Et</div>
          <div className="text-[12px] text-zinc-400 mt-0.5">Sirket, marka, isletme</div>
        </button>
        <button
          onClick={() => { setSelected("kisisel"); setInputValue(""); }}
          className={`flex-1 border rounded-[14px] p-4 text-left transition-all cursor-pointer ${
            selected === "kisisel"
              ? "border-zinc-900 bg-white"
              : "border-zinc-200 bg-white hover:border-zinc-300"
          }`}
        >
          <div className="text-[20px] mb-1">👤</div>
          <div className="text-[14px] font-bold text-[#09090B]">Kendi Adimi Test Et</div>
          <div className="text-[12px] text-zinc-400 mt-0.5">Doktor, avukat, danisman</div>
        </button>
      </div>

      {/* Input area - appears when a card is selected */}
      {selected && (
        <div className="flex max-w-[420px] border-[1.5px] border-zinc-200 rounded-xl p-1 focus-within:border-[#09090B] transition-colors mb-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={selected === "firma" ? "firmaniz.com" : "Adiniz Soyadiniz"}
            className="flex-1 border-none outline-none px-4 py-[13px] text-[15px] bg-transparent placeholder:text-zinc-300"
          />
          <button
            onClick={handleSubmit}
            className="bg-[#09090B] text-white px-6 py-[13px] rounded-[9px] text-[14px] font-semibold whitespace-nowrap cursor-pointer border-none"
          >
            Ucretsiz Analiz
          </button>
        </div>
      )}

      <p className="text-[12px] text-zinc-400 mt-3">
        SMS dogrulama · Tum platformlar · Kredi karti gerekmez
      </p>

      {/* AI platform chips */}
      <div className="flex items-center gap-6 mt-12 flex-wrap">
        <span className="text-[11px] text-zinc-400 font-medium mr-1">
          Takip ettigimiz platformlar:
        </span>
        {AI_PLATFORMS.map((p) => (
          <div key={p.name} className="flex items-center gap-1.5 text-[12px] text-zinc-400 font-medium">
            <div
              className="w-5 h-5 rounded-[5px] flex items-center justify-center text-[8px] font-extrabold text-white"
              style={{ backgroundColor: p.color }}
            >
              {p.letter}
            </div>
            {p.name}
          </div>
        ))}
      </div>
    </section>
  );
}
