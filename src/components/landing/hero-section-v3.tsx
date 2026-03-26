"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFadeIn } from "@/hooks/use-fade-in";

type DoorType = "firma" | "kisi" | "eticaret" | "export";

const DOORS: { type: DoorType; emoji: string; label: string; sub: string }[] = [
  { type: "firma", emoji: "🏢", label: "Firma", sub: "Marka görünürlüğü" },
  { type: "kisi", emoji: "👤", label: "Kişi", sub: "Kişisel marka" },
  { type: "eticaret", emoji: "🛒", label: "E-Ticaret", sub: "Ürün takibi" },
  { type: "export", emoji: "🌍", label: "Export", sub: "Uluslararası" },
];

const AI_CHIPS = [
  { letter: "G", name: "ChatGPT" },
  { letter: "G", name: "Gemini" },
  { letter: "A", name: "AI Overview" },
  { letter: "P", name: "Perplexity" },
  { letter: "C", name: "Claude" },
  { letter: "C", name: "Copilot" },
];

const EXPORT_MARKETS = [
  { value: "", label: "Hedef Pazar" },
  { value: "uk", label: "🇬🇧 İngiltere" },
  { value: "de", label: "🇩🇪 Almanya" },
  { value: "ae", label: "🇦🇪 BAE" },
  { value: "us", label: "🇺🇸 ABD" },
  { value: "ru", label: "🇷🇺 Rusya" },
  { value: "fr", label: "🇫🇷 Fransa" },
];

export function HeroSectionV3() {
  const ref = useFadeIn<HTMLElement>();
  const router = useRouter();
  const [activeDoor, setActiveDoor] = useState<DoorType>("firma");
  const [firmaInput, setFirmaInput] = useState("");
  const [kisiInput, setKisiInput] = useState("");
  const [eticaretInput, setEticaretInput] = useState("");
  const [exportInput, setExportInput] = useState("");
  const [exportMarket, setExportMarket] = useState("");

  const handleSubmit = () => {
    switch (activeDoor) {
      case "firma":
        if (!firmaInput.trim()) return;
        router.push(`/analiz?type=firma&domain=${encodeURIComponent(firmaInput.trim())}`);
        break;
      case "kisi":
        if (!kisiInput.trim()) return;
        router.push(`/analiz?type=kisi&name=${encodeURIComponent(kisiInput.trim())}`);
        break;
      case "eticaret":
        if (!eticaretInput.trim()) return;
        router.push(`/analiz?type=eticaret&url=${encodeURIComponent(eticaretInput.trim())}`);
        break;
      case "export":
        if (!exportInput.trim()) return;
        router.push(`/analiz?type=export&domain=${encodeURIComponent(exportInput.trim())}&market=${encodeURIComponent(exportMarket)}`);
        break;
    }
  };

  return (
    <section ref={ref} className="fi-section pt-[140px] pb-[60px] px-5 sm:px-10">
      <div className="relative max-w-[1120px] mx-auto">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.14em] mb-3.5">
          Generative Engine Optimization
        </div>
        <h1
          className="font-extrabold leading-none mb-5 max-w-[600px]"
          style={{
            fontSize: "clamp(36px, 5.5vw, 62px)",
            letterSpacing: "-0.045em",
          }}
        >
          Yapay zeka
          <br />
          sizi öneriyor
          <br />
          <span className="text-zinc-300">mu?</span>
        </h1>
        <p className="text-[16px] text-zinc-500 leading-[1.65] max-w-[440px] mb-9">
          ChatGPT, Gemini, Perplexity ve Google AI Overview — müşterileriniz artık bu platformlara soruyor. Sizi buluyorlar mı?
        </p>

        {/* 4 Door Selector */}
        <div className="flex gap-2 mb-5 flex-wrap max-w-[560px]">
          {DOORS.map((door) => (
            <button
              key={door.type}
              onClick={() => setActiveDoor(door.type)}
              className={`flex-1 min-w-[120px] py-3.5 px-2.5 border-[1.5px] rounded-[11px] text-center text-[12px] font-semibold leading-[1.4] cursor-pointer transition-all ${
                activeDoor === door.type
                  ? "border-[#09090B] bg-[#09090B] text-white"
                  : "border-zinc-200 bg-white text-[#09090B] hover:border-zinc-300"
              }`}
            >
              {door.emoji} {door.label}
              <span className={`block text-[10px] font-normal mt-0.5 ${activeDoor === door.type ? "opacity-60" : "opacity-55"}`}>
                {door.sub}
              </span>
            </button>
          ))}
        </div>

        {/* Firma Input */}
        {activeDoor === "firma" && (
          <div className="flex max-w-[440px] border-[1.5px] border-zinc-200 rounded-[11px] p-1 focus-within:border-[#09090B] transition-colors">
            <input
              type="text"
              value={firmaInput}
              onChange={(e) => setFirmaInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="firmaniz.com"
              className="flex-1 border-none outline-none px-3.5 py-3 text-[14px] bg-transparent text-[#09090B] placeholder:text-zinc-300"
            />
            <button
              onClick={handleSubmit}
              className="bg-[#09090B] text-white px-[22px] py-3 rounded-lg border-none text-[13px] font-semibold cursor-pointer whitespace-nowrap"
            >
              Analiz Et
            </button>
          </div>
        )}

        {/* Kişi Input */}
        {activeDoor === "kisi" && (
          <div className="flex max-w-[440px] border-[1.5px] border-zinc-200 rounded-[11px] p-1 focus-within:border-[#09090B] transition-colors">
            <input
              type="text"
              value={kisiInput}
              onChange={(e) => setKisiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Ad Soyad"
              className="flex-1 border-none outline-none px-3.5 py-3 text-[14px] bg-transparent text-[#09090B] placeholder:text-zinc-300"
            />
            <button
              onClick={handleSubmit}
              className="bg-[#09090B] text-white px-[22px] py-3 rounded-lg border-none text-[13px] font-semibold cursor-pointer whitespace-nowrap"
            >
              Analiz Et
            </button>
          </div>
        )}

        {/* E-Ticaret Input */}
        {activeDoor === "eticaret" && (
          <div className="flex max-w-[440px] border-[1.5px] border-zinc-200 rounded-[11px] p-1 focus-within:border-[#09090B] transition-colors">
            <input
              type="text"
              value={eticaretInput}
              onChange={(e) => setEticaretInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Trendyol veya Hepsiburada ürün linki"
              className="flex-1 border-none outline-none px-3.5 py-3 text-[14px] bg-transparent text-[#09090B] placeholder:text-zinc-300"
            />
            <button
              onClick={handleSubmit}
              className="bg-[#09090B] text-white px-[22px] py-3 rounded-lg border-none text-[13px] font-semibold cursor-pointer whitespace-nowrap"
            >
              Analiz Et
            </button>
          </div>
        )}

        {/* Export Input */}
        {activeDoor === "export" && (
          <div className="flex max-w-[440px] border-[1.5px] border-zinc-200 rounded-[11px] p-1 focus-within:border-[#09090B] transition-colors">
            <input
              type="text"
              value={exportInput}
              onChange={(e) => setExportInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="firmaniz.com"
              className="flex-1 border-none outline-none px-3.5 py-3 text-[14px] bg-transparent text-[#09090B] placeholder:text-zinc-300"
            />
            <select
              value={exportMarket}
              onChange={(e) => setExportMarket(e.target.value)}
              className="border-none outline-none text-zinc-400 text-[12px] min-w-[110px] cursor-pointer bg-transparent"
            >
              {EXPORT_MARKETS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <button
              onClick={handleSubmit}
              className="bg-[#09090B] text-white px-[22px] py-3 rounded-lg border-none text-[13px] font-semibold cursor-pointer whitespace-nowrap"
            >
              Analiz Et
            </button>
          </div>
        )}

        <p className="text-[11px] text-zinc-400 mt-2.5 max-w-[440px]">
          SMS doğrulama · Tüm AI platformları · Ücretsiz · Kredi kartı gerekmez
        </p>

        {/* AI Chips */}
        <div className="flex gap-4 mt-10 flex-wrap items-center">
          {AI_CHIPS.map((chip, i) => (
            <div key={i} className="flex items-center gap-[5px] text-[11px] text-zinc-400 font-medium">
              <div className="w-4 h-4 rounded border-[1.5px] border-zinc-200 flex items-center justify-center text-[7px] font-extrabold text-zinc-500">
                {chip.letter}
              </div>
              {chip.name}
            </div>
          ))}
        </div>

        {/* Hero visual placeholder */}
        <div className="absolute right-0 sm:right-10 top-[20px] w-[420px] h-[320px] border border-zinc-100 rounded-2xl bg-zinc-50 hidden lg:flex items-center justify-center text-zinc-300 text-[13px] font-medium">
          Dashboard Görsel Alanı
        </div>
      </div>
    </section>
  );
}
